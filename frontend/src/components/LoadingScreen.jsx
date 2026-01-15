import React from "react";
import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Glow Effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-[#c6a75e] blur-3xl opacity-20 rounded-full"
        />

        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
          className="relative z-10 w-64 md:w-80"
        >
          <img
            src="/logo/Pather Khonje Logo.png"
            alt="Pather Khonje"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Loading Bar (Optional but nice) */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100px", opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
          className="h-1 bg-[#c6a75e] mt-8 rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
