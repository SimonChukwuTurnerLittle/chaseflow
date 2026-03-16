import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as sequencesApi from '../api/sequencesApi';
import * as templatesApi from '../api/templatesApi';

export const useSequences = (serviceId) => {
  return useQuery({
    queryKey: ['sequences', serviceId],
    queryFn: () => sequencesApi.getSequences(serviceId).then(res => res.data),
    enabled: !!serviceId,
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useCreateSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }) => sequencesApi.createSequence(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useUpdateSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, id, data }) => sequencesApi.updateSequence(serviceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useDeleteSequence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, id }) => sequencesApi.deleteSequence(serviceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, stepNumber, channel, data }) =>
      templatesApi.updateTemplate(serviceId, stepNumber, channel, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};
