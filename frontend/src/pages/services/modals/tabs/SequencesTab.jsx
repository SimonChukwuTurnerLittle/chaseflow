import { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { Plus, Trash2, CheckCircle2, Circle, Zap, Link2Off } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import {
  useSequences,
  useCreateSequence,
  useUpdateSequence,
  useDeleteSequence,
} from '@/hooks/useSequences';
import {
  useTemplates,
  useAssignTemplate,
  useUnassignTemplate,
} from '@/hooks/useTemplates';

const TEMPERATURES = [
  { key: 'HOT', label: 'Hot', bg: 'bg-red-500', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  { key: 'MEDIUM', label: 'Medium', bg: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { key: 'COLD', label: 'Cold', bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { key: 'DORMANT', label: 'Dormant', bg: 'bg-gray-400', bgLight: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
];

const CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP'];

const CHANNEL_COLORS = {
  EMAIL: { dot: 'bg-channel-email', label: 'text-channel-email', badge: 'bg-blue-50 text-blue-700' },
  SMS: { dot: 'bg-channel-sms', label: 'text-channel-sms', badge: 'bg-green-50 text-green-700' },
  WHATSAPP: { dot: 'bg-channel-whatsapp', label: 'text-channel-whatsapp', badge: 'bg-purple-50 text-purple-700' },
};

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

function TemplateAssociation({ sequence, service, allTemplates }) {
  const assignTemplate = useAssignTemplate();
  const unassignTemplate = useUnassignTemplate();

  const assignedByChannel = useMemo(() => {
    const map = {};
    (sequence.templates || []).forEach((t) => {
      map[t.templateType] = t;
    });
    return map;
  }, [sequence.templates]);

  // Unassigned templates grouped by type
  const unassignedByType = useMemo(() => {
    const map = { EMAIL: [], SMS: [], WHATSAPP: [] };
    (allTemplates || []).forEach((t) => {
      if (!t.assigned && map[t.templateType]) {
        map[t.templateType].push(t);
      }
    });
    return map;
  }, [allTemplates]);

  function handleAssign(channel, templateId) {
    if (!templateId) return;

    // If there's already an assigned template for this channel, unassign it first
    const current = assignedByChannel[channel];
    if (current) {
      unassignTemplate.mutate(
        { serviceId: service.id, id: current.id },
        {
          onSuccess: () => {
            assignTemplate.mutate({
              serviceId: service.id,
              id: templateId,
              data: { stepNumber: sequence.stepNumber },
            });
          },
        }
      );
    } else {
      assignTemplate.mutate({
        serviceId: service.id,
        id: templateId,
        data: { stepNumber: sequence.stepNumber },
      });
    }
  }

  function handleUnassign(channel) {
    const current = assignedByChannel[channel];
    if (current) {
      unassignTemplate.mutate({ serviceId: service.id, id: current.id });
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Template Assignment
      </p>
      {CHANNELS.map((ch) => {
        const assigned = assignedByChannel[ch];
        const available = unassignedByType[ch] || [];

        return (
          <div key={ch} className="flex items-center gap-2">
            <span className={clsx(
              'inline-flex items-center justify-center w-20 px-2 py-1 rounded-md text-xs font-medium shrink-0',
              CHANNEL_COLORS[ch].badge
            )}>
              {ch}
            </span>

            <select
              value={assigned?.id || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' && assigned) {
                  handleUnassign(ch);
                } else if (val !== '') {
                  handleAssign(ch, val);
                }
              }}
              className="flex-1 px-2.5 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta cursor-pointer bg-white"
            >
              <option value="">— None —</option>
              {/* Show currently assigned template as an option */}
              {assigned && (
                <option value={assigned.id}>
                  {assigned.templateTitle || 'Untitled'} (assigned)
                </option>
              )}
              {/* Show unassigned templates of matching type */}
              {available.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.templateTitle || 'Untitled'}
                </option>
              ))}
            </select>

            {assigned && (
              <button
                type="button"
                title="Unassign"
                onClick={() => handleUnassign(ch)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors duration-150 shrink-0"
              >
                <Link2Off size={13} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepCard({ sequence, service, allTemplates, onDelete }) {
  const updateSequence = useUpdateSequence();

  const [delayDays, setDelayDays] = useState(sequence.delayDays ?? 0);
  const [isFinalStep, setIsFinalStep] = useState(sequence.isFinalStep ?? false);
  const [stopOnReply, setStopOnReply] = useState(sequence.stopOnReply ?? false);
  const [useAiPersonalisation, setUseAiPersonalisation] = useState(sequence.useAiPersonalisation ?? false);
  const [aiPersonalisationGuidance, setAiPersonalisationGuidance] = useState(sequence.aiPersonalisationGuidance ?? '');

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

        {/* Template Association */}
        <TemplateAssociation
          sequence={sequence}
          service={service}
          allTemplates={allTemplates}
        />

        {/* AI Personalisation */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="relative shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useAiPersonalisation}
                onChange={(e) => {
                  setUseAiPersonalisation(e.target.checked);
                  autoSave('useAiPersonalisation', e.target.checked);
                }}
                id={`ai-${sequence.id}`}
              />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-cta transition-colors duration-200" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
              Use AI personalisation on send
            </span>
            <Zap size={13} className="text-amber-400 shrink-0" />
          </label>

          {useAiPersonalisation && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-150">
              <label
                htmlFor={`ai-guidance-${sequence.id}`}
                className="block text-xs font-medium text-slate-500 mb-1.5"
              >
                AI personalisation guidance
              </label>
              <textarea
                id={`ai-guidance-${sequence.id}`}
                rows={3}
                placeholder="e.g. Keep it friendly and brief. Reference the service name. Avoid sales language."
                value={aiPersonalisationGuidance}
                onChange={(e) => setAiPersonalisationGuidance(e.target.value)}
                onBlur={() => autoSave('aiPersonalisationGuidance', aiPersonalisationGuidance)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 focus:ring-cta/20 focus:border-cta"
              />
              <p className="text-xs text-slate-400 mt-1">
                This guidance is sent to the AI when personalising messages for this step.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SequencesTab({ service }) {
  const { data: sequencesRes, isLoading: seqLoading } = useSequences(service?.id);
  const { data: templatesRes, isLoading: tplLoading } = useTemplates(service?.id);
  const createSequence = useCreateSequence();
  const deleteSequence = useDeleteSequence();

  const [activeTemp, setActiveTemp] = useState('HOT');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sequences = sequencesRes ?? [];
  const allTemplates = templatesRes ?? [];

  const filteredSteps = sequences
    .filter((s) => s.temperature === activeTemp)
    .sort((a, b) => a.stepNumber - b.stepNumber);

  // Count template coverage
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

  const isLoading = seqLoading || tplLoading;

  return (
    <div>
      <h3 className="text-base font-semibold text-primary mb-4">Chase Sequences</h3>

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

      {/* Temperature tabs */}
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
          No steps for {TEMPERATURES.find(t => t.key === activeTemp)?.label} temperature yet.
        </div>
      ) : (
        <div className="relative pl-3">
          {filteredSteps.map((step) => (
            <StepCard
              key={step.id}
              sequence={step}
              service={service}
              allTemplates={allTemplates}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteStep}
        title="Delete Step"
        message={`Delete Step ${deleteTarget?.stepNumber}? Templates for this step will also be unassigned.`}
        confirmText="Delete"
        loading={deleteSequence.isPending}
      />
    </div>
  );
}
