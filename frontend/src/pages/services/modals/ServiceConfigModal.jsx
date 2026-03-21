import { useState } from 'react';
import { clsx } from 'clsx';
import { FileText, GitBranch } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import TemplatesTab from './tabs/TemplatesTab';
import SequencesTab from './tabs/SequencesTab';

const TABS = [
  { key: 'templates', label: 'Templates', icon: FileText },
  { key: 'sequences', label: 'Chase Sequences', icon: GitBranch },
];

export default function ServiceConfigModal({ open, onClose, service }) {
  const [tab, setTab] = useState('templates');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${service?.serviceName ?? 'Service'} — Configuration`}
      size="xl"
    >
      <div className="flex -mx-6 -my-4 min-h-[60vh]">
        {/* Side navigation — darker & bolder */}
        <nav className="w-74 shrink-0 border-r border-slate-300 bg-slate-50/50 py-4 px-2 rounded-bl-2xl">
          <div className="space-y-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={clsx(
                  'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-left',
                  tab === key
                    ? 'bg-white shadow-sm text-primary border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon size={16} className={tab === key ? 'text-cta' : 'text-slate-400'} />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-primary font-medium">
          {tab === 'templates' && <TemplatesTab service={service} />}
          {tab === 'sequences' && <SequencesTab service={service} />}
        </div>
      </div>
    </Modal>
  );
}
