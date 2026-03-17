import { useState, useMemo } from 'react';
import {
  Plus,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Pencil,
  Settings2,
  Trash2,
  Layers,
  MoreHorizontal,
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
import {
  useServices,
  useDeleteService,
  useCategories,
  useDeleteCategory,
} from '@/hooks/useServices';
import CreateServiceModal from './modals/CreateServiceModal';
import EditServiceModal from './modals/EditServiceModal';
import ServiceConfigModal from './modals/ServiceConfigModal';
import CreateCategoryModal from './modals/CreateCategoryModal';
import EditCategoryModal from './modals/EditCategoryModal';

const MODE_BADGE = {
  WORK_TYPE: { variant: 'info', label: 'Work Type' },
  PACKAGE: { variant: 'success', label: 'Package' },
};

function formatGBP(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

function CategoryActions({ category, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors duration-200"
        aria-label="Category options"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-36 bg-white rounded-xl shadow-modal border border-slate-200 py-1 overflow-hidden">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(category); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-slate-50 cursor-pointer transition-colors duration-150"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(category); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const { data: servicesRes, isLoading: servicesLoading } = useServices();
  const { data: categoriesRes, isLoading: categoriesLoading } = useCategories();
  const deleteService = useDeleteService();
  const deleteCategory = useDeleteCategory();

  const [expandedCategories, setExpandedCategories] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [sequenceService, setSequenceService] = useState(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);

  const services = servicesRes ?? [];
  const categories = categoriesRes ?? [];

  // Build a map of categoryId → full category (for colourHex)
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = c; });
    return map;
  }, [categories]);

  const grouped = useMemo(() => {
    const map = {};
    const uncategorized = [];

    services.forEach((svc) => {
      if (svc.serviceCategoryId) {
        const catId = svc.serviceCategoryId;
        if (!map[catId]) {
          const fullCat = categoryMap[catId];
          map[catId] = {
            id: catId,
            name: svc.categoryName,
            colourHex: fullCat?.colourHex || null,
            iconKey: fullCat?.iconKey || null,
            sortOrder: fullCat?.sortOrder ?? 0,
            services: [],
          };
        }
        map[catId].services.push(svc);
      } else {
        uncategorized.push(svc);
      }
    });

    // Also include categories that have no services yet
    categories.forEach((cat) => {
      if (!map[cat.id]) {
        map[cat.id] = {
          id: cat.id,
          name: cat.categoryName,
          colourHex: cat.colourHex || null,
          iconKey: cat.iconKey || null,
          sortOrder: cat.sortOrder ?? 0,
          services: [],
        };
      }
    });

    const result = Object.values(map).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });

    if (uncategorized.length > 0) {
      result.push({
        id: '__uncategorized',
        name: 'Uncategorized',
        colourHex: null,
        services: uncategorized,
      });
    }

    return result;
  }, [services, categories, categoryMap]);

  function toggleCategory(catId) {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: prev[catId] === undefined ? false : !prev[catId],
    }));
  }

  function isCategoryExpanded(catId) {
    return expandedCategories[catId] !== false;
  }

  function handleDeleteService() {
    if (!deleteServiceTarget) return;
    deleteService.mutate(deleteServiceTarget.id, {
      onSuccess: () => {
        toast.success('Service deleted');
        setDeleteServiceTarget(null);
      },
    });
  }

  function handleDeleteCategory() {
    if (!deleteCategoryTarget) return;
    deleteCategory.mutate(deleteCategoryTarget.id, {
      onSuccess: () => {
        toast.success('Category deleted');
        setDeleteCategoryTarget(null);
      },
    });
  }

  const isLoading = servicesLoading || categoriesLoading;

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
        <Button variant="secondary" onClick={() => setCreateCategoryOpen(true)}>
          <FolderPlus size={16} />
          Add Category
        </Button>
      </PageHeader>

      {services.length === 0 && categories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No services yet"
          description="Create a category to organise your services, then add your first service."
          action={
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setCreateCategoryOpen(true)}>
                <FolderPlus size={16} />
                Add Category
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus size={16} />
                Add Service
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {grouped.map((category) => {
            const isExpanded = isCategoryExpanded(category.id);
            const color = category.colourHex || '#94a3b8';
            const isSystem = category.id === '__uncategorized';

            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-card overflow-hidden"
              >
                {/* Category header */}
                <div className="flex items-center">
                  {/* Color stripe */}
                  <div
                    className="w-1 self-stretch shrink-0"
                    style={{ backgroundColor: color }}
                  />

                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex-1 flex items-center gap-2.5 px-4 py-3.5 hover:bg-slate-50 transition-colors duration-200 cursor-pointer text-left min-w-0"
                  >
                    {isExpanded ? (
                      <ChevronDown size={15} className="text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight size={15} className="text-slate-400 shrink-0" />
                    )}
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold text-primary truncate">
                      {category.name}
                    </span>
                    <Badge variant="default" className="ml-0.5 shrink-0">
                      {category.services.length}
                    </Badge>
                  </button>

                  {/* Category actions — hidden for __uncategorized */}
                  {!isSystem && (
                    <div className="pr-4 shrink-0">
                      <CategoryActions
                        category={category}
                        onEdit={setEditCategory}
                        onDelete={setDeleteCategoryTarget}
                      />
                    </div>
                  )}
                </div>

                {/* Services table */}
                {isExpanded && (
                  <>
                    {category.services.length === 0 ? (
                      <div className="px-6 py-5 border-t border-slate-100 text-sm text-slate-400 text-center">
                        No services in this category yet.{' '}
                        <button
                          type="button"
                          onClick={() => setCreateOpen(true)}
                          className="text-cta hover:underline cursor-pointer font-medium"
                        >
                          Add one
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-t border-slate-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50/70">
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Service
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
                                Re-chase
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
                                  className="hover:bg-slate-50/60 transition-colors duration-150"
                                >
                                  <td className="px-5 py-3">
                                    <div>
                                      <p className="font-medium text-primary">
                                        {svc.serviceName}
                                      </p>
                                      {svc.serviceDescription && (
                                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
                                          {svc.serviceDescription}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-5 py-3">
                                    <Badge variant={mode.variant}>{mode.label}</Badge>
                                  </td>
                                  <td className="px-5 py-3 text-primary tabular-nums">
                                    {svc.serviceMode === 'PACKAGE'
                                      ? formatGBP(svc.price)
                                      : '—'}
                                  </td>
                                  <td className="px-5 py-3">
                                    <TemperatureBadge temperature={svc.defaultTemperature} />
                                  </td>
                                  <td className="px-5 py-3 text-slate-600 text-xs">
                                    {svc.recurrenceDays
                                      ? `Every ${svc.recurrenceDays}d`
                                      : '—'}
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        title="Edit service"
                                        onClick={() => setEditService(svc)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors duration-150"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Sequences &amp; templates"
                                        onClick={() => setSequenceService(svc)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-cta hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                                      >
                                        <Settings2 size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Delete service"
                                        onClick={() => setDeleteServiceTarget(svc)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateServiceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CreateCategoryModal open={createCategoryOpen} onClose={() => setCreateCategoryOpen(false)} />

      {editService && (
        <EditServiceModal
          open={!!editService}
          onClose={() => setEditService(null)}
          service={editService}
        />
      )}

      {editCategory && (
        <EditCategoryModal
          open={!!editCategory}
          onClose={() => setEditCategory(null)}
          category={editCategory}
        />
      )}

      {sequenceService && (
        <ServiceConfigModal
          open={!!sequenceService}
          onClose={() => setSequenceService(null)}
          service={sequenceService}
        />
      )}

      <ConfirmDialog
        open={!!deleteServiceTarget}
        onClose={() => setDeleteServiceTarget(null)}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message={`Delete "${deleteServiceTarget?.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteService.isPending}
      />

      <ConfirmDialog
        open={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Delete the "${deleteCategoryTarget?.name}" category? Services in this category will become uncategorized.`}
        confirmText="Delete"
        loading={deleteCategory.isPending}
      />
    </>
  );
}
