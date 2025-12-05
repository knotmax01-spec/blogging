import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-teal-900 mb-2">AI Blog Automation Dashboard</h1>
            <p className="text-teal-700">Monitor and control automated blog post generation</p>
          </div>
          <Link
            to="/"
            className="inline-block text-teal-600 hover:text-teal-800 font-bold transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800">
          <span className="font-semibold">⚠️ Error:</span> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-800">
          <span className="font-semibold">✓ Success:</span> {success}
        </div>
      )}

      {/* Scheduler Status */}
      {schedulerStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scheduler Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Status:</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                  {schedulerStatus.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Timezone:</span>
                <span className="text-gray-900">{schedulerStatus.timezone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Trend Analysis:</span>
                <span className="text-gray-900">{schedulerStatus.trendAnalysisTime}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Publication Schedule</h2>
            <div className="space-y-2">
              {schedulerStatus.scheduleTimes.map((time, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-teal-50 p-3 rounded-lg">
                  <span className="text-teal-600 font-bold">📰</span>
                  <span className="text-gray-800 font-semibold">{time} UTC</span>
                  <span className="text-xs text-gray-500 ml-auto">Post {idx + 1}/3</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-teal-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Total Posts</p>
            <div className="text-3xl font-bold text-teal-600">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500">
            <p className="text-gray-600 text-sm font-medium mb-1">AI Generated</p>
            <div className="text-3xl font-bold text-emerald-600">{stats.aiGenerated}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-cyan-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Manual Posts</p>
            <div className="text-3xl font-bold text-cyan-600">{stats.manual}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Avg Words</p>
            <div className="text-3xl font-bold text-blue-600">{Math.round(stats.avgWordCount)}</div>
          </div>
        </div>
      )}

      {/* Manual Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={handleTriggerAnalysis}
          disabled={isAnalyzing}
          className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl transition disabled:opacity-50"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📊</div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900">Analyze Trends</h3>
              <p className="text-gray-600 text-sm">Manually trigger trending topic analysis</p>
            </div>
            <button
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {isAnalyzing ? '⏳' : '▶️'}
            </button>
          </div>
        </button>

        <button
          onClick={handleGeneratePost}
          disabled={isGenerating || pendingTopics.length === 0}
          className="bg-white rounded-xl shadow-lg p-6 border-2 border-teal-200 hover:border-teal-400 hover:shadow-xl transition disabled:opacity-50"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">✍️</div>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900">Generate Post</h3>
              <p className="text-gray-600 text-sm">Create blog post from pending topic</p>
            </div>
            <button
              onClick={handleGeneratePost}
              disabled={isGenerating || pendingTopics.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {isGenerating ? '⏳' : '▶️'}
            </button>
          </div>
        </button>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Trending Healthcare Topics</h2>

        {/* Pending Topics */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-sm font-bold">
              {pendingTopics.length} Pending
            </span>
          </h3>
          {pendingTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTopics.map(topic => (
                <div
                  key={topic._id}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900 flex-1">{topic.topic}</h4>
                    <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                      {topic.relevanceScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{topic.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="capitalize">{topic.trend}</span>
                    <span>{new Date(topic.discoveredAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 font-semibold">No pending topics. Run trend analysis to discover new topics!</p>
            </div>
          )}
        </div>

        {/* Processed Topics */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-bold">
              {trendingTopics.filter(t => t.isProcessed).length} Processed
            </span>
          </h3>
          {trendingTopics.filter(t => t.isProcessed).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingTopics
                .filter(t => t.isProcessed)
                .slice(0, 6)
                .map(topic => (
                  <div
                    key={topic._id}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 flex-1">{topic.topic}</h4>
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{topic.description}</p>
                    <div className="text-xs text-gray-600">
                      Published: {new Date(topic.processedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 font-semibold">No processed topics yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
