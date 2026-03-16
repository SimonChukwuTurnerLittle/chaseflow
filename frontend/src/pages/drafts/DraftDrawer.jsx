import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { ActivityTimeline } from '@/components/shared/ActivityTimeline';

import {
  useDraft,
  useApproveDraft,
  useRejectDraft,
  useUpdateDraft,
} from '@/hooks/useDrafts';
import { getActivities } from '@/api/activitiesApi';

const CHANNEL_BADGE = {
  EMAIL: { variant: 'info', label: 'Email' },
  SMS: { variant: 'success', label: 'SMS' },
  WHATSAPP: { variant: 'default', label: 'WhatsApp', className: 'bg-purple-100 text-purple-700' },
};

const CHAR_LIMITS = {
  SMS: 160,
  WHATSAPP: 1024,
};

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
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'blockquote',
];

export function DraftDrawer({ open, onClose, draftId }) {
  // Local editor state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState('visual');

  // Data
  const { data: draftData, isLoading } = useDraft(draftId);
  const draft = draftData?.data ?? null;

  const opportunityId = draft?.opportunityId;
  const { data: activitiesData } = useQuery({
    queryKey: ['activities', opportunityId],
    queryFn: () => getActivities(opportunityId),
    enabled: !!opportunityId,
  });
  const activities = activitiesData?.data ?? [];

  // Mutations
  const approveMutation = useApproveDraft();
  const rejectMutation = useRejectDraft();
  const updateMutation = useUpdateDraft();

  const channel = draft?.channel || draft?.templateType || '';
  const channelConfig = CHANNEL_BADGE[channel];
  const charLimit = CHAR_LIMITS[channel];
  const isEmail = channel === 'EMAIL';
  const contentLength = (content || '').replace(/<[^>]*>/g, '').length;
  const nearLimit = charLimit && contentLength >= charLimit * 0.9;

  // Initialize from draft data
  useEffect(() => {
    if (draft) {
      setSubject(draft.subject || '');
      setContent(draft.content || '');
      setEditorMode('visual');
    }
  }, [draft]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSubject('');
      setContent('');
      setEditorMode('visual');
    }
  }, [open]);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(draftId);
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync(draftId);
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: draftId,
        data: {
          subject: isEmail ? subject : undefined,
          content,
        },
      });
      toast.success('Draft updated successfully');
    } catch {
      // Error handled by mutation hook
    }
  };

  const handleContentChange = (value) => {
    if (charLimit) {
      const plainText = value.replace(/<[^>]*>/g, '');
      if (plainText.length > charLimit) return;
    }
    setContent(value);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Review Draft"
      wide
    >
      {isLoading || !draft ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto pb-24">
            {/* Draft header */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              <span className="font-semibold text-primary text-lg">
                {draft.leadName || draft.lead?.name || 'Unknown Lead'}
              </span>
              <span className="text-sm text-secondary">
                {draft.serviceName || draft.service?.name || ''}
              </span>
              {draft.temperature && (
                <TemperatureBadge temperature={draft.temperature} />
              )}
              {channelConfig && (
                <Badge
                  variant={channelConfig.variant}
                  className={channelConfig.className}
                >
                  {channelConfig.label}
                </Badge>
              )}
            </div>

            {/* Editor section */}
            <div className="mb-8">
              {isEmail ? (
                <>
                  {/* Subject */}
                  <Input
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mb-4"
                    id="draft-subject"
                  />

                  {/* Editor mode toggle */}
                  <div className="flex gap-1 mb-3">
                    <button
                      onClick={() => setEditorMode('visual')}
                      className={clsx(
                        'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50',
                        editorMode === 'visual'
                          ? 'bg-cta text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      Visual
                    </button>
                    <button
                      onClick={() => setEditorMode('html')}
                      className={clsx(
                        'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50',
                        editorMode === 'html'
                          ? 'bg-cta text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      HTML
                    </button>
                  </div>

                  {/* Visual editor */}
                  {editorMode === 'visual' ? (
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={handleContentChange}
                        modules={QUILL_MODULES}
                        formats={QUILL_FORMATS}
                        className="bg-white"
                      />
                    </div>
                  ) : (
                    /* HTML editor (monospace textarea placeholder for CodeMirror) */
                    <textarea
                      value={content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className={clsx(
                        'w-full min-h-[300px] p-4 rounded-lg text-sm outline-none',
                        'bg-slate-900 text-green-400 font-mono',
                        'border border-slate-700',
                        'focus:ring-2 focus:ring-cta/30 focus:border-cta',
                        'resize-y'
                      )}
                      spellCheck={false}
                    />
                  )}
                </>
              ) : (
                /* SMS / WhatsApp editor */
                <>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Message Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => {
                      if (charLimit && e.target.value.length > charLimit) return;
                      setContent(e.target.value);
                    }}
                    maxLength={charLimit}
                    className={clsx(
                      'w-full min-h-[160px] px-3 py-2 border rounded-lg text-sm outline-none',
                      'transition-all duration-200 resize-y',
                      'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                      'placeholder:text-slate-400 border-slate-300'
                    )}
                    placeholder={`Type your ${channel.toLowerCase()} message...`}
                  />
                  {charLimit && (
                    <p
                      className={clsx(
                        'text-xs mt-1 text-right',
                        nearLimit ? 'text-red-500' : 'text-slate-400'
                      )}
                    >
                      {content.length}/{charLimit}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Activity History */}
            <div>
              <h3 className="text-base font-semibold text-primary mb-4">
                Previous Chases
              </h3>
              <ActivityTimeline activities={activities} />
            </div>
          </div>

          {/* Sticky bottom action bar */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3 -mx-6 -mb-4 px-6">
            <Button
              onClick={handleApprove}
              loading={approveMutation.isPending}
            >
              Approve &amp; Send
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              loading={rejectMutation.isPending}
            >
              Reject
            </Button>
            <Button
              variant="secondary"
              onClick={handleSave}
              loading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
