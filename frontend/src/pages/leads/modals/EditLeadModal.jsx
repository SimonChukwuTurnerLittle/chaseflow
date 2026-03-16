import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useUpdateLead } from '@/hooks/useLeads';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  rating: z.string().optional(),
  handler: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Please enter a valid email'
    ),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  addressLine: z.string().optional(),
  postcode: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  country: z.string().optional(),
});

const SOURCE_OPTIONS = [
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Event', label: 'Event' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Other', label: 'Other' },
];

const RATING_OPTIONS = [
  { value: 'HOT', label: 'Hot' },
  { value: 'WARM', label: 'Warm' },
  { value: 'COLD', label: 'Cold' },
];

export function EditLeadModal({ open, onClose, lead }) {
  const updateLead = useUpdateLead();
  const contact = lead?.contactDetails ?? {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      source: '',
      rating: '',
      handler: '',
      email: '',
      phone: '',
      mobile: '',
      whatsapp: '',
      addressLine: '',
      postcode: '',
      city: '',
      county: '',
      country: '',
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        firstName: lead.firstName ?? '',
        lastName: lead.lastName ?? '',
        source: lead.source ?? '',
        rating: lead.rating ?? '',
        handler: lead.handler ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        mobile: contact.mobile ?? '',
        whatsapp: contact.whatsapp ?? '',
        addressLine: contact.addressLine ?? '',
        postcode: contact.postcode ?? '',
        city: contact.city ?? '',
        county: contact.county ?? '',
        country: contact.country ?? '',
      });
    }
  }, [lead, reset]);

  function onSubmit(data) {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '')
    );

    updateLead.mutate(
      { id: lead.id, data: payload },
      { onSuccess: () => onClose() }
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Lead"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={updateLead.isPending}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name *"
            id="edit-firstName"
            placeholder="First name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            id="edit-lastName"
            placeholder="Last name"
            {...register('lastName')}
          />
        </div>

        <Select
          label="Source *"
          id="edit-source"
          placeholder="Select source"
          options={SOURCE_OPTIONS}
          error={errors.source?.message}
          {...register('source')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Rating"
            id="edit-rating"
            placeholder="Select rating"
            options={RATING_OPTIONS}
            {...register('rating')}
          />
          <Input
            label="Handler"
            id="edit-handler"
            placeholder="Handler name"
            {...register('handler')}
          />
        </div>

        <hr className="border-slate-200" />

        <p className="text-sm font-medium text-primary">Contact Details</p>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            id="edit-email"
            type="email"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            id="edit-phone"
            placeholder="Phone number"
            {...register('phone')}
          />
          <Input
            label="Mobile"
            id="edit-mobile"
            placeholder="Mobile number"
            {...register('mobile')}
          />
          <Input
            label="WhatsApp"
            id="edit-whatsapp"
            placeholder="WhatsApp number"
            {...register('whatsapp')}
          />
        </div>

        <Input
          label="Address"
          id="edit-addressLine"
          placeholder="Address line"
          {...register('addressLine')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Postcode"
            id="edit-postcode"
            placeholder="Postcode"
            {...register('postcode')}
          />
          <Input
            label="City"
            id="edit-city"
            placeholder="City"
            {...register('city')}
          />
          <Input
            label="County"
            id="edit-county"
            placeholder="County"
            {...register('county')}
          />
          <Input
            label="Country"
            id="edit-country"
            placeholder="Country"
            {...register('country')}
          />
        </div>
      </form>
    </Modal>
  );
}
