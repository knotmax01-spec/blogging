import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl shadow-xl p-16 border border-gray-100 max-w-lg w-full">
        <div className="text-8xl mb-6 opacity-40">🔍</div>
        <h1 className="text-6xl font-bold text-teal-600 mb-3">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back to the health content you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
          >
            ← Go to Dashboard
          </Link>
          <Link
            to="/library"
            className="bg-teal-50 text-teal-700 border-2 border-teal-200 px-8 py-3 rounded-xl font-bold hover:bg-teal-100 transition-all duration-200"
          >
            📚 Browse Articles
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
