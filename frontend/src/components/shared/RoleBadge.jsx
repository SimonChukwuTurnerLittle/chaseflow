import clsx from 'clsx';

const ROLE_CONFIG = {
  ADMIN: { style: 'bg-purple-100 text-purple-700', label: 'Admin' },
  SALES_HANDLER: { style: 'bg-blue-100 text-blue-700', label: 'Handler' },
  SALES_USER: { style: 'bg-green-100 text-green-700', label: 'Sales User' },
  EXPLORER: { style: 'bg-gray-100 text-gray-500', label: 'Explorer' },
};

export function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.EXPLORER;

  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.style
      )}
    >
      {config.label}
    </span>
  );
}
