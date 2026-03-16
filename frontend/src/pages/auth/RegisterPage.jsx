import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegister } from '@/hooks/useAuth';

const registerSchema = z
  .object({
    businessName: z.string().min(1, 'Business name is required'),
    name: z.string().min(1, 'Your name is required'),
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...payload } = data;
    registerUser(payload);
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Zap size={28} className="text-primary" />
        <span className="text-2xl font-bold text-primary">Chaseflow</span>
      </div>

      <h1 className="text-xl font-semibold text-center mb-6">
        Create your account
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          id="businessName"
          label="Business name"
          placeholder="Acme Inc."
          error={errors.businessName?.message}
          {...register('businessName')}
        />

        <Input
          id="name"
          label="Your name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth variant="primary" loading={isPending}>
          Create account
        </Button>
      </form>

      <p className="text-sm text-cta text-center mt-4">
        Already have an account?{' '}
        <Link to="/login" className="hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
