import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-gray-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <motion.input
            whileFocus={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            ref={ref}
            className={`
              w-full rounded-xl bg-white/5 border border-white/10 
              px-4 py-3 text-white placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
              backdrop-blur-md transition-all duration-200
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <motion.span 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 ml-1"
          >
            {error}
          </motion.span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
