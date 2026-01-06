import React from "react";
import { motion } from "framer-motion";

function Footer() {
  return (
    <footer className="bg-deep-steel-blue text-white py-20 border-t border-white/5">
      <div className="container mx-auto px-6 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row justify-between gap-16">
          {/* Brand & Description */}
          <div className="w-full lg:w-1/3">
            <h3 className="font-serif text-2xl font-medium mb-6 text-white">
              Pather Khonje
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs font-sans">
              Creating thoughtful journeys across India since 2015. Based in
              Kolkata, serving travelers worldwide with care and clarity.
            </p>
            <div className="mt-8">
              <p className="text-xs text-soft-gold uppercase tracking-widest font-bold">
                Contact
              </p>
              <p className="text-slate-300 text-sm mt-2">
                contact@patherkhonje.com
              </p>
              <p className="text-slate-300 text-sm">+91 74398 57694</p>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex flex-wrap gap-8 lg:gap-32 w-full lg:w-auto">
            {/* Company */}
            <div className="flex flex-col gap-4">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-soft-gold mb-2">
                Company
              </h4>
              {["About Us", "Our Team", "Careers", "Press"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="font-sans text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Support */}
            <div className="flex flex-col gap-4">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-soft-gold mb-2">
                Support
              </h4>
              {["Contact", "FAQs", "Booking Policy", "Privacy"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="font-sans text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Social */}
            <div className="flex flex-col gap-4">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-soft-gold mb-2">
                Social
              </h4>
              {["Instagram", "Facebook", "LinkedIn", "Twitter"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="font-sans text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] lg:text-xs font-sans tracking-wide text-slate-400 uppercase">
          <p>© 2025 Pather Khonje. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
