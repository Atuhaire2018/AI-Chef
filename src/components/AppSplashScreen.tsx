import React, { useEffect } from "react";
import { motion } from "motion/react";

interface AppSplashScreenProps {
  onFinish: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.08,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
      }}
      onClick={onFinish}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        backgroundColor: "#030712", // Ultra-sleek, deep OLED dark backdrop like X
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none"
      }}
    >
      {/* Dynamic Pulsing Radial Light Aura */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.6, 1.25, 1.05, 1.4],
          opacity: [0.15, 0.5, 0.35, 0.6]
        }}
        transition={{ 
          duration: 2.8,
          times: [0, 0.4, 0.7, 1],
          ease: "easeInOut" 
        }}
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,95,43,0.4) 0%, rgba(59,130,246,0.2) 45%, transparent 75%)",
          filter: "blur(50px)",
          pointerEvents: "none"
        }}
      />

      {/* Main Container - Centered Logo & Brand Text */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* "AI Chef" Title on Top of Opening Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
          style={{
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 800,
            color: "#F97316",
            letterSpacing: 2.5,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(249, 115, 22, 0.12)",
            padding: "5px 16px",
            borderRadius: 20,
            border: "1px solid rgba(249, 115, 22, 0.35)",
            boxShadow: "0 4px 20px rgba(249, 115, 22, 0.25)"
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316" }} className="animate-pulse" />
          AI CHEF
        </motion.div>

        {/* Animated App Emblem - Chef Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 15 }}
          animate={{ 
            scale: [0.5, 1.08, 1, 1.05],
            opacity: [0, 1, 1, 1],
            y: [15, 0, 0, -2]
          }}
          transition={{ 
            duration: 2.8,
            times: [0, 0.3, 0.8, 1],
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{
            position: "relative",
            width: 104,
            height: 104,
            borderRadius: 28,
            background: "linear-gradient(135deg, #1E293B 0%, #090D16 100%)",
            border: "1.5px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(217, 95, 43, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {/* Shimmer Light Reflection Pass */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: "200%", opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.4, delay: 0.6, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 28,
              background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
              pointerEvents: "none"
            }}
          />

          {/* SVG Master Chef Logo */}
          <svg width="60" height="60" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Chef Hat Puffs / Body */}
            <path 
              d="M17 38C13 32 16 20 25 20C27 15 34 15 37 19C44 16 50 24 47 38Z" 
              fill="rgba(249, 115, 22, 0.12)" 
              stroke="url(#chef_grad_3s)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Chef Hat Fold Accent Lines */}
            <path d="M26 21C28 26 28 34 28 38" stroke="url(#chef_grad_3s)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <path d="M37 21C36 26 36 34 36 38" stroke="url(#chef_grad_3s)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            {/* Chef Hat Base Band */}
            <rect x="17" y="38" width="30" height="12" rx="4" fill="#090D16" stroke="url(#chef_grad_3s)" strokeWidth="3.5" />
            {/* Band Detail Lines */}
            <line x1="22" y1="44" x2="42" y2="44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            {/* AI Sparkle Star emblem in center of Chef Hat */}
            <path d="M32 23L34 27.5L38.5 29.5L34 31.5L32 36L30 31.5L25.5 29.5L30 27.5L32 23Z" fill="#F97316" />

            <defs>
              <linearGradient id="chef_grad_3s" x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F97316" />
                <stop offset="0.5" stopColor="#3B82F6" />
                <stop offset="1" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Brand Name Typography */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          style={{
            marginTop: 22,
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.02em", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            What's In My Fridge
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 2.5, textTransform: "uppercase", marginTop: 5 }}>
            AI Culinary Companion
          </div>
        </motion.div>
      </div>

      {/* Sleek Native Bottom Progress Bar (Fills in 3 Seconds) */}
      <div 
        style={{
          position: "absolute",
          bottom: 48,
          width: 140,
          height: 3,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: 4,
          overflow: "hidden"
        }}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.95, ease: [0.4, 0, 0.2, 1] }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #F97316 0%, #3B82F6 100%)",
            borderRadius: 4
          }}
        />
      </div>
    </motion.div>
  );
};

export default AppSplashScreen;
