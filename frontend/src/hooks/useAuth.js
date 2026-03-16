import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authApi from '../api/authApi';
import useAuthStore from '../store/authStore';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (res) => {
      const { token, ...user } = res.data;
      setAuth(user, token);
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useMe = () => {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.getMe().then(res => res.data),
    enabled: !!token,
    select: (data) => {
      setUser(data);
      return data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    navigate('/login');
  };
};
