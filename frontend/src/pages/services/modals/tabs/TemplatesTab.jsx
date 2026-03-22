import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  Clipboard,
  Link2Off,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import {
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDuplicateTemplate,
  useUnassignTemplate,
  useDeleteTemplate,
} from '@/hooks/useTemplates';

const CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP'];

const CHANNEL_BADGE = {
  EMAIL: { variant: 'info', label: 'Email' },
  SMS: { variant: 'success', label: 'SMS' },
  WHATSAPP: { variant: 'default', label: 'WhatsApp', className: 'bg-purple-100 text-purple-700' },
};

const CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
];

const TOKENS = [
  '{{first_name}}',
  '{{last_name}}',
  '{{business_name}}',
  '{{service_name}}',
  '{{handler_name}}',
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'blockquote',
];

function TemplateCard({ template, serviceId, onEdit }) {
  const duplicateTemplate = useDuplicateTemplate();
  const unassignTemplate = useUnassignTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const badge = CHANNEL_BADGE[template.templateType] || { variant: 'default', label: template.templateType };

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors duration-150">
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant={badge.variant} className={badge.className}>
            {badge.label}
          </Badge>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary truncate">
              {template.templateTitle || 'Untitled template'}
            </p>
            {template.templateDescription && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{template.templateDescription}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {template.assigned ? (
            <Badge variant="success" className="text-xs">Step {template.stepNumber}</Badge>
          ) : (
            <Badge variant="default" className="text-xs">Unassigned</Badge>
          )}

          <div className="flex items-center gap-0.5 ml-1">
            <button
              type="button"
              title="Edit"
              onClick={() => onEdit(template)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors duration-150"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              title="Duplicate"
              onClick={() => duplicateTemplate.mutate({ serviceId, id: template.id })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cta hover:bg-blue-50 cursor-pointer transition-colors duration-150"
            >
              <Copy size={14} />
            </button>
            {template.assigned && (
              <button
                type="button"
                title="Unassign from step"
                onClick={() => unassignTemplate.mutate({ serviceId, id: template.id })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors duration-150"
              >
                <Link2Off size={14} />
              </button>
            )}
            <button
              type="button"
              title="Delete"
              onClick={() => setDeleteOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteTemplate.mutate({ serviceId, id: template.id }, {
            onSuccess: () => setDeleteOpen(false),
          });
        }}
        title="Delete Template"
        message={`Delete "${template.templateTitle || 'Untitled'}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteTemplate.isPending}
      />
    </>
  );
}

function TemplateEditor({ template, serviceId, onBack, isNew }) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [templateType, setTemplateType] = useState(template?.templateType || 'EMAIL');
  const [title, setTitle] = useState(template?.templateTitle || '');
  const [description, setDescription] = useState(template?.templateDescription || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [content, setContent] = useState(template?.templateContent || '');
  const [editorMode, setEditorMode] = useState('visual');

  const isEmail = templateType === 'EMAIL';
  const charLimit = templateType === 'SMS' ? 160 : templateType === 'WHATSAPP' ? 1024 : undefined;
  const contentLength = content?.length ?? 0;
  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  function handleSave() {
    const data = {
      templateTitle: title,
      templateDescription: description || null,
      subject: isEmail ? subject : null,
      templateContent: content,
    };

    if (isNew) {
      data.templateType = templateType;
      createTemplate.mutate({ serviceId, data }, {
        onSuccess: () => {
          toast.success('Template created');
          onBack();
        },
      });
    } else {
      updateTemplate.mutate({ serviceId, id: template.id, data }, {
        onSuccess: () => {
          toast.success('Template saved');
          onBack();
        },
      });
    }
  }

  function copyToken(token) {
    navigator.clipboard.writeText(token);
    toast.success('Copied!');
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary mb-4 cursor-pointer transition-colors duration-150"
      >
        <ArrowLeft size={14} />
        Back to templates
      </button>

      <h3 className="text-base font-bold text-primary mb-4">
        {isNew ? 'Create Template' : 'Edit Template'}
      </h3>

      <div className="space-y-4">
        {/* Type selector — only on create */}
        {isNew && (
          <Select
            label="Template Type *"
            id="templateType"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            options={CHANNEL_OPTIONS}
          />
        )}

        {!isNew && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Type:</span>
            <Badge variant={CHANNEL_BADGE[templateType]?.variant} className={CHANNEL_BADGE[templateType]?.className}>
              {CHANNEL_BADGE[templateType]?.label || templateType}
            </Badge>
          </div>
        )}

        <Input
          label="Template Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Initial Follow-up Email"
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this template..."
        />

        {isEmail && (
          <Input
            label="Subject Line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line"
          />
        )}

        {/* Content editor */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">Content</label>

          {isEmail ? (
            <>
              {/* Visual / HTML toggle */}
              <div className="flex gap-1 mb-2">
                {['visual', 'html'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setEditorMode(mode)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer capitalize',
                      editorMode === mode
                        ? 'bg-cta text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {editorMode === 'visual' ? (
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Write your email content..."
                  />
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<html>...</html>"
                  rows={12}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg resize-none outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-900 text-green-400"
                />
              )}
            </>
          ) : (
            <div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your message..."
                maxLength={charLimit}
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
          )}
        </div>

        {/* Available Tokens */}
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
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

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="secondary" onClick={onBack}>Cancel</Button>
          <Button onClick={handleSave} loading={isSaving}>
            {isNew ? 'Create Template' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesTab({ service }) {
  const { data: templatesRes, isLoading, isError, refetch } = useTemplates(service?.id);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [editTarget, setEditTarget] = useState(null); // template object or 'new'

  const templates = templatesRes ?? [];

  const filtered = useMemo(() => {
    if (typeFilter === 'ALL') return templates;
    return templates.filter((t) => t.templateType === typeFilter);
  }, [templates, typeFilter]);

  // Show editor
  if (editTarget) {
    return (
      <TemplateEditor
        template={editTarget === 'new' ? null : editTarget}
        serviceId={service.id}
        onBack={() => setEditTarget(null)}
        isNew={editTarget === 'new'}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError && templates.length === 0) {
    return <ErrorState title="Unable to load templates" onRetry={refetch} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-primary">Templates</h3>
        <Button size="sm" onClick={() => setEditTarget('new')}>
          <Plus size={14} />
          Create Template
        </Button>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
        {['ALL', ...CHANNELS].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={clsx(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer',
              typeFilter === type
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {type === 'ALL' ? 'All' : CHANNEL_BADGE[type]?.label || type}
            <span className="ml-1 text-xs opacity-60">
              ({type === 'ALL' ? templates.length : templates.filter(t => t.templateType === type).length})
            </span>
          </button>
        ))}
      </div>

      {/* Template list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-500">
          {templates.length === 0 ? (
            <>
              No templates yet.{' '}
              <button
                type="button"
                onClick={() => setEditTarget('new')}
                className="text-cta hover:underline cursor-pointer font-medium"
              >
                Create your first template
              </button>
            </>
          ) : (
            'No templates match this filter.'
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              serviceId={service.id}
              onEdit={setEditTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
}
