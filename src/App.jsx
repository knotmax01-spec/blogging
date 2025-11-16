import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import BlogLibrary from './components/BlogLibrary';

function AppContent() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700';

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center space-x-2">
              <span>✍️</span>
              <span>Blog Generator</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className={`transition ${isActive('/')}`}>
                Dashboard
              </Link>
              <Link to="/library" className={`transition ${isActive('/library')}`}>
                📚 Blog Library
              </Link>
            </div>
          </div>
          <Link to="/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">
            ✨ Create Post
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
