import { useState, useMemo } from 'react';
import {
  Plus,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Pencil,
  GitBranch,
  Trash2,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader } from '@/components/shared/PageHeader';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { useServices, useDeleteService } from '@/hooks/useServices';
import CreateServiceModal from './modals/CreateServiceModal';
import EditServiceModal from './modals/EditServiceModal';
import ChaseSequenceModal from './modals/ChaseSequenceModal';

const MODE_BADGE = {
  WORK_TYPE: { variant: 'info', label: 'Work Type' },
  PACKAGE: { variant: 'success', label: 'Package' },
};

function formatGBP(value) {
  if (value == null) return '\u2014';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
}

export default function ServicesPage() {
  const { data: servicesRes, isLoading } = useServices();
  const deleteService = useDeleteService();

  const [expandedCategories, setExpandedCategories] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [sequenceService, setSequenceService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const services = servicesRes?.data ?? [];

  const grouped = useMemo(() => {
    const map = {};
    const uncategorized = [];

    services.forEach((svc) => {
      if (svc.serviceCategory?.id) {
        const catId = svc.serviceCategory.id;
        if (!map[catId]) {
          map[catId] = {
            id: catId,
            name: svc.serviceCategory.categoryName,
            colourHex: svc.serviceCategory.colourHex || null,
            services: [],
          };
        }
        map[catId].services.push(svc);
      } else {
        uncategorized.push(svc);
      }
    });

    const categories = Object.values(map).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    if (uncategorized.length > 0) {
      categories.push({
        id: '__uncategorized',
        name: 'Uncategorized',
        colourHex: null,
        services: uncategorized,
      });
    }

    return categories;
  }, [services]);

  function toggleCategory(catId) {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteService.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Service deleted');
        setDeleteTarget(null);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Services">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Add Service
        </Button>
        <Button variant="secondary" onClick={() => {}}>
          <FolderPlus size={16} />
          Add Category
        </Button>
      </PageHeader>

      {services.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No services yet"
          description="Create your first service to start managing chase sequences."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Add Service
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {grouped.map((category) => {
            const isExpanded = expandedCategories[category.id] !== false;
            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-card overflow-hidden"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-5 py-3.5 hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: category.colourHex || '#94a3b8',
                    }}
                  />
                  <span className="font-semibold text-primary">
                    {category.name}
                  </span>
                  <Badge variant="default" className="ml-1">
                    {category.services.length}
                  </Badge>
                </button>

                {/* Services table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-t border-slate-200 bg-slate-50">
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Service Name
                          </th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Mode
                          </th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Temperature
                          </th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Recurrence
                          </th>
                          <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Active
                          </th>
                          <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {category.services.map((svc) => {
                          const mode = MODE_BADGE[svc.serviceMode] || {
                            variant: 'default',
                            label: svc.serviceMode,
                          };
                          return (
                            <tr
                              key={svc.id}
                              className="hover:bg-slate-50 transition-colors duration-200"
                            >
                              <td className="px-5 py-3 font-medium text-primary">
                                {svc.serviceName}
                              </td>
                              <td className="px-5 py-3">
                                <Badge variant={mode.variant}>
                                  {mode.label}
                                </Badge>
                              </td>
                              <td className="px-5 py-3 text-primary">
                                {svc.serviceMode === 'PACKAGE'
                                  ? formatGBP(svc.price)
                                  : '\u2014'}
                              </td>
                              <td className="px-5 py-3">
                                <TemperatureBadge
                                  temperature={svc.defaultTemperature}
                                />
                              </td>
                              <td className="px-5 py-3 text-primary">
                                {svc.recurrenceDays
                                  ? `${svc.recurrenceDays} days`
                                  : '\u2014'}
                              </td>
                              <td className="px-5 py-3">
                                <div
                                  className={clsx(
                                    'w-2.5 h-2.5 rounded-full',
                                    svc.active !== false
                                      ? 'bg-green-500'
                                      : 'bg-gray-300'
                                  )}
                                />
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditService(svc)}
                                  >
                                    <Pencil size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSequenceService(svc)}
                                  >
                                    <GitBranch size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setDeleteTarget(svc)}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateServiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editService && (
        <EditServiceModal
          open={!!editService}
          onClose={() => setEditService(null)}
          service={editService}
        />
      )}

      {sequenceService && (
        <ChaseSequenceModal
          open={!!sequenceService}
          onClose={() => setSequenceService(null)}
          service={sequenceService}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteService.isPending}
      />
    </>
  );
}
