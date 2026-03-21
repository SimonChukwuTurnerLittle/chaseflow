import { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Zap,
  Link2Off,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
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
  { key: 'HOT', label: 'Hot', dot: 'bg-red-500' },
  { key: 'MEDIUM', label: 'Medium', dot: 'bg-amber-500' },
  { key: 'COLD', label: 'Cold', dot: 'bg-blue-500' },
  { key: 'DORMANT', label: 'Dormant', dot: 'bg-gray-400' },
];

const CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP'];

const CHANNEL_BADGE = {
  EMAIL: { label: 'Email', className: 'bg-blue-50 text-blue-700' },
  SMS: { label: 'SMS', className: 'bg-green-50 text-green-700' },
  WHATSAPP: { label: 'WhatsApp', className: 'bg-purple-50 text-purple-700' },
};

const CHANNEL_COLORS = {
  EMAIL: { dot: 'bg-channel-email', label: 'text-channel-email' },
  SMS: { dot: 'bg-channel-sms', label: 'text-channel-sms' },
  WHATSAPP: { dot: 'bg-channel-whatsapp', label: 'text-channel-whatsapp' },
};

/* ------------------------------------------------------------------ */
/*  Toggle Switch — matches the AI personalisation toggle style       */
/* ------------------------------------------------------------------ */
function Toggle({ id, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer select-none group">
      <div className="relative shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-8 h-[18px] bg-slate-200 rounded-full peer-checked:bg-cta transition-colors duration-200" />
        <div className="absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-3.5" />
      </div>
      <span className="text-sm text-slate-600 group-hover:text-primary transition-colors">
        {label}
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Template Status Dots                                               */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Template Assignment (collapsible)                                  */
/* ------------------------------------------------------------------ */
function TemplateAssociation({ sequence, service, allTemplates }) {
  const assignTemplate = useAssignTemplate();
  const unassignTemplate = useUnassignTemplate();
  const [open, setOpen] = useState(false);

  const assignedByChannel = useMemo(() => {
    const map = {};
    (sequence.templates || []).forEach((t) => {
      map[t.templateType] = t;
    });
    return map;
  }, [sequence.templates]);

  const unassignedByType = useMemo(() => {
    const map = { EMAIL: [], SMS: [], WHATSAPP: [] };
    (allTemplates || []).forEach((t) => {
      if (!t.assigned && map[t.templateType]) {
        map[t.templateType].push(t);
      }
    });
    return map;
  }, [allTemplates]);

  const assignedCount = Object.keys(assignedByChannel).length;

  function handleAssign(channel, templateId) {
    if (!templateId) return;
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
    <div className="border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left cursor-pointer group"
      >
        {open ? (
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        ) : (
          <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        )}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
          Templates
        </span>
        <span className="text-xs text-slate-400">
          {assignedCount}/{CHANNELS.length} assigned
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          {CHANNELS.map((ch) => {
            const assigned = assignedByChannel[ch];
            const available = unassignedByType[ch] || [];
            const badge = CHANNEL_BADGE[ch];

            return (
              <div key={ch} className="flex items-center gap-2">
                <span className={clsx(
                  'inline-flex items-center justify-center w-20 px-2 py-1 rounded-md text-xs font-medium shrink-0',
                  badge.className
                )}>
                  {badge.label}
                </span>

                <div className="relative flex-1">
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
                    className={clsx(
                      'w-full px-3 py-1.5 text-sm rounded-lg outline-none cursor-pointer appearance-none',
                      'border border-slate-200 bg-white',
                      'hover:border-slate-300 focus:ring-2 focus:ring-cta/20 focus:border-cta',
                      'transition-all duration-150'
                    )}
                  >
                    <option value="">-- None --</option>
                    {assigned && (
                      <option value={assigned.id}>
                        {assigned.templateTitle || 'Untitled'} (assigned)
                      </option>
                    )}
                    {available.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.templateTitle || 'Untitled'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

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
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Card                                                          */
/* ------------------------------------------------------------------ */
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
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors duration-150">
      {/* Header row */}
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
              className="w-14 px-2 py-1 border border-slate-200 rounded-md text-sm text-center focus:ring-2 focus:ring-cta/20 focus:border-cta outline-none transition-all duration-150"
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
      <div className="flex items-center gap-6 mb-3">
        <Toggle
          id={`final-${sequence.id}`}
          checked={isFinalStep}
          onChange={(val) => { setIsFinalStep(val); autoSave('isFinalStep', val); }}
          label="Final step"
        />
        <Toggle
          id={`stop-${sequence.id}`}
          checked={stopOnReply}
          onChange={(val) => { setStopOnReply(val); autoSave('stopOnReply', val); }}
          label="Stop on reply"
        />
      </div>

      {/* Template Assignment — collapsible */}
      <TemplateAssociation
        sequence={sequence}
        service={service}
        allTemplates={allTemplates}
      />

      {/* AI Personalisation */}
      <div className="border-t border-slate-100 pt-3 mt-3">
        <div className="flex items-center gap-1">
          <Toggle
            id={`ai-${sequence.id}`}
            checked={useAiPersonalisation}
            onChange={(val) => { setUseAiPersonalisation(val); autoSave('useAiPersonalisation', val); }}
            label="AI personalisation"
          />
          <Zap size={13} className="text-amber-400 shrink-0" />
        </div>

        {useAiPersonalisation && (
          <div className="mt-3 ml-10 animate-in fade-in slide-in-from-top-1 duration-150">
            <label
              htmlFor={`ai-guidance-${sequence.id}`}
              className="block text-xs font-medium text-slate-500 mb-1.5"
            >
              Guidance for AI
            </label>
            <textarea
              id={`ai-guidance-${sequence.id}`}
              rows={2}
              placeholder="e.g. Keep it friendly and brief. Reference the service name."
              value={aiPersonalisationGuidance}
              onChange={(e) => setAiPersonalisationGuidance(e.target.value)}
              onBlur={() => autoSave('aiPersonalisationGuidance', aiPersonalisationGuidance)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none outline-none transition-all duration-150 placeholder:text-slate-400 focus:ring-2 focus:ring-cta/20 focus:border-cta"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main: SequencesTab                                                 */
/* ------------------------------------------------------------------ */
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
      {/* Header — matches TemplatesTab layout */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-primary">Chase Sequences</h3>
        <Button size="sm" onClick={handleAddStep} loading={createSequence.isPending}>
          <Plus size={14} />
          Add Step
        </Button>
      </div>

      {/* Temperature filter — segmented control matching TemplatesTab style */}
      <div className="flex gap-1 mb-1 bg-slate-100 rounded-lg p-1 w-fit">
        {TEMPERATURES.map((temp) => (
          <button
            key={temp.key}
            type="button"
            onClick={() => setActiveTemp(temp.key)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer',
              activeTemp === temp.key
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <span className={clsx('w-2 h-2 rounded-full shrink-0', temp.dot)} />
            {temp.label}
            <span className="text-xs opacity-60">
              ({sequences.filter((s) => s.temperature === temp.key).length})
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-4 mt-1.5">
        Temperature controls <span className="font-medium text-slate-500">timing only</span> — templates are shared across all tracks.
      </p>

      {/* Step list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : filteredSteps.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-400">
          {sequences.length === 0 ? (
            <>
              No steps yet.{' '}
              <button
                type="button"
                onClick={handleAddStep}
                className="text-cta hover:underline cursor-pointer font-medium"
              >
                Create your first step
              </button>
            </>
          ) : (
            `No steps for ${TEMPERATURES.find(t => t.key === activeTemp)?.label} temperature yet.`
          )}
        </div>
      ) : (
        <div className="space-y-2">
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

      {/* Bottom add step — subtle dashed button */}
      {!isLoading && filteredSteps.length > 0 && (
        <button
          type="button"
          onClick={handleAddStep}
          disabled={createSequence.isPending}
          className={clsx(
            'w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
            'border border-dashed border-slate-200 text-xs font-medium text-slate-400',
            'hover:border-slate-300 hover:text-slate-500 transition-all duration-200 cursor-pointer',
            createSequence.isPending && 'opacity-50 pointer-events-none'
          )}
        >
          <Plus size={14} />
          Add another step
        </button>
      )}

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
