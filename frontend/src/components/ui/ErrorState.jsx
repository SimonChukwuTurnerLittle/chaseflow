import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ title = 'Unable to load data', description = 'Could not connect to the server. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <WifiOff size={48} className="text-slate-300 mb-4" strokeWidth={1.5} />
      <h3 className="text-lg font-medium text-primary">{title}</h3>
      <p className="mt-1 text-sm text-secondary max-w-sm">{description}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" onClick={onRetry}>
            <RefreshCw size={16} />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
