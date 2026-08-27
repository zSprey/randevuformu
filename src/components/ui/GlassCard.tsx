import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'gradient';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  variant = 'dark',
  hoverEffect = true,
  className = '',
  ...props 
}) => {
  const variants = {
    light: 'bg-white/10 border-white/20',
    dark: 'bg-gray-900/40 border-white/10',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 border-white/10',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative overflow-hidden rounded-2xl border
        shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] 
        backdrop-blur-xl
        p-6
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />
    </motion.div>
  );
};
