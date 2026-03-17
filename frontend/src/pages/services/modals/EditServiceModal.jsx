import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';
import { Briefcase, Package, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useCategories, useUpdateService } from '@/hooks/useServices';

const schema = z
  .object({
    serviceCategoryId: z.string().optional(),
    serviceName: z.string().min(1, 'Service name is required'),
    serviceDescription: z.string().optional(),
    serviceMode: z.enum(['WORK_TYPE', 'PACKAGE'], {
      required_error: 'Service mode is required',
    }),
    price: z.coerce.number().optional(),
    packageIncludes: z.string().optional(),
    defaultTemperature: z.enum(['HOT', 'MEDIUM', 'COLD', 'DORMANT'], {
      required_error: 'Temperature is required',
    }),
    recurrenceDays: z.coerce.number().int().positive().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.serviceMode === 'PACKAGE' && (!data.price || data.price <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Price is required for packages',
      });
    }
  });

const TEMPERATURE_OPTIONS = [
  { value: 'HOT', label: 'Hot — chase aggressively (short delays)' },
  { value: 'MEDIUM', label: 'Medium — balanced follow-up pace' },
  { value: 'COLD', label: 'Cold — longer gaps between steps' },
  { value: 'DORMANT', label: 'Dormant — minimal, low-frequency chasing' },
];

const TEMPERATURE_HINTS = {
  HOT: 'Steps fire on days 0, 2, 5',
  MEDIUM: 'Steps fire on days 1, 7, 21',
  COLD: 'Steps fire on days 3, 14, 30',
  DORMANT: 'Steps fire on days 0, 14, 28',
};

export default function EditServiceModal({ open, onClose, service }) {
  const { data: categoriesRes } = useCategories();
  const updateService = useUpdateService();

  const categories = categoriesRes ?? [];
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.categoryName,
  }));

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceCategoryId: '',
      serviceName: '',
      serviceDescription: '',
      serviceMode: 'WORK_TYPE',
      price: '',
      packageIncludes: '',
      defaultTemperature: '',
      recurrenceDays: '',
    },
  });

  useEffect(() => {
    if (service) {
      reset({
        serviceCategoryId: service.serviceCategoryId ?? '',
        serviceName: service.serviceName || '',
        serviceDescription: service.serviceDescription || '',
        serviceMode: service.serviceMode || 'WORK_TYPE',
        price: service.price ?? '',
        packageIncludes: service.packageIncludes || '',
        defaultTemperature: service.defaultTemperature || '',
        recurrenceDays: service.recurrenceDays ?? '',
      });
    }
  }, [service, reset]);

  const serviceMode = watch('serviceMode');
  const defaultTemperature = watch('defaultTemperature');

  function onSubmit(values) {
    const payload = {
      serviceName: values.serviceName,
      serviceDescription: values.serviceDescription || null,
      serviceMode: values.serviceMode,
      defaultTemperature: values.defaultTemperature,
      price: values.serviceMode === 'PACKAGE' ? values.price : null,
      packageIncludes:
        values.serviceMode === 'PACKAGE' ? values.packageIncludes || null : null,
      recurrenceDays: values.recurrenceDays || null,
      serviceCategoryId: values.serviceCategoryId || null,
    };

    updateService.mutate(
      { id: service.id, data: payload },
      {
        onSuccess: () => {
          toast.success('Service updated');
          onClose();
        },
      }
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Service"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={updateService.isPending}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            id="edit-serviceCategoryId"
            placeholder="No category"
            options={categoryOptions}
            error={errors.serviceCategoryId?.message}
            {...register('serviceCategoryId')}
          />
          <Input
            label="Service Name *"
            id="edit-serviceName"
            placeholder="e.g. Website Design"
            error={errors.serviceName?.message}
            {...register('serviceName')}
          />
        </div>

        <Textarea
          label="Description"
          id="edit-serviceDescription"
          placeholder="Describe this service..."
          error={errors.serviceDescription?.message}
          {...register('serviceDescription')}
        />

        {/* Service Mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Service Mode *</label>
          <Controller
            name="serviceMode"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: 'WORK_TYPE',
                    icon: Briefcase,
                    label: 'Work Type',
                    hint: 'Charged by time or deliverable',
                  },
                  {
                    value: 'PACKAGE',
                    icon: Package,
                    label: 'Package',
                    hint: 'Fixed-price bundle',
                  },
                ].map(({ value, icon: Icon, label, hint }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={clsx(
                      'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer',
                      field.value === value
                        ? 'border-cta bg-cta/5'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <Icon
                      size={20}
                      className={clsx(
                        'mt-0.5 shrink-0',
                        field.value === value ? 'text-cta' : 'text-slate-400'
                      )}
                    />
                    <div>
                      <p
                        className={clsx(
                          'text-sm font-medium',
                          field.value === value ? 'text-cta' : 'text-slate-700'
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.serviceMode && (
            <p className="text-xs text-red-500">{errors.serviceMode.message}</p>
          )}
        </div>

        {serviceMode === 'PACKAGE' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (GBP) *"
              id="edit-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price')}
            />
            <Textarea
              label="Package Includes"
              id="edit-packageIncludes"
              placeholder="What's included..."
              {...register('packageIncludes')}
            />
          </div>
        )}

        <div>
          <Select
            label="Default Chase Temperature *"
            id="edit-defaultTemperature"
            placeholder="Select temperature"
            options={TEMPERATURE_OPTIONS}
            error={errors.defaultTemperature?.message}
            {...register('defaultTemperature')}
          />
          {defaultTemperature && TEMPERATURE_HINTS[defaultTemperature] && (
            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
              <Info size={12} />
              {TEMPERATURE_HINTS[defaultTemperature]}
            </p>
          )}
        </div>

        <Input
          label="Auto re-chase every X days (optional)"
          id="edit-recurrenceDays"
          type="number"
          min="1"
          placeholder="e.g. 30 — leave blank to disable"
          error={errors.recurrenceDays?.message}
          {...register('recurrenceDays')}
        />
      </form>
    </Modal>
  );
}
