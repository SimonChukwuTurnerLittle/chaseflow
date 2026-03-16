import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as opportunitiesApi from '../api/opportunitiesApi';

export const useOpportunities = (params) => {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => opportunitiesApi.getOpportunities(params).then(res => res.data),
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useOpportunity = (id) => {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: () => opportunitiesApi.getOpportunity(id).then(res => res.data),
    enabled: !!id,
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => opportunitiesApi.createOpportunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => opportunitiesApi.updateOpportunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => opportunitiesApi.deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};
