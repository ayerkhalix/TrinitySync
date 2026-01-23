import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface InputProps extends HTMLMotionProps<"input"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
              ${icon ? "pl-10" : ""} 
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} 
              ${className}`}
            {...props}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
