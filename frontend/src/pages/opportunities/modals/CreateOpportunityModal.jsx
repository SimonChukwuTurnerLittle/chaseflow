import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

import { useCreateOpportunity } from '@/hooks/useOpportunities';
import { useServices } from '@/hooks/useServices';

const schema = z.object({
  lead: z.string().min(1, 'Lead is required'),
  service: z.string().optional(),
  temperature: z.string().min(1, 'Temperature is required'),
  opportunityType: z.string().optional(),
  stage: z.string().optional(),
  notes: z.string().optional(),
  nextChaseDate: z.string().optional(),
});

const TEMPERATURE_OPTIONS = [
  { value: 'HOT', label: 'Hot' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'COLD', label: 'Cold' },
  { value: 'DORMANT', label: 'Dormant' },
];

export function CreateOpportunityModal({ open, onClose, prefilledLeadId }) {
  const createMutation = useCreateOpportunity();
  const { data: servicesData } = useServices();

  const services = servicesData ?? [];
  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: s.serviceName,
  }));

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      lead: prefilledLeadId || '',
      service: '',
      temperature: 'MEDIUM',
      opportunityType: '',
      stage: '',
      notes: '',
      nextChaseDate: '',
    },
  });

  const selectedServiceId = watch('service');

  // Set default temperature from selected service
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const selectedService = services.find(
        (s) => s.id === selectedServiceId
      );
      if (selectedService?.defaultTemperature) {
        setValue('temperature', selectedService.defaultTemperature);
      }
    }
  }, [selectedServiceId, services, setValue]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      reset({
        lead: prefilledLeadId || '',
        service: '',
        temperature: 'MEDIUM',
        opportunityType: '',
        stage: '',
        notes: '',
        nextChaseDate: '',
      });
    }
  }, [open, prefilledLeadId, reset]);

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync({
        leadId: values.lead,
        serviceId: values.service || undefined,
        temperature: values.temperature,
        opportunityType: values.opportunityType || undefined,
        stage: values.stage || undefined,
        notes: values.notes || undefined,
        nextChaseDate: values.nextChaseDate || undefined,
      });
      toast.success('Opportunity created successfully');
      onClose();
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Opportunity"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={createMutation.isPending}
          >
            Create Opportunity
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Lead */}
        {prefilledLeadId ? (
          <Input
            label="Lead"
            value={prefilledLeadId}
            disabled
            id="lead-prefilled"
          />
        ) : (
          <Input
            label="Lead ID"
            placeholder="Enter the lead ID"
            id="lead"
            error={errors.lead?.message}
            {...register('lead')}
          />
        )}

        {/* Service */}
        <Select
          label="Service"
          id="service"
          placeholder="Select a service"
          options={serviceOptions}
          error={errors.service?.message}
          {...register('service')}
        />

        {/* Temperature */}
        <Select
          label="Temperature"
          id="temperature"
          options={TEMPERATURE_OPTIONS}
          error={errors.temperature?.message}
          {...register('temperature')}
        />

        {/* Opportunity Type */}
        <Input
          label="Opportunity Type"
          placeholder="e.g. New Business, Upsell"
          id="opportunityType"
          error={errors.opportunityType?.message}
          {...register('opportunityType')}
        />

        {/* Stage */}
        <Input
          label="Stage"
          placeholder="e.g. Prospecting, Negotiation"
          id="stage"
          error={errors.stage?.message}
          {...register('stage')}
        />

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Any additional notes..."
          id="notes"
          error={errors.notes?.message}
          {...register('notes')}
        />

        {/* Next Chase Date */}
        <Input
          label="Next Chase Date"
          type="date"
          id="nextChaseDate"
          error={errors.nextChaseDate?.message}
          {...register('nextChaseDate')}
        />
      </form>
    </Modal>
  );
}
