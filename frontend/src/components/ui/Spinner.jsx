import { clsx } from 'clsx';

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className }) {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-slate-200 border-t-cta',
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
