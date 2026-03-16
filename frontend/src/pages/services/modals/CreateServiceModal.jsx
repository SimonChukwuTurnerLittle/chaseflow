import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';
import { Briefcase, Package } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useCategories, useCreateService } from '@/hooks/useServices';

const schema = z
  .object({
    categoryId: z.string().optional(),
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
    sortOrder: z.coerce.number().int().optional().or(z.literal('')),
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
  { value: 'HOT', label: 'Hot' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'COLD', label: 'Cold' },
  { value: 'DORMANT', label: 'Dormant' },
];

export default function CreateServiceModal({ open, onClose }) {
  const { data: categoriesRes } = useCategories();
  const createService = useCreateService();

  const categories = categoriesRes?.data ?? [];
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
      categoryId: '',
      serviceName: '',
      serviceDescription: '',
      serviceMode: 'WORK_TYPE',
      price: '',
      packageIncludes: '',
      defaultTemperature: '',
      recurrenceDays: '',
      sortOrder: '',
    },
  });

  const serviceMode = watch('serviceMode');

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
      sortOrder: values.sortOrder || 0,
      categoryId: values.categoryId || null,
    };

    createService.mutate(payload, {
      onSuccess: () => {
        toast.success(
          'Service created. Configure your chase sequences and templates.'
        );
        reset();
        onClose();
      },
    });
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Service"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={createService.isPending}
          >
            Create Service
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Select
          label="Category"
          id="categoryId"
          placeholder="Select a category"
          options={categoryOptions}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />

        <Input
          label="Service Name"
          id="serviceName"
          placeholder="e.g. Website Design"
          error={errors.serviceName?.message}
          {...register('serviceName')}
        />

        <Textarea
          label="Service Description"
          id="serviceDescription"
          placeholder="Describe this service..."
          error={errors.serviceDescription?.message}
          {...register('serviceDescription')}
        />

        {/* Service Mode - card selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">
            Service Mode *
          </label>
          <Controller
            name="serviceMode"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange('WORK_TYPE')}
                  className={clsx(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    field.value === 'WORK_TYPE'
                      ? 'border-cta bg-cta/5'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <Briefcase
                    size={24}
                    className={
                      field.value === 'WORK_TYPE'
                        ? 'text-cta'
                        : 'text-slate-400'
                    }
                  />
                  <span
                    className={clsx(
                      'text-sm font-medium',
                      field.value === 'WORK_TYPE'
                        ? 'text-cta'
                        : 'text-slate-600'
                    )}
                  >
                    Work Type
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => field.onChange('PACKAGE')}
                  className={clsx(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    field.value === 'PACKAGE'
                      ? 'border-cta bg-cta/5'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <Package
                    size={24}
                    className={
                      field.value === 'PACKAGE'
                        ? 'text-cta'
                        : 'text-slate-400'
                    }
                  />
                  <span
                    className={clsx(
                      'text-sm font-medium',
                      field.value === 'PACKAGE'
                        ? 'text-cta'
                        : 'text-slate-600'
                    )}
                  >
                    Package
                  </span>
                </button>
              </div>
            )}
          />
          {errors.serviceMode && (
            <p className="text-xs text-red-500">
              {errors.serviceMode.message}
            </p>
          )}
        </div>

        {/* Package-only fields */}
        {serviceMode === 'PACKAGE' && (
          <>
            <Input
              label="Price (GBP)"
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price')}
            />
            <Textarea
              label="Package Includes"
              id="packageIncludes"
              placeholder="Describe what's included..."
              {...register('packageIncludes')}
            />
          </>
        )}

        <Select
          label="Default Temperature"
          id="defaultTemperature"
          placeholder="Select temperature"
          options={TEMPERATURE_OPTIONS}
          error={errors.defaultTemperature?.message}
          {...register('defaultTemperature')}
        />

        <Input
          label="Auto re-chase after X days"
          id="recurrenceDays"
          type="number"
          min="1"
          placeholder="e.g. 30"
          error={errors.recurrenceDays?.message}
          {...register('recurrenceDays')}
        />

        <Input
          label="Sort Order"
          id="sortOrder"
          type="number"
          min="0"
          placeholder="0"
          error={errors.sortOrder?.message}
          {...register('sortOrder')}
        />
      </form>
    </Modal>
  );
}
