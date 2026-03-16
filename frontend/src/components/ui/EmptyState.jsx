import { clsx } from 'clsx';

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <Icon size={48} className="text-slate-300 mb-4" strokeWidth={1.5} />
      )}
      {title && (
        <h3 className="text-lg font-medium text-primary">{title}</h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-secondary max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
