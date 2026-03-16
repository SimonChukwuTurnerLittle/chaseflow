import clsx from 'clsx';

const STYLES = {
  HOT: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  COLD: 'bg-blue-100 text-blue-700',
  DORMANT: 'bg-gray-100 text-gray-500',
};

export function TemperatureBadge({ temperature }) {
  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        STYLES[temperature] || STYLES.DORMANT
      )}
    >
      {temperature}
    </span>
  );
}
