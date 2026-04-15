import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Sparkles, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { adminAPI, blogAPI } from '../services/api';

function AdminDashboard() {
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [pendingTopics, setPendingTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadDashboardData() {
    try {
      setError(null);
      const [scheduler, trends, stats] = await Promise.all([
        adminAPI.getSchedulerStatus(),
        adminAPI.getTrendingTopics('all'),
        blogAPI.getStats(),
      ]);

      setSchedulerStatus(scheduler);
      setTrendingTopics(trends.topics || []);
      setPendingTopics((trends.topics || []).filter(t => !t.isProcessed));
      setStats(stats);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleTriggerAnalysis() {
    try {
      setIsAnalyzing(true);
      setError(null);
      const result = await adminAPI.triggerTrendAnalysis();
      setSuccess('Trend analysis triggered successfully!');
      setTimeout(() => loadDashboardData(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGeneratePost() {
    try {
      setIsGenerating(true);
      setError(null);
      const result = await adminAPI.triggerPostGeneration();
      setSuccess('Blog post generated and published!');
      setTimeout(() => loadDashboardData(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600 mb-4" />
          <p className="text-gray-500 text-sm">Loading AI dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !schedulerStatus && !stats) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Backend Not Connected</h2>
        <p className="text-gray-500 text-sm mb-6">
          The AI automation backend is not running. Start the backend server to use these features.
        </p>
        <code className="bg-gray-100 text-gray-700 text-xs px-4 py-2 rounded-lg block max-w-xs mx-auto mb-6">
          npm run dev:backend
        </code>
        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:underline font-semibold text-sm">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Automation Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor and control automated blog post generation</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition font-medium">
          <ArrowLeft size={15} /> Back
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle size={16} className="flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Scheduler Status */}
      {schedulerStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Scheduler Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold text-xs">
                  {schedulerStatus.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Timezone</span>
                <span className="text-gray-800 font-medium">{schedulerStatus.timezone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Trend Analysis</span>
                <span className="text-gray-800 font-medium">{schedulerStatus.trendAnalysisTime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Publication Schedule</h2>
            <div className="space-y-2">
              {schedulerStatus.scheduleTimes.map((time, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-teal-50 px-3 py-2 rounded-lg text-sm">
                  <Clock size={13} className="text-teal-600" />
                  <span className="font-medium text-gray-800">{time} UTC</span>
                  <span className="ml-auto text-xs text-gray-500">Post {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 border-t-4 border-t-teal-400">
            <p className="text-xs text-gray-500 font-medium mb-1">Total Posts</p>
            <p className="text-3xl font-bold text-teal-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 border-t-4 border-t-emerald-400">
            <p className="text-xs text-gray-500 font-medium mb-1">AI Generated</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.aiGenerated}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 border-t-4 border-t-cyan-400">
            <p className="text-xs text-gray-500 font-medium mb-1">Manual Posts</p>
            <p className="text-3xl font-bold text-cyan-600">{stats.manual}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 border-t-4 border-t-blue-400">
            <p className="text-xs text-gray-500 font-medium mb-1">Avg Words</p>
            <p className="text-3xl font-bold text-blue-600">{Math.round(stats.avgWordCount)}</p>
          </div>
        </div>
      )}

      {/* Manual Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="bg-teal-50 text-teal-600 rounded-xl p-3">
            <TrendingUp size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Analyze Trends</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manually trigger trending topic analysis</p>
          </div>
          <button
            onClick={handleTriggerAnalysis}
            disabled={isAnalyzing}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50"
          >
            {isAnalyzing ? 'Running...' : 'Run'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 rounded-xl p-3">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm">Generate Post</h3>
            <p className="text-xs text-gray-500 mt-0.5">Create a blog post from a pending topic</p>
          </div>
          <button
            onClick={handleGeneratePost}
            disabled={isGenerating || pendingTopics.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Trending Healthcare Topics</h2>

        {/* Pending Topics */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-gray-700">Pending</h3>
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pendingTopics.length}
            </span>
          </div>
          {pendingTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingTopics.map(topic => (
                <div key={topic._id} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h4 className="font-semibold text-gray-900 text-sm flex-1">{topic.topic}</h4>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex-shrink-0">
                      {topic.relevanceScore}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{topic.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="capitalize">{topic.trend}</span>
                    <span>{new Date(topic.discoveredAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No pending topics. Run trend analysis to discover new topics.</p>
          )}
        </div>

        {/* Processed Topics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-gray-700">Processed</h3>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {trendingTopics.filter(t => t.isProcessed).length}
            </span>
          </div>
          {trendingTopics.filter(t => t.isProcessed).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trendingTopics.filter(t => t.isProcessed).slice(0, 6).map(topic => (
                <div key={topic._id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h4 className="font-semibold text-gray-900 text-sm flex-1">{topic.topic}</h4>
                    <CheckCircle size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{topic.description}</p>
                  <p className="text-xs text-gray-400">Published {new Date(topic.processedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No processed topics yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
