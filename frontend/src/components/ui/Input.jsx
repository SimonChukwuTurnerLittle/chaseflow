import React from 'react';
import { clsx } from 'clsx';

export const Input = React.forwardRef(function Input(
  { label, error, id, className, ...rest },
  ref
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-primary"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all duration-200',
          'focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'placeholder:text-slate-400',
          error
            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
            : 'border-slate-300'
        )}
        {...rest}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});
