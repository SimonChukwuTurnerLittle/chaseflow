import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCreateLead } from '@/hooks/useLeads';

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
  address: z.string().optional(),
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

export function CreateLeadModal({ open, onClose }) {
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
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
      address: '',
      postcode: '',
      city: '',
      county: '',
      country: '',
    },
  });

  function onSubmit(data) {
    // Strip empty optional strings
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '')
    );

    createLead.mutate(payload, {
      onSuccess: () => onClose(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Lead"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={createLead.isPending}
          >
            Create Lead
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Lead info section */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name *"
            id="firstName"
            placeholder="First name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            id="lastName"
            placeholder="Last name"
            {...register('lastName')}
          />
        </div>

        <Select
          label="Source *"
          id="source"
          placeholder="Select source"
          options={SOURCE_OPTIONS}
          error={errors.source?.message}
          {...register('source')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Rating"
            id="rating"
            placeholder="Select rating"
            options={RATING_OPTIONS}
            {...register('rating')}
          />
          <Input
            label="Handler"
            id="handler"
            placeholder="Handler name"
            {...register('handler')}
          />
        </div>

        <hr className="border-slate-200" />

        {/* Contact details section */}
        <p className="text-sm font-medium text-primary">Contact Details</p>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            id="phone"
            placeholder="Phone number"
            {...register('phone')}
          />
          <Input
            label="Mobile"
            id="mobile"
            placeholder="Mobile number"
            {...register('mobile')}
          />
          <Input
            label="WhatsApp"
            id="whatsapp"
            placeholder="WhatsApp number"
            {...register('whatsapp')}
          />
        </div>

        <Input
          label="Address"
          id="address"
          placeholder="Address line"
          className="col-span-2"
          {...register('address')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Postcode"
            id="postcode"
            placeholder="Postcode"
            {...register('postcode')}
          />
          <Input
            label="City"
            id="city"
            placeholder="City"
            {...register('city')}
          />
          <Input
            label="County"
            id="county"
            placeholder="County"
            {...register('county')}
          />
          <Input
            label="Country"
            id="country"
            placeholder="Country"
            {...register('country')}
          />
        </div>
      </form>
    </Modal>
  );
}
