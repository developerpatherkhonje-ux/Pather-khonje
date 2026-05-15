import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react'; // Removed Linkedin import

const Footer = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <footer className="bg-midnight-ocean text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div>
            {!imageError ? (
              <img 
                src="/logo/Pather%20Khonje%20Logo.png" 
                alt="Pather Khonje" 
                className="h-16 mb-6 object-contain" 
                onError={() => setImageError(true)}
              />
            ) : (
              <h2 className="text-3xl font-serif font-bold text-white mb-6 tracking-wider">
                PATHER KHONJE
              </h2>
            )}
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              A Tour That Never Seen Before. Experience the raw beauty of the Himalayas with expertly crafted journeys since 2015.
            </p>
            <div className="flex space-x-4">
              {/* Updated Facebook Link */}
              <a href="https://www.facebook.com/profile.php?id=61577923149985" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              {/* Updated Instagram Link */}
              <a href="https://www.instagram.com/patherkhonje?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              {/* LinkedIn completely removed from here */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-soft-gold font-bold uppercase tracking-widest text-sm mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/packages" className="hover:text-white transition-colors">Tour Packages</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-soft-gold font-bold uppercase tracking-widest text-sm mb-6">Support & Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/policies" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policies" className="hover:text-white transition-colors">Booking Policy</Link></li>
              <li><Link to="/policies" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/policies" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-soft-gold font-bold uppercase tracking-widest text-sm mb-6">Contact Info</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-soft-gold shrink-0 mt-0.5" />
                <span>64/2/12, Biren Roy Road (East),<br />Behala, Chowrasta,<br />Kolkata - 700008</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-soft-gold shrink-0" />
                <span>+91 7439857694</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-soft-gold shrink-0" />
                <span>contact@patherkhonje.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pather Khonje. All rights reserved.</p>
          <p className="font-serif italic tracking-wide text-gray-400">A Tour That Never Seen Before.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;