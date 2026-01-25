// components/ui/card.tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

export const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  onClick,
  variant = 'default'
}: CardProps) => {
  const baseStyles = `
    rounded-xl
    transition-all duration-300
    ${hover ? 'hover:shadow-lg' : ''}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const variantStyles = {
    default: `
      bg-card
      text-card-foreground
      border border-border
      shadow-sm
      ${onClick ? 'hover:bg-accent/5' : ''}
    `,
    outline: `
      bg-transparent
      text-foreground
      border border-border/50
      ${onClick ? 'hover:bg-accent/5 hover:border-border' : ''}
    `,
    ghost: `
      bg-transparent
      text-foreground
      ${onClick ? 'hover:bg-accent/5' : ''}
    `
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : {}}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
};