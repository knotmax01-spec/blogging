import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import BlogLibrary from './components/BlogLibrary';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'text-teal-600 font-semibold' : 'text-gray-700';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <nav className="bg-white shadow-lg sticky top-0 z-40 border-b border-teal-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-700 bg-clip-text text-transparent flex items-center space-x-2 hover:opacity-80 transition">
              <span className="text-2xl">⚕️</span>
              <span>Health Blog</span>
            </Link>
            <div className="flex items-center space-x-8">
              <Link to="/" className={`text-sm font-medium transition-all duration-200 ${isActive('/') ? 'text-teal-600 border-b-2 border-teal-600 pb-1' : 'text-gray-600 hover:text-teal-600'}`}>
                Dashboard
              </Link>
              <Link to="/library" className={`text-sm font-medium transition-all duration-200 ${isActive('/library') ? 'text-teal-600 border-b-2 border-teal-600 pb-1' : 'text-gray-600 hover:text-teal-600'}`}>
                📚 Article Library
              </Link>
              <Link to="/admin" className={`text-sm font-medium transition-all duration-200 ${isActive('/admin') ? 'text-teal-600 border-b-2 border-teal-600 pb-1' : 'text-gray-600 hover:text-teal-600'}`}>
                ⚙️ AI Admin
              </Link>
            </div>
          </div>
          <Link to="/new" className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:from-teal-700 hover:to-cyan-800 font-semibold transition-all duration-200 text-sm flex items-center space-x-2">
            <span>📝</span>
            <span>Publish Article</span>
          </Link>
        </div>
      </nav>

      <div className="flex-grow">
        <div className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/library" element={<BlogLibrary />} />
            <Route path="/new" element={<BlogEditor />} />
            <Route path="/edit/:id" element={<BlogEditor />} />
            <Route path="/post/:id" element={<BlogDetail />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
          </Routes>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
