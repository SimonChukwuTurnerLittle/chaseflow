export function AuthLayout({ children }) {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
