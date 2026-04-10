import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      {/* ClinicStreams CTA Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-800">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">🏥 Streamline Your Clinic Operations with ClinicStreams</p>
            <p className="text-teal-100 text-sm mt-1">Patient management, scheduling, billing & telemedicine — all in one platform.</p>
          </div>
          <a
            href="https://clinicstreams.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:shadow-xl hover:bg-teal-50 transition-all duration-200 text-sm"
          >
            Start Free Trial →
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">⚕️</span>
              <h3 className="text-xl font-bold text-white">ClinicStreams</h3>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Empowering healthcare providers and patients with evidence-based health information. The blogging arm of the ClinicStreams platform.
            </p>
            <a
              href="https://clinicstreams.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-teal-400 hover:text-teal-300 transition font-medium"
            >
              <span>🌐 clinicstreams.com</span>
            </a>
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
              <li>
                <a href="https://clinicstreams.com/features" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-teal-400 transition">
                  ClinicStreams Features
                </a>
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
                <a href="mailto:support@clinicstreams.com" className="text-gray-400 hover:text-teal-400 transition">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:help@clinicstreams.com" className="text-gray-400 hover:text-teal-400 transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="mailto:privacy@clinicstreams.com" className="text-gray-400 hover:text-teal-400 transition">
                  Report Content
                </a>
              </li>
              <li>
                <a href="mailto:feedback@clinicstreams.com" className="text-gray-400 hover:text-teal-400 transition">
                  Send Feedback
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
            &copy; {currentYear} ClinicStreams. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <span className="text-teal-500">⚕️</span>
            <span>Powering modern healthcare with technology & knowledge</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-semibold text-teal-400">Medical Disclaimer:</span> The information provided on this platform is for educational purposes only and should not be considered as medical advice. Always consult with a qualified healthcare professional for medical guidance. ClinicStreams is a healthcare technology platform and not a substitute for professional medical care.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
