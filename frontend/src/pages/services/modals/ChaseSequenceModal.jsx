import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { Plus, Trash2, Clipboard, Info, CheckCircle2, Circle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import {
  useSequences,
  useCreateSequence,
  useUpdateSequence,
  useDeleteSequence,
  useUpdateTemplate,
} from '@/hooks/useSequences';

const TEMPERATURES = [
  { key: 'HOT', label: 'Hot', bg: 'bg-red-500', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  { key: 'MEDIUM', label: 'Medium', bg: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { key: 'COLD', label: 'Cold', bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { key: 'DORMANT', label: 'Dormant', bg: 'bg-gray-400', bgLight: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
];

const CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP'];

const CHANNEL_COLORS = {
  EMAIL: { dot: 'bg-channel-email', label: 'text-channel-email' },
  SMS: { dot: 'bg-channel-sms', label: 'text-channel-sms' },
  WHATSAPP: { dot: 'bg-channel-whatsapp', label: 'text-channel-whatsapp' },
};

const TOKENS = [
  '{{first_name}}',
  '{{last_name}}',
  '{{business_name}}',
  '{{service_name}}',
  '{{handler_name}}',
];

// Dots showing which channels have a template written for this step
function TemplateStatusDots({ templates }) {
  const byChannel = Object.fromEntries(
    (templates || []).map((t) => [t.templateType, t])
  );

  return (
    <div className="flex items-center gap-1.5">
      {CHANNELS.map((ch) => {
        const t = byChannel[ch];
        const filled = !!t?.templateContent;
        return (
          <span key={ch} title={`${ch}: ${filled ? 'configured' : 'empty'}`}>
            {filled ? (
              <CheckCircle2 size={13} className={CHANNEL_COLORS[ch].label} />
            ) : (
              <Circle size={13} className="text-slate-300" />
            )}
          </span>
        );
      })}
    </div>
  );
}

function TemplateEditor({ sequence, service }) {
  const updateTemplate = useUpdateTemplate();
  const [activeChannel, setActiveChannel] = useState('EMAIL');

  const templatesByChannel = Object.fromEntries(
    (sequence.templates || []).map((t) => [t.templateType, t])
  );

  const [localTemplates, setLocalTemplates] = useState(() => {
    const initial = {};
    CHANNELS.forEach((ch) => {
      const t = templatesByChannel[ch] || {};
      initial[ch] = {
        title: t.templateTitle || '',
        subject: t.subject || '',
        content: t.templateContent || '',
        aiPromptHint: t.aiPromptHint || '',
        useAi: t.useAi ?? false,
      };
    });
    return initial;
  });

  const current = localTemplates[activeChannel];

  function updateField(field, value) {
    setLocalTemplates((prev) => ({
      ...prev,
      [activeChannel]: { ...prev[activeChannel], [field]: value },
    }));
  }

  function handleSaveTemplate() {
    const t = localTemplates[activeChannel];
    updateTemplate.mutate(
      {
        serviceId: service.id,
        stepNumber: sequence.stepNumber,
        channel: activeChannel,
        data: {
          templateTitle: t.title,
          subject: t.subject,
          templateContent: t.content,
          aiPromptHint: t.aiPromptHint,
          useAi: t.useAi,
        },
      },
      {
        onSuccess: () => toast.success('Template saved'),
      }
    );
  }

  function copyToken(token) {
    navigator.clipboard.writeText(token);
    toast.success('Copied!');
  }

  const charLimit = activeChannel === 'SMS' ? 160 : activeChannel === 'WHATSAPP' ? 1024 : undefined;
  const contentLength = current.content?.length ?? 0;

  return (
    <div className="mt-3 border border-slate-200 rounded-xl bg-slate-50/40 overflow-hidden">
      {/* Shared-template notice */}
      <div className="flex items-start gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
        <Info size={13} className="text-cta mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Templates for <span className="font-semibold">Step {sequence.stepNumber}</span> are shared across{' '}
          <span className="font-semibold">all temperature tracks</span>. Temperature only controls timing.
        </p>
      </div>

      <div className="p-4">
        {/* Channel tabs */}
        <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
          {CHANNELS.map((ch) => {
            const t = templatesByChannel[ch];
            const filled = !!t?.templateContent;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChannel(ch)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer',
                  activeChannel === ch
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {filled ? (
                  <CheckCircle2 size={11} className={CHANNEL_COLORS[ch].label} />
                ) : (
                  <Circle size={11} className="text-slate-300" />
                )}
                {ch}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <Input
            label="Template Title"
            value={current.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder={`${activeChannel} template title`}
          />

          {activeChannel === 'EMAIL' && (
            <Input
              label="Subject Line"
              value={current.subject}
              onChange={(e) => updateField('subject', e.target.value)}
              placeholder="Email subject line"
            />
          )}

          <div>
            <Textarea
              label="Content"
              value={current.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Write your message..."
              maxLength={charLimit}
              className={activeChannel === 'EMAIL' ? '[&_textarea]:font-mono [&_textarea]:min-h-[180px]' : ''}
            />
            {charLimit && (
              <p
                className={clsx(
                  'text-xs mt-1 text-right tabular-nums',
                  contentLength > charLimit * 0.9 ? 'text-amber-600' : 'text-slate-400'
                )}
              >
                {contentLength} / {charLimit}
              </p>
            )}
          </div>

          <Textarea
            label="AI personalisation guidance"
            value={current.aiPromptHint}
            onChange={(e) => updateField('aiPromptHint', e.target.value)}
            placeholder="e.g. Keep the tone friendly but professional..."
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={current.useAi}
              onChange={(e) => updateField('useAi', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-cta focus:ring-cta/50 cursor-pointer"
            />
            <span className="text-sm font-medium text-primary">
              Use AI personalisation on send
            </span>
          </label>

          {/* Available Tokens */}
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Available Tokens — click to copy
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TOKENS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => copyToken(token)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 hover:border-cta hover:text-cta hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                >
                  <Clipboard size={10} />
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleSaveTemplate} loading={updateTemplate.isPending}>
              Save Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ sequence, service, onDelete }) {
  const updateSequence = useUpdateSequence();
  const [showTemplates, setShowTemplates] = useState(false);

  const [delayDays, setDelayDays] = useState(sequence.delayDays ?? 0);
  const [isFinalStep, setIsFinalStep] = useState(sequence.isFinalStep ?? false);
  const [stopOnReply, setStopOnReply] = useState(sequence.stopOnReply ?? false);

  const autoSave = useCallback(
    (field, value) => {
      updateSequence.mutate({
        serviceId: service.id,
        id: sequence.id,
        data: { [field]: value },
      });
    },
    [updateSequence, service.id, sequence.id]
  );

  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 -z-10" />

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3 ml-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="default">Step {sequence.stepNumber}</Badge>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">after</span>
              <input
                type="number"
                min="0"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                onBlur={() => autoSave('delayDays', delayDays)}
                className="w-16 px-2 py-1 border border-slate-300 rounded-md text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              <span className="text-xs text-slate-500">days</span>
            </div>

            {/* Template status dots */}
            <TemplateStatusDots templates={sequence.templates} />
          </div>

          <button
            type="button"
            title="Delete step"
            onClick={() => onDelete(sequence)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-5 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFinalStep}
              onChange={(e) => {
                setIsFinalStep(e.target.checked);
                autoSave('isFinalStep', e.target.checked);
              }}
              className="w-4 h-4 rounded border-slate-300 text-cta focus:ring-cta/50 cursor-pointer"
            />
            <span className="text-sm text-primary">Final step</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stopOnReply}
              onChange={(e) => {
                setStopOnReply(e.target.checked);
                autoSave('stopOnReply', e.target.checked);
              }}
              className="w-4 h-4 rounded border-slate-300 text-cta focus:ring-cta/50 cursor-pointer"
            />
            <span className="text-sm text-primary">Stop on reply</span>
          </label>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowTemplates((prev) => !prev)}
        >
          {showTemplates ? 'Hide Templates' : 'Edit Templates'}
        </Button>

        {showTemplates && <TemplateEditor sequence={sequence} service={service} />}
      </div>
    </div>
  );
}

export default function ChaseSequenceModal({ open, onClose, service }) {
  const { data: sequencesRes, isLoading } = useSequences(service?.id);
  const createSequence = useCreateSequence();
  const deleteSequence = useDeleteSequence();

  const [activeTemp, setActiveTemp] = useState('HOT');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sequences = sequencesRes ?? [];

  const filteredSteps = sequences
    .filter((s) => s.temperature === activeTemp)
    .sort((a, b) => a.stepNumber - b.stepNumber);

  // Count template coverage: how many steps have at least one channel configured
  const stepNumbers = [...new Set(sequences.filter((s) => s.temperature === 'HOT').map((s) => s.stepNumber))];
  const configuredSteps = stepNumbers.filter((n) => {
    const step = sequences.find((s) => s.temperature === 'HOT' && s.stepNumber === n);
    return step?.templates?.some((t) => !!t.templateContent);
  });

  function handleAddStep() {
    const maxStep = filteredSteps.reduce((max, s) => Math.max(max, s.stepNumber), 0);
    createSequence.mutate({
      serviceId: service.id,
      data: {
        temperature: activeTemp,
        stepNumber: maxStep + 1,
        delayDays: 3,
        isFinalStep: false,
        stopOnReply: true,
      },
    });
  }

  function handleDeleteStep() {
    if (!deleteTarget) return;
    deleteSequence.mutate(
      { serviceId: service.id, id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success('Step deleted');
          setDeleteTarget(null);
        },
      }
    );
  }

  const tempConfig = TEMPERATURES.find((t) => t.key === activeTemp);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`${service?.serviceName} — Sequences & Templates`}
        size="lg"
      >
        {/* Template progress summary */}
        {!isLoading && stepNumbers.length > 0 && (
          <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex gap-1 items-center">
              {stepNumbers.map((n) => {
                const done = configuredSteps.includes(n);
                return (
                  <span key={n} className="flex items-center gap-1">
                    {done ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Circle size={14} className="text-slate-300" />
                    )}
                    <span className="text-xs text-slate-500">Step {n}</span>
                  </span>
                );
              })}
            </div>
            <span className="ml-auto text-xs text-slate-400">
              {configuredSteps.length}/{stepNumbers.length} steps configured
            </span>
          </div>
        )}

        {/* Temperature tabs — timing only note */}
        <div className="mb-1">
          <div className="flex gap-2 mb-1">
            {TEMPERATURES.map((temp) => (
              <button
                key={temp.key}
                type="button"
                onClick={() => setActiveTemp(temp.key)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                  activeTemp === temp.key
                    ? `${temp.bg} text-white`
                    : `${temp.bgLight} ${temp.text} border ${temp.border} hover:opacity-80`
                )}
              >
                {temp.label}
                <span className="ml-1.5 text-xs opacity-75">
                  ({sequences.filter((s) => s.temperature === temp.key).length})
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Temperature controls <span className="font-medium text-slate-500">timing only</span> — templates are shared across all tracks.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : filteredSteps.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            No steps for {tempConfig?.label} temperature yet.
          </div>
        ) : (
          <div className="relative pl-3">
            {filteredSteps.map((step) => (
              <StepCard
                key={step.id}
                sequence={step}
                service={service}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddStep}
          disabled={createSequence.isPending}
          className={clsx(
            'w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'border-2 border-dashed border-slate-300 text-sm font-medium text-slate-500',
            'hover:border-cta hover:text-cta transition-all duration-200 cursor-pointer',
            createSequence.isPending && 'opacity-50 pointer-events-none'
          )}
        >
          <Plus size={16} />
          Add Step
        </button>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteStep}
        title="Delete Step"
        message={`Delete Step ${deleteTarget?.stepNumber}? Templates for this step will also be removed.`}
        confirmText="Delete"
        loading={deleteSequence.isPending}
      />
    </>
  );
}
