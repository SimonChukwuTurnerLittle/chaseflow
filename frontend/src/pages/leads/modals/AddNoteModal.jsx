import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useAddNote } from '@/hooks/useLeads';

const schema = z.object({
  description: z.string().min(1, 'Note is required'),
});

export function AddNoteModal({ open, onClose, leadId }) {
  const addNote = useAddNote();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { description: '' },
  });

  function onSubmit(data) {
    addNote.mutate(
      { leadId, data: { description: data.description } },
      { onSuccess: () => onClose() }
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Note"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            loading={addNote.isPending}
          >
            Add Note
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Textarea
          label="Note"
          id="description"
          placeholder="Write your note here..."
          error={errors.description?.message}
          {...register('description')}
        />
      </form>
    </Modal>
  );
}
