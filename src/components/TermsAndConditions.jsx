import { Link } from 'react-router-dom';

function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200 mb-10">
        <h1 className="text-5xl font-bold text-teal-900 mb-4">Terms and Conditions</h1>
        <p className="text-teal-700 text-lg">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <article className="bg-white rounded-2xl shadow-lg p-10 space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using this Health Blog platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. We reserve the right to make changes to these terms at any time. Your continued use of the platform following the posting of revised Terms and Conditions means that you accept and agree to the changes.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Use License</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Permission is granted to temporarily download one copy of the materials (information or software) on the Health Blog platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the platform</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            <li>Violating any applicable laws or regulations</li>
            <li>Using the platform for any illegal or unauthorized purpose</li>
            <li>Harassing, abusing, or threatening other users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The materials on the Health Blog platform are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <p className="text-amber-900 font-semibold mb-2">⚠️ Medical Disclaimer</p>
            <p className="text-amber-800">
              The health information, articles, and content provided on this platform are for educational and informational purposes only and should not be construed as professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional before making any health-related decisions. Never disregard professional medical advice or delay seeking treatment based on information found on this platform.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Limitations of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            In no event shall the Health Blog platform or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Health Blog platform, even if we have been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
          <p className="text-gray-700 leading-relaxed">
            The materials appearing on the Health Blog platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials on the platform are accurate, complete, or current. We may make changes to the materials contained on the platform at any time without notice.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Materials and Content</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Health Blog platform does not monitor or control the content posted by users. You are solely responsible for:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>The content you create, publish, and share on the platform</li>
            <li>Ensuring your content is accurate, ethical, and legal</li>
            <li>Not posting content that violates any laws or third-party rights</li>
            <li>Not posting content that is harassing, defamatory, or offensive</li>
            <li>Obtaining necessary permissions for medical information and images</li>
            <li>Complying with all applicable healthcare regulations and standards</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            We reserve the right to remove any content that violates these terms or applicable laws, and to suspend or terminate user accounts that repeatedly violate our policies.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Links to Third-Party Websites</h2>
          <p className="text-gray-700 leading-relaxed">
            The Health Blog platform may contain links to third-party websites and resources. We are not responsible for the content, accuracy, or practices of external sites. Your use of third-party websites is at your own risk and subject to their terms and conditions. We do not endorse any third-party websites or products mentioned on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Modifications to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to modify these terms and conditions at any time without notice. By continuing to use the platform after any such modifications, you indicate your acceptance of the modified terms. It is your responsibility to review these terms periodically for updates.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of the applicable jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts located in that jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">10. User Conduct</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree not to use the platform in any way that:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Violates any applicable law, statute, or regulation</li>
            <li>Infringes upon any intellectual property rights of others</li>
            <li>Defames, harasses, or abuses other users or individuals</li>
            <li>Spreads misinformation or false health claims</li>
            <li>Attempts to gain unauthorized access to systems or data</li>
            <li>Disrupts the normal flow of conversation within the platform</li>
            <li>Engages in commercial activities without authorization</li>
            <li>Impersonates any person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Intellectual Property Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            Unless otherwise stated, the Health Blog platform and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved. You may access and print pages from the platform for personal, non-commercial use, subject to restrictions set in these terms and conditions.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Account Responsibility</h2>
          <p className="text-gray-700 leading-relaxed">
            If you create an account on our platform, you are responsible for:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access to your account</li>
            <li>Providing accurate and truthful information during registration</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">13. Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to terminate or suspend your account and access to the platform at any time, for any reason, including if we believe you have violated these terms and conditions or any applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have questions about these Terms and Conditions, please contact us at:
          </p>
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6">
            <p className="text-gray-800 font-semibold mb-3">Health Blog Legal Team</p>
            <p className="text-gray-700">Email: legal@healthblog.com</p>
            <p className="text-gray-700">Address: Terms Inquiry, Health Blog Platform</p>
            <p className="text-gray-700">Response Time: We aim to respond to all legal inquiries within 30 days</p>
          </div>
        </section>

        <section className="bg-teal-50 border-2 border-teal-200 rounded-xl p-6 mt-8">
          <h3 className="text-xl font-bold text-teal-900 mb-3">✓ Your Understanding</h3>
          <p className="text-teal-800">
            By using the Health Blog platform, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them. If you do not agree with any part of these terms, please discontinue your use of the platform immediately.
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

export default TermsAndConditions;
