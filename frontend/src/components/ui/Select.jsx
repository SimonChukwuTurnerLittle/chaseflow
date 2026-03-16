import React from 'react';
import { clsx } from 'clsx';

export const Select = React.forwardRef(function Select(
  { label, error, options = [], placeholder, id, className, ...rest },
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
      <select
        ref={ref}
        id={id}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all duration-200',
          'focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'bg-white cursor-pointer appearance-none',
          'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E")]',
          'bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
          error
            ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
            : 'border-slate-300'
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});
