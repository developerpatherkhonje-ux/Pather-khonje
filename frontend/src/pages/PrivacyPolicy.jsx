import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Information We Collect",
      icon: Shield,
      content: [
        "Personal information such as name, email address, phone number, and address when you make a booking or inquiry",
        "Payment information processed securely through our payment partners",
        "Travel preferences and requirements to customize your experience",
        "Communication history to provide better customer service",
        "Website usage data through cookies and analytics tools"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "Process your bookings and provide travel services",
        "Communicate with you about your bookings and travel arrangements",
        "Send you important updates and notifications about your trip",
        "Improve our services based on your feedback and preferences",
        "Comply with legal and regulatory requirements",
        "Prevent fraud and ensure transaction security"
      ]
    },
    {
      title: "Information Sharing",
      icon: Lock,
      content: [
        "We share your information only with trusted partners necessary to fulfill your booking (hotels, airlines, local operators)",
        "Payment processors to complete transactions securely",
        "Legal authorities when required by law or to protect our rights",
        "We never sell your personal information to third parties",
        "All partners are bound by strict confidentiality agreements"
      ]
    },
    {
      title: "Data Security",
      icon: FileText,
      content: [
        "We implement industry-standard security measures to protect your data",
        "SSL encryption for all data transmission",
        "Secure servers and regular security audits",
        "Limited access to personal information on a need-to-know basis",
        "Regular staff training on data protection best practices"
      ]
    }
  ];

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 text-center">
            <strong>Last Updated:</strong> January 1, 2025
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              At Pather Khonje, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
              or use our travel services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-100 rounded-full">
                    <section.icon className="h-6 w-6 text-sky-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* Cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-l-4 border-sky-600 pl-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, 
                and understand user preferences. You can control cookie settings through your browser preferences.
              </p>
              <p className="text-gray-700">
                By continuing to use our website, you consent to our use of cookies in this policy.
              </p>
            </motion.div>

            {/* Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="border-l-4 border-green-600 pl-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <div className="space-y-2 text-gray-700">
                <p>• <strong>Access:</strong> Request a copy of the personal information we hold about you</p>
                <p>• <strong>Correction:</strong> Ask us to correct any inaccurate or incomplete information</p>
                <p>• <strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</p>
                <p>• <strong>Portability:</strong> Request transfer of your data to another service provider</p>
                <p>• <strong>Objection:</strong> Object to processing of your personal information for marketing purposes</p>
              </div>
            </motion.div>

            {/* Data Retention */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-l-4 border-orange-600 pl-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information only for to fulfill the purposes outlined in this privacy policy, 
                comply with legal obligations, resolve disputes, and enforce our agreements. Travel-related information may be retained 
                for up to 7 years for tax and legal compliance purposes.
              </p>
            </motion.div>

            {/* Third Party Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="border-l-4 border-purple-600 pl-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Links</h2>
              <p className="text-gray-700">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content 
                of these external sites. We encourage you to read the privacy policies of any third-party sites you visit.
              </p>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-sky-50 border border-sky-200 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us About Privacy</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please don't hesitate to contact us</p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@patherkhonje.com</p>
                <p><strong>Phone:</strong> +91 7439857694</p>
                <p><strong>Address:</strong> 64/2/12, Biren Roy Road (East), Behala Chowrasta, Kolkata - 700008</p>
              </div>
            </motion.div>

            {/* Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center bg-gray-50 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
                legal, or regulatory reasons. We will notify you of any significant changes by posting the new Privacy Policy on 
                this page and updating the "Last Updated" date.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;