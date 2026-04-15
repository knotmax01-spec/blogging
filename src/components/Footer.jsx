import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">⚕️</span>
              <h3 className="text-xl font-bold text-white">Health Blog</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering individuals with evidence-based health information and wellness insights. Share your health knowledge with the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-teal-400 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-gray-400 hover:text-teal-400 transition">
                  Article Library
                </Link>
              </li>
              <li>
                <Link to="/new" className="text-gray-400 hover:text-teal-400 transition">
                  Publish Article
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-teal-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-teal-400 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a href="mailto:support@healthblog.com" className="text-gray-400 hover:text-teal-400 transition">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Partner Sites */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Partner Sites</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://clinicstreams.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-teal-400 transition flex items-center space-x-2"
                >
                  <span>🏥</span>
                  <span>ClinicStreams</span>
                </a>
              </li>
              <li>
                <a
                  href="https://aazhidigital.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-teal-400 transition flex items-center space-x-2"
                >
                  <span>💡</span>
                  <span>Aazhi Digital</span>
                </a>
              </li>
              <li>
                <a href="mailto:help@healthblog.com" className="text-gray-400 hover:text-teal-400 transition">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {currentYear} Health Blog by{' '}
            <a href="https://clinicstreams.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition">ClinicStreams</a>
            {' '}&amp;{' '}
            <a href="https://aazhidigital.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition">Aazhi Digital</a>
            . All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <span className="text-teal-500">⚕️</span>
            <span>Dedicated to healthy living and evidence-based health information</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-semibold text-teal-400">Disclaimer:</span> The information provided on this platform is for educational purposes only and should not be considered as medical advice. Always consult with a qualified healthcare professional for medical guidance.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
