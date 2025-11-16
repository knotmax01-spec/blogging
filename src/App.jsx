import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BlogEditor from './components/BlogEditor';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-4xl mx-auto flex justify-between">
            <Link to="/" className="text-xl font-bold">Blog Generator</Link>
            <Link to="/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              New Post
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/new" element={<BlogEditor />} />
            <Route path="/edit/:id" element={<BlogEditor />} />
            <Route path="/post/:id" element={<BlogDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;