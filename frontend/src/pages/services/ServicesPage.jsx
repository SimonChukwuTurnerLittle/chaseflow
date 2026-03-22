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
  Package,
  Briefcase,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tooltip from '@radix-ui/react-tooltip';

import { useSetPageHeader } from '@/contexts/PageHeaderContext';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
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

const MODE_CONFIG = {
  WORK_TYPE: { variant: 'info', label: 'Work Type', icon: Briefcase },
  PACKAGE: { variant: 'success', label: 'Package', icon: Package },
};

function formatGBP(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function CategoryActionsMenu({ category, onEdit, onDelete }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50"
          aria-label="Category options"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[160px] bg-white rounded-xl shadow-modal border border-slate-200 py-1.5 z-50 animate-in fade-in-0 zoom-in-95"
          align="end"
          sideOffset={5}
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-slate-50 cursor-pointer outline-none transition-colors duration-150 rounded-md mx-1"
            onSelect={() => onEdit(category)}
          >
            <Pencil size={14} className="text-slate-400" />
            Edit Category
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none transition-colors duration-150 rounded-md mx-1"
            onSelect={() => onDelete(category)}
          >
            <Trash2 size={14} />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ServiceRow({ svc, onEdit, onConfig, onDelete }) {
  const mode = MODE_CONFIG[svc.serviceMode] || { variant: 'default', label: svc.serviceMode, icon: Briefcase };
  const ModeIcon = mode.icon;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ duration: 0.25 }}
      className="group hover:bg-slate-50/60 transition-colors duration-150"
    >
      <td className="px-5 py-3.5">
        <div>
          <p className="font-medium text-primary">{svc.serviceName}</p>
          {svc.serviceDescription && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">
              {svc.serviceDescription}
            </p>
          )}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
          mode.variant === 'info' && 'bg-blue-50 text-blue-700',
          mode.variant === 'success' && 'bg-emerald-50 text-emerald-700',
          mode.variant === 'default' && 'bg-slate-100 text-slate-600',
        )}>
          <ModeIcon size={12} />
          {mode.label}
        </span>
      </td>
      <td className="px-5 py-3.5 text-primary tabular-nums font-medium">
        {svc.serviceMode === 'PACKAGE' ? formatGBP(svc.price) : '—'}
      </td>
      <td className="px-5 py-3.5">
        <TemperatureBadge temperature={svc.defaultTemperature} />
      </td>
      <td className="px-5 py-3.5">
        {svc.recurrenceDays ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <RefreshCw size={11} className="text-slate-400" />
            {svc.recurrenceDays}d
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
          <Tooltip.Provider delayDuration={300}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => onEdit(svc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors duration-150"
                >
                  <Pencil size={14} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-primary text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg" sideOffset={5}>
                  Edit service
                  <Tooltip.Arrow className="fill-primary" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => onConfig(svc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cta hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                >
                  <Settings2 size={14} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-primary text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg" sideOffset={5}>
                  Sequences & templates
                  <Tooltip.Arrow className="fill-primary" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => onDelete(svc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-primary text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg" sideOffset={5}>
                  Delete service
                  <Tooltip.Arrow className="fill-primary" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </td>
    </motion.tr>
  );
}

function CategoryGroup({
  category,
  isSystem,
  onEditCategory,
  onDeleteCategory,
  onEditService,
  onConfigService,
  onDeleteService,
  onAddService,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const color = category.colourHex || '#94a3b8';

  return (
    <motion.div variants={itemVariants}>
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Category header */}
          <div className="flex items-center">
            {/* Color stripe */}
            <div
              className="w-1.5 self-stretch shrink-0 rounded-l-2xl"
              style={{ backgroundColor: color }}
            />

            <Collapsible.Trigger asChild>
              <button
                type="button"
                className="flex-1 flex items-center gap-2.5 px-4 py-3.5 hover:bg-slate-50/80 transition-colors duration-200 cursor-pointer text-left min-w-0 focus-visible:outline-none"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={15} className="text-slate-400" />
                </motion.div>
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-primary truncate">
                  {category.name}
                </span>
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                  {category.services.length}
                </span>
              </button>
            </Collapsible.Trigger>

            {!isSystem && (
              <div className="pr-3 shrink-0">
                <CategoryActionsMenu
                  category={category}
                  onEdit={onEditCategory}
                  onDelete={onDeleteCategory}
                />
              </div>
            )}
          </div>

          {/* Collapsible services */}
          <Collapsible.Content>
            <AnimatePresence>
              {category.services.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-6 border-t border-slate-100 text-sm text-slate-400 text-center"
                >
                  No services in this category yet.{' '}
                  <button
                    type="button"
                    onClick={onAddService}
                    className="text-cta hover:underline cursor-pointer font-medium"
                  >
                    Add one
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-x-auto border-t border-slate-100"
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60">
                        {['Service', 'Mode', 'Price', 'Temperature', 'Re-chase', ''].map((h) => (
                          <th
                            key={h || 'actions'}
                            className={clsx(
                              'px-5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider',
                              h ? 'text-left' : 'text-right'
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <AnimatePresence>
                        {category.services.map((svc) => (
                          <ServiceRow
                            key={svc.id}
                            svc={svc}
                            onEdit={onEditService}
                            onConfig={onConfigService}
                            onDelete={onDeleteService}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          </Collapsible.Content>
        </div>
      </Collapsible.Root>
    </motion.div>
  );
}

function ServicesSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        <div className="flex gap-3">
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200 rounded-lg" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-card h-16" />
      ))}
    </div>
  );
}

export default function ServicesPage() {
  const { data: servicesRes, isLoading: servicesLoading, isError: servicesError, refetch: refetchServices } = useServices();
  const { data: categoriesRes, isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useCategories();
  const deleteService = useDeleteService();
  const deleteCategory = useDeleteCategory();

  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [sequenceService, setSequenceService] = useState(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);

  const headerActions = useMemo(() => (
    <>
      <Button variant="secondary" onClick={() => setCreateCategoryOpen(true)}>
        <FolderPlus size={16} />
        Add Category
      </Button>
      <Button onClick={() => setCreateOpen(true)}>
        <Plus size={16} />
        Add Service
      </Button>
    </>
  ), []);
  useSetPageHeader('Services', 'Manage your service catalog and chase sequences', headerActions);

  const services = servicesRes ?? [];
  const categories = categoriesRes ?? [];

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

  if (isLoading) return <ServicesSkeleton />;

  if ((servicesError || categoriesError) && services.length === 0 && categories.length === 0) {
    return (
      <ErrorState
        title="Unable to load services"
        onRetry={() => { refetchServices(); refetchCategories(); }}
      />
    );
  }

  return (
    <>
      {/* Content */}

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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {grouped.map((category) => (
            <CategoryGroup
              key={category.id}
              category={category}
              isSystem={category.id === '__uncategorized'}
              onEditCategory={setEditCategory}
              onDeleteCategory={setDeleteCategoryTarget}
              onEditService={setEditService}
              onConfigService={setSequenceService}
              onDeleteService={setDeleteServiceTarget}
              onAddService={() => setCreateOpen(true)}
            />
          ))}
        </motion.div>
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
