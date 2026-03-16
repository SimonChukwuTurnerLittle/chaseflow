import clsx from 'clsx';

const STYLES = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-gray-100 text-gray-500',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        STYLES[status] || STYLES.PENDING
      )}
    >
      {status}
    </span>
  );
}
