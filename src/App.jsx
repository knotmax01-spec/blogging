import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import BlogLibrary from './components/BlogLibrary';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center space-x-2 hover:opacity-80 transition">
              <span className="text-2xl">✍️</span>
              <span>Blog Generator</span>
            </Link>
            <div className="flex items-center space-x-8">
              <Link to="/" className={`text-sm font-medium transition-all duration-200 ${isActive('/') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}>
                Dashboard
              </Link>
              <Link to="/library" className={`text-sm font-medium transition-all duration-200 ${isActive('/library') ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-blue-600'}`}>
                📚 Blog Library
              </Link>
            </div>
          </div>
          <Link to="/new" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all duration-200 text-sm flex items-center space-x-2">
            <span>✨</span>
            <span>Create Post</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/library" element={<BlogLibrary />} />
          <Route path="/new" element={<BlogEditor />} />
          <Route path="/edit/:id" element={<BlogEditor />} />
          <Route path="/post/:id" element={<BlogDetail />} />
        </Routes>
      </div>
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
