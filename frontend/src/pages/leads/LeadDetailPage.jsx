import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Plus,
  Upload,
  Download,
  Eye,
  UserPlus,
  FileText,
  Clock,
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
import { PageHeader } from '@/components/shared/PageHeader';
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

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const CONTACT_FIELDS = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'address', label: 'Address' },
  { key: 'postcode', label: 'Postcode' },
  { key: 'city', label: 'City' },
  { key: 'county', label: 'County' },
  { key: 'country', label: 'Country' },
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: leadData, isLoading: leadLoading } = useLead(id);
  const { data: notesData } = useLeadNotes(id);
  const { data: filesData } = useLeadFiles(id);

  const { data: activitiesData } = useQuery({
    queryKey: ['leads', id, 'activities'],
    queryFn: () => activitiesApi.getLeadActivities(id),
    enabled: !!id,
  });

  const deleteLead = useDeleteLead();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();

  const [deleteLeadOpen, setDeleteLeadOpen] = useState(false);
  const [deleteFileTarget, setDeleteFileTarget] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const lead = leadData?.data ?? leadData ?? {};
  const notes = notesData?.data ?? notesData ?? [];
  const files = filesData?.data ?? filesData ?? [];
  const activities = activitiesData?.data ?? activitiesData ?? [];
  const opportunities = lead.opportunities ?? [];

  const fullName =
    [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Lead';

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
      key: 'service',
      label: 'Service',
      render: (val) => val?.name ?? val ?? '—',
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
      label: 'Next Chase Date',
      render: (val) => (val ? format(new Date(val), 'MMM d, yyyy') : '—'),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <Link
          to={`/opportunities/${row.id}`}
          className="p-1.5 rounded-md text-slate-400 hover:text-cta hover:bg-slate-100 transition-colors duration-200 inline-flex"
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
      {/* Header */}
      <PageHeader title={fullName}>
        {lead.source && <Badge variant="info">{lead.source}</Badge>}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/leads/${id}/edit`)}
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
      </PageHeader>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h2 className="text-base font-semibold text-primary mb-4">
              Contact Details
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {CONTACT_FIELDS.map((field) => (
                <div key={field.key}>
                  <p className="text-xs text-secondary uppercase tracking-wider mb-1">
                    {field.label}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {lead[field.key] || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-primary">
                Opportunities
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/opportunities/new?leadId=${id}`)}
              >
                <Plus size={14} />
                Add Opportunity
              </Button>
            </div>

            {opportunities.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No opportunities"
                description="Create an opportunity linked to this lead"
              />
            ) : (
              <Table
                columns={opportunityColumns}
                data={opportunities}
              />
            )}
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-primary">Notes</h2>
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
                icon={FileText}
                title="No notes"
                description="Add a note to keep track of important details"
              />
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-lg p-4 shadow-card"
                  >
                    <p className="text-sm text-primary">
                      {note.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {note.user && (
                        <span className="text-xs text-secondary">
                          by {note.user}
                        </span>
                      )}
                      {note.createdAt && (
                        <span className="text-xs text-secondary">
                          {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-primary">Files</h2>
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
                icon={FileText}
                title="No files"
                description="Upload files related to this lead"
              />
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white rounded-lg p-4 shadow-card flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-primary truncate">
                        {file.filename || file.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {file.fileType && (
                          <Badge variant="default">{file.fileType}</Badge>
                        )}
                        {file.size != null && (
                          <span className="text-xs text-secondary">
                            {formatBytes(file.size)}
                          </span>
                        )}
                        {file.createdAt && (
                          <span className="text-xs text-secondary">
                            {format(new Date(file.createdAt), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-cta hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteFileTarget(file)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Activity Timeline
            </h2>
            {activities.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No activity"
                description="Activity for this lead will appear here"
              />
            ) : (
              <ActivityTimeline activities={activities} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {noteModalOpen && (
        <AddNoteModal
          open={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          leadId={id}
        />
      )}

      {/* Delete Lead Confirmation */}
      <ConfirmDialog
        open={deleteLeadOpen}
        onClose={() => setDeleteLeadOpen(false)}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message={`Are you sure you want to delete ${fullName}? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        loading={deleteLead.isPending}
      />

      {/* Delete File Confirmation */}
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
