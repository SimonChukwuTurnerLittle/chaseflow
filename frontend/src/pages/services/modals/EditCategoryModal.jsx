import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useUpdateCategory } from '@/hooks/useServices';

const schema = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  colourHex: z.string().optional(),
  iconKey: z.string().optional(),
});

const PRESET_COLORS = [
  '#0369A1', '#0891B2', '#0D9488', '#16A34A',
  '#CA8A04', '#DC2626', '#9333EA', '#475569',
];

export default function EditCategoryModal({ open, onClose, category }) {
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryName: '',
      colourHex: PRESET_COLORS[0],
      iconKey: '',
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        categoryName: category.name || '',
        colourHex: category.colourHex || PRESET_COLORS[0],
        iconKey: category.iconKey || '',
      });
    }
  }, [category, reset]);

  const selectedColor = watch('colourHex');

  function onSubmit(values) {
    updateCategory.mutate(
      {
        id: category.id,
        data: {
          categoryName: values.categoryName,
          colourHex: values.colourHex || null,
          iconKey: values.iconKey || null,
          sortOrder: category.sortOrder ?? 0,
        },
      },
      {
        onSuccess: () => {
          toast.success('Category updated');
          onClose();
        },
      }
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Category"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={updateCategory.isPending}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Category Name"
          id="edit-categoryName"
          placeholder="e.g. Digital Marketing"
          error={errors.categoryName?.message}
          {...register('categoryName')}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-primary">Colour</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('colourHex', color)}
                className="w-8 h-8 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: color,
                  boxShadow:
                    selectedColor === color
                      ? `0 0 0 3px white, 0 0 0 5px ${color}`
                      : undefined,
                  transform: selectedColor === color ? 'scale(1.15)' : undefined,
                }}
                aria-label={color}
              />
            ))}
            <input
              type="color"
              value={selectedColor || PRESET_COLORS[0]}
              onChange={(e) => setValue('colourHex', e.target.value)}
              className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer p-0.5 bg-white"
              title="Custom colour"
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: selectedColor || '#94a3b8' }}
            />
            <span className="text-xs text-slate-500 font-mono">{selectedColor}</span>
          </div>
        </div>

        <Input
          label="Icon Key (optional)"
          id="edit-iconKey"
          placeholder="e.g. briefcase"
          error={errors.iconKey?.message}
          {...register('iconKey')}
        />
      </form>
    </Modal>
  );
}
