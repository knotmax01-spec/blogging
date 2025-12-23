import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200 mb-10">
        <h1 className="text-5xl font-bold text-teal-900 mb-4">Privacy Policy</h1>
        <p className="text-teal-700 text-lg">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <article className="bg-white rounded-2xl shadow-lg p-10 space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to Health Blog. We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Personal Information</h3>
              <p className="text-gray-700 leading-relaxed">
                When you create content or interact with our platform, we may collect:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3 ml-4">
                <li>Name and contact information</li>
                <li>Email address for account creation and communication</li>
                <li>Profile information and authored content</li>
                <li>Comments and feedback you provide</li>
                <li>User preferences and settings</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Automatic Information</h3>
              <p className="text-gray-700 leading-relaxed">
                We automatically collect certain information when you visit our website:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3 ml-4">
                <li>Browser type and operating system</li>
                <li>IP address and device information</li>
                <li>Pages viewed and time spent on site</li>
                <li>Referring website information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the information we collect for various purposes:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>To provide, maintain, and improve our services</li>
            <li>To create and manage your account and content</li>
            <li>To respond to your inquiries and support requests</li>
            <li>To analyze user behavior and platform performance</li>
            <li>To send you updates, newsletters, and promotional content</li>
            <li>To comply with legal obligations and prevent fraud</li>
            <li>To personalize your user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption and security protocols. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Information Sharing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>With service providers who assist us in operating our website and conducting our business</li>
            <li>When required by law or court order</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with a merger, acquisition, or sale of assets</li>
            <li>With your explicit consent or direction</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies and similar tracking technologies to enhance your experience on our platform. These tools help us understand user preferences, track usage patterns, and improve our services. You can control cookie preferences through your browser settings, though some features may not function properly if cookies are disabled.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Third-Party Links</h2>
          <p className="text-gray-700 leading-relaxed">
            Our website may contain links to third-party websites and services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing personal information or using their services.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete such information and any related accounts.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Your Rights and Choices</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Right to access your personal information</li>
            <li>Right to correct or update inaccurate data</li>
            <li>Right to request deletion of your data</li>
            <li>Right to opt-out of marketing communications</li>
            <li>Right to data portability</li>
            <li>Right to restrict processing of your information</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            To exercise any of these rights, please contact us at the information provided below.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Policy Updates</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, and other factors. We will notify you of any material changes by updating the "Last updated" date and, in some cases, by providing additional notice. Your continued use of our platform following the posting of revised Privacy Policy means that you accept and agree to the changes.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 mt-4">
            <p className="text-gray-800 font-semibold mb-3">Health Blog Privacy Team</p>
            <p className="text-gray-700">Email: privacy@healthblog.com</p>
            <p className="text-gray-700">Address: Privacy Inquiry, Health Blog Platform</p>
            <p className="text-gray-700">Response Time: We aim to respond to all privacy inquiries within 30 days</p>
          </div>
        </section>

        <section className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 mt-8">
          <h3 className="text-xl font-bold text-teal-900 mb-3">📋 Your Privacy Matters</h3>
          <p className="text-teal-800">
            We are committed to being transparent about how we handle your data. If you have concerns about our privacy practices or believe your rights have been violated, please don't hesitate to contact us.
          </p>
        </section>
      </article>

      <div className="mt-10 text-center">
        <Link 
          to="/" 
          className="inline-block bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
