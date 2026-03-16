import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Plus,
  Upload,
  Download,
  Eye,
  FileText,
  Clock,
  Target,
  StickyNote,
  Paperclip,
  Mail,
  Phone,
  Smartphone,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActivityTimeline } from '@/components/shared/ActivityTimeline';
import {
  useLead,
  useDeleteLead,
  useLeadNotes,
  useLeadFiles,
  useUploadFile,
  useDeleteFile,
} from '@/hooks/useLeads';
import * as activitiesApi from '@/api/activitiesApi';
import * as leadsApi from '@/api/leadsApi';
import { AddNoteModal } from './modals/AddNoteModal';
import { EditLeadModal } from './modals/EditLeadModal';
import { CreateOpportunityModal } from '@/pages/opportunities/modals/CreateOpportunityModal';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const TABS = [
  { key: 'opportunities', label: 'Opportunities', icon: Target },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'files', label: 'Files', icon: Paperclip },
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: lead, isLoading: leadLoading } = useLead(id);
  const { data: notesData } = useLeadNotes(id);
  const { data: filesData } = useLeadFiles(id);

  const { data: activitiesData } = useQuery({
    queryKey: ['leads', id, 'activities'],
    queryFn: () => activitiesApi.getLeadActivities(id).then((res) => res.data),
    enabled: !!id,
  });

  const deleteLead = useDeleteLead();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();

  const [activeTab, setActiveTab] = useState('opportunities');
  const [deleteLeadOpen, setDeleteLeadOpen] = useState(false);
  const [deleteFileTarget, setDeleteFileTarget] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [createOppOpen, setCreateOppOpen] = useState(false);

  const leadData = lead ?? {};
  const contact = leadData.contactDetails ?? {};
  const notes = Array.isArray(notesData) ? notesData : notesData?.content ?? [];
  const files = Array.isArray(filesData) ? filesData : filesData?.content ?? [];
  const activities = Array.isArray(activitiesData) ? activitiesData : [];
  const opportunities = leadData.opportunities ?? [];

  const fullName =
    [leadData.firstName, leadData.lastName].filter(Boolean).join(' ') || 'Lead';

  const initials = [leadData.firstName?.[0], leadData.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?';

  function handleDeleteLead() {
    deleteLead.mutate(id, {
      onSuccess: () => navigate('/leads'),
    });
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadFile.mutate({ leadId: id, formData });
    e.target.value = '';
  }

  function handleDeleteFile() {
    if (!deleteFileTarget) return;
    deleteFile.mutate(
      { leadId: id, fileId: deleteFileTarget.id },
      { onSuccess: () => setDeleteFileTarget(null) }
    );
  }

  async function handleDownloadFile(file) {
    try {
      const response = await leadsApi.downloadFile(id, file.id);
      const blob = response instanceof Blob ? response : new Blob([response]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename || file.name || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Error handled by API layer
    }
  }

  const opportunityColumns = [
    {
      key: 'serviceName',
      label: 'Service',
      render: (val) => val || '—',
    },
    {
      key: 'temperature',
      label: 'Temperature',
      render: (val) => (val ? <TemperatureBadge temperature={val} /> : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (val ? <StatusBadge status={val} /> : '—'),
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (val) => val || '—',
    },
    {
      key: 'nextChaseDate',
      label: 'Next Chase',
      render: (val) => (val ? format(new Date(val), 'MMM d, yyyy') : '—'),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <Link
          to={`/opportunities/${row.id}`}
          className="p-1.5 rounded-md text-slate-400 hover:text-cta hover:bg-slate-100 transition-colors duration-200 inline-flex"
          aria-label="View opportunity"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ];

  if (leadLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {/* ── Lead Header Card ── */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-cta/10 text-cta flex items-center justify-center text-lg font-bold shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">{fullName}</h1>
                {leadData.source && (
                  <Badge variant="info">{leadData.source}</Badge>
                )}
                {leadData.rating && (
                  <TemperatureBadge temperature={leadData.rating} />
                )}
              </div>
              {leadData.handler && (
                <p className="text-sm text-secondary mt-1">
                  Handled by <span className="font-medium">{leadData.handler}</span>
                </p>
              )}
              {leadData.dateCreated && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Added {format(new Date(leadData.dateCreated), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditLeadOpen(true)}
            >
              <Pencil size={14} />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteLeadOpen(true)}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>

        {/* ── Contact Details Inline ── */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {contact.email && (
              <ContactItem icon={Mail} label="Email" value={contact.email} />
            )}
            {contact.phone && (
              <ContactItem icon={Phone} label="Phone" value={contact.phone} />
            )}
            {contact.mobile && (
              <ContactItem icon={Smartphone} label="Mobile" value={contact.mobile} />
            )}
            {contact.whatsapp && (
              <ContactItem icon={MessageCircle} label="WhatsApp" value={contact.whatsapp} />
            )}
            {(contact.addressLine || contact.city || contact.postcode) && (
              <ContactItem
                icon={MapPin}
                label="Address"
                value={[contact.addressLine, contact.city, contact.postcode, contact.county, contact.country]
                  .filter(Boolean)
                  .join(', ')}
              />
            )}
            {!contact.email && !contact.phone && !contact.mobile && !contact.whatsapp && !contact.addressLine && (
              <p className="text-sm text-slate-400 italic">No contact details added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Left column: Tabbed content ── */}
        <div className="lg:col-span-3">
          {/* Tab bar */}
          <div className="bg-white rounded-xl shadow-card">
            <div className="flex border-b border-slate-200">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const count =
                  tab.key === 'opportunities'
                    ? opportunities.length
                    : tab.key === 'notes'
                    ? notes.length
                    : files.length;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={clsx(
                      'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px cursor-pointer',
                      isActive
                        ? 'border-cta text-cta'
                        : 'border-transparent text-secondary hover:text-primary hover:border-slate-300'
                    )}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={clsx(
                          'text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
                          isActive
                            ? 'bg-cta/10 text-cta'
                            : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {/* ── Opportunities Tab ── */}
              {activeTab === 'opportunities' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-secondary">
                      Track opportunities linked to this lead
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCreateOppOpen(true)}
                    >
                      <Plus size={14} />
                      Add Opportunity
                    </Button>
                  </div>

                  {opportunities.length === 0 ? (
                    <EmptyState
                      icon={Target}
                      title="No opportunities yet"
                      description="Create an opportunity to start chasing this lead"
                    />
                  ) : (
                    <Table columns={opportunityColumns} data={opportunities} />
                  )}
                </div>
              )}

              {/* ── Notes Tab ── */}
              {activeTab === 'notes' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-secondary">
                      Keep track of important details
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setNoteModalOpen(true)}
                    >
                      <Plus size={14} />
                      Add Note
                    </Button>
                  </div>

                  {notes.length === 0 ? (
                    <EmptyState
                      icon={StickyNote}
                      title="No notes yet"
                      description="Add a note to keep track of important details"
                    />
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="bg-slate-50 rounded-lg p-4 border border-slate-100"
                        >
                          <p className="text-sm text-primary leading-relaxed">
                            {note.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-slate-100">
                            {note.user && (
                              <span className="text-xs text-secondary font-medium">
                                {note.user}
                              </span>
                            )}
                            {(note.dateAdded || note.createdAt) && (
                              <span className="text-xs text-slate-400">
                                {format(
                                  new Date(note.dateAdded || note.createdAt),
                                  'MMM d, yyyy · h:mm a'
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Files Tab ── */}
              {activeTab === 'files' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-secondary">
                      Documents and attachments
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {files.length === 0 ? (
                    <EmptyState
                      icon={Paperclip}
                      title="No files yet"
                      description="Upload documents related to this lead"
                    />
                  ) : (
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-slate-50 rounded-lg p-3.5 border border-slate-100 group hover:border-slate-200 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-cta/10 text-cta flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-primary truncate">
                                {file.filename || file.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {file.fileType && (
                                  <span className="text-xs text-slate-400 uppercase">
                                    {file.fileType}
                                  </span>
                                )}
                                {file.fileSize != null && (
                                  <span className="text-xs text-slate-400">
                                    {formatBytes(file.fileSize)}
                                  </span>
                                )}
                                {(file.dateAdded || file.createdAt) && (
                                  <span className="text-xs text-slate-400">
                                    {format(
                                      new Date(file.dateAdded || file.createdAt),
                                      'MMM d, yyyy'
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-cta hover:bg-white transition-colors duration-200 cursor-pointer"
                              aria-label="Download file"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteFileTarget(file)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-white transition-colors duration-200 cursor-pointer"
                              aria-label="Delete file"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: Activity Timeline ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-card p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-secondary" />
              <h2 className="text-base font-semibold text-primary">
                Activity Timeline
              </h2>
            </div>
            {activities.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No activity yet"
                description="Activity for this lead will appear here"
              />
            ) : (
              <ActivityTimeline activities={activities} />
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {noteModalOpen && (
        <AddNoteModal
          open={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          leadId={id}
        />
      )}

      {editLeadOpen && (
        <EditLeadModal
          open={editLeadOpen}
          onClose={() => setEditLeadOpen(false)}
          lead={leadData}
        />
      )}

      {createOppOpen && (
        <CreateOpportunityModal
          open={createOppOpen}
          onClose={() => setCreateOppOpen(false)}
          prefilledLeadId={id}
        />
      )}

      <ConfirmDialog
        open={deleteLeadOpen}
        onClose={() => setDeleteLeadOpen(false)}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message={`Are you sure you want to delete ${fullName}? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        loading={deleteLead.isPending}
      />

      <ConfirmDialog
        open={!!deleteFileTarget}
        onClose={() => setDeleteFileTarget(null)}
        onConfirm={handleDeleteFile}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteFileTarget?.filename || deleteFileTarget?.name}"?`}
        confirmText="Delete"
        loading={deleteFile.isPending}
      />
    </>
  );
}

/* ── Small contact detail chip ── */
function ContactItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-secondary" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400 uppercase tracking-wider leading-none">
          {label}
        </p>
        <p className="text-sm font-medium text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}
