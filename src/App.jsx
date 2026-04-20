import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Settings, PenSquare } from 'lucide-react';
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

  const navLink = (path) =>
    `flex items-center gap-1.5 text-sm font-medium transition-all duration-200 pb-0.5 ${
      location.pathname === path
        ? 'text-teal-600 border-b-2 border-teal-600'
        : 'text-gray-500 hover:text-teal-600'
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold text-teal-700 flex items-center gap-2 hover:text-teal-800 transition"
            >
              <span className="bg-teal-600 text-white rounded-lg p-1.5 text-sm leading-none">✚</span>
              Health Blog
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/" className={navLink('/')}>
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <Link to="/library" className={navLink('/library')}>
                <BookOpen size={15} />
                Library
              </Link>
              <Link to="/admin" className={navLink('/admin')}>
                <Settings size={15} />
                AI Admin
              </Link>
            </div>
          </div>
          <Link
            to="/new"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            <PenSquare size={15} />
            New Article
          </Link>
        </div>
      </nav>

      <div className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/library" element={<BlogLibrary />} />
            <Route path="/new" element={<BlogEditor />} />
            <Route path="/edit/:id" element={<BlogEditor />} />
            <Route path="/post/:id" element={<BlogDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
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
