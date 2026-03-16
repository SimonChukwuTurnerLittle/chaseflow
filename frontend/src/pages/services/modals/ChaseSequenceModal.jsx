import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { Plus, Trash2, Clipboard } from 'lucide-react';
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

const TOKENS = [
  '{{first_name}}',
  '{{last_name}}',
  '{{business_name}}',
  '{{service_name}}',
  '{{handler_name}}',
];

function TemplateEditor({ sequence }) {
  const updateTemplate = useUpdateTemplate();
  const [activeChannel, setActiveChannel] = useState('EMAIL');

  // Derive template state from sequence.templates
  const templates = sequence.templates || {};

  const [localTemplates, setLocalTemplates] = useState(() => {
    const initial = {};
    CHANNELS.forEach((ch) => {
      const t = templates[ch] || {};
      initial[ch] = {
        title: t.title || '',
        subject: t.subject || '',
        content: t.content || '',
        aiPromptHint: t.aiPromptHint || '',
        useAi: t.useAi || false,
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
    updateTemplate.mutate(
      {
        sequenceId: sequence.id,
        channel: activeChannel,
        data: localTemplates[activeChannel],
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

  return (
    <div className="mt-3 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
      {/* Channel tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
        {CHANNELS.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => setActiveChannel(ch)}
            className={clsx(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer',
              activeChannel === ch
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {ch}
          </button>
        ))}
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
            label="Subject"
            value={current.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            placeholder="Email subject line"
          />
        )}

        <Textarea
          label="Content"
          value={current.content}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="Write your template content..."
          maxLength={charLimit}
          className={activeChannel === 'EMAIL' ? '[&_textarea]:font-mono [&_textarea]:min-h-[200px]' : ''}
        />

        <Textarea
          label="Guidance for AI when personalising"
          value={current.aiPromptHint}
          onChange={(e) => updateField('aiPromptHint', e.target.value)}
          placeholder="e.g. Keep the tone friendly but professional..."
        />

        {/* Use AI toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={current.useAi}
            onChange={(e) => updateField('useAi', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-cta focus:ring-cta/50 cursor-pointer"
          />
          <span className="text-sm font-medium text-primary">
            Use AI personalisation
          </span>
        </label>

        {/* Available Tokens */}
        <div className="bg-slate-50 rounded-lg p-3 mt-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Available Tokens
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TOKENS.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => copyToken(token)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono text-slate-600 hover:border-cta hover:text-cta transition-colors duration-200 cursor-pointer"
              >
                <Clipboard size={10} />
                {token}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSaveTemplate}
            loading={updateTemplate.isPending}
          >
            Save Template
          </Button>
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
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(sequence)}
          >
            <Trash2 size={14} />
          </Button>
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

        {/* Edit Templates toggle */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowTemplates((prev) => !prev)}
        >
          {showTemplates ? 'Hide Templates' : 'Edit Templates'}
        </Button>

        {showTemplates && <TemplateEditor sequence={sequence} />}
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

  const sequences = sequencesRes?.data ?? [];

  const filteredSteps = sequences
    .filter((s) => s.temperature === activeTemp)
    .sort((a, b) => a.stepNumber - b.stepNumber);

  function handleAddStep() {
    const maxStep = filteredSteps.reduce(
      (max, s) => Math.max(max, s.stepNumber),
      0
    );
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
        title={`${service?.serviceName} \u2014 Chase Sequences`}
        size="lg"
      >
        {/* Temperature tabs */}
        <div className="flex gap-2 mb-5">
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

        {/* Steps timeline */}
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

        {/* Add step */}
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
        message={`Delete Step ${deleteTarget?.stepNumber}? All associated templates will also be removed.`}
        confirmText="Delete"
        loading={deleteSequence.isPending}
      />
    </>
  );
}
