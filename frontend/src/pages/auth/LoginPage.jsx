import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data) => {
    login(data, {
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Login failed');
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Zap size={28} className="text-primary" />
        <span className="text-2xl font-bold text-primary">Chaseflow</span>
      </div>

      <h1 className="text-xl font-semibold text-center mb-6">Welcome back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" fullWidth variant="primary" loading={isPending}>
          Sign in
        </Button>
      </form>

      <p className="text-sm text-cta text-center mt-4">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="hover:underline font-medium">
          Register
        </Link>
      </p>
    </>
  );
}
