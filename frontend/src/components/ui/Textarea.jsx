import React from 'react';
import { clsx } from 'clsx';

export const Textarea = React.forwardRef(function Textarea(
  { label, error, maxLength, id, className, ...rest },
  ref
) {
  const [length, setLength] = React.useState(0);
  const nearLimit = maxLength && length >= maxLength * 0.9;

  function handleChange(e) {
    setLength(e.target.value.length);
    rest.onChange?.(e);
  }

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
      <textarea
        ref={ref}
        id={id}
        maxLength={maxLength}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all duration-200 resize-y min-h-[80px]',
          'focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'placeholder:text-slate-400',
          error
            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
            : 'border-slate-300'
        )}
        {...rest}
        onChange={handleChange}
      />
      <div className="flex items-center justify-between">
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        {maxLength && (
          <p
            className={clsx(
              'text-xs ml-auto',
              nearLimit ? 'text-red-500' : 'text-slate-400'
            )}
          >
            {length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});
