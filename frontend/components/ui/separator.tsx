// components/ui/separator.tsx
interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator = ({ 
  className = '',
  orientation = 'horizontal'
}: SeparatorProps) => {
  return (
    <div
      className={
        orientation === 'horizontal'
          ? `h-[1px] w-full bg-border ${className}`
          : `h-full w-[1px] bg-border ${className}`
      }
      role="separator"
      aria-orientation={orientation}
    />
  );
};