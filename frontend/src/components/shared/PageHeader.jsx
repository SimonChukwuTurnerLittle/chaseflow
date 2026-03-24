export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary">{title}</h1>
        {subtitle && (
          <p className="text-sm text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
