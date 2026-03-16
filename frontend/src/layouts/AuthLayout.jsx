export function AuthLayout({ children }) {
  return (
    <div className="bg-surface min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
