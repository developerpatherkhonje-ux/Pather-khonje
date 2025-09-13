import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Instagram, MapPin, Phone, Mail, Clock ,MessageCircle } from 'lucide-react';
// Logo is now loaded from public directory 

function Footer() {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Hotels', path: '/hotels' },
    { name: 'Packages', path: '/packages' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              
              <img src="/logo/Pather Khonje Logo.png" alt="Pather Khonje Logo" className="h-28 w-auto" />
              <div>
                <h3 className="text-xl font-bold">Pather Khonje</h3>
                <p className="text-sm text-gray-400">A tour that never seen before.</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience the world like never before with our carefully curated travel packages
              and premium hotel selections. Your journey starts here.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/16wYgFMnvB/"
                className="text-gray-400 hover:text-sky-400 transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/patherkhonje?igsh=Mmlkcjc0YmwxNzlr"
                className="text-gray-400 hover:text-sky-400 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-sky-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-sky-400 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-400">
                  <p>64/2/12, Biren Roy Road (East),</p>
                  <p>Behala Chowrasta, Kolkata - 700008</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-sky-400 flex-shrink-0" />
                <a href="tel:+917439857694" className="text-sm text-gray-400 hover:text-sky-400 transition-colors">
                  +91 7439857694
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-sky-400 flex-shrink-0" />
                <a href="mailto:contact@patherkhonje.com" className="text-sm text-gray-400 hover:text-sky-400 transition-colors">
                  contact@patherkhonje.com
                </a>
              </div>
            </div>
          </motion.div>

          {/* Branch Office */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Branch Office</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-sky-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-400">BBD Bag, Kolkata</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-sky-400 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-400">
                  <p>Mon - Sat: 9:00 AM - 7:00 PM</p>
                  <p>Sunday: 10:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="border-t border-gray-800 mt-8 pt-8 text-center"
        >
          <p className="text-sm text-gray-400">
            © 2025 Pather Khonje. All rights reserved. Designed and Maintained By{" "}
            <a
              href="https://codeflarelabs.com"
              target="_blank"
              rel=""
              className=""
            >
              Codeflarelabs
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
