import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as templatesApi from '../api/templatesApi';

export const useTemplates = (serviceId) => {
  return useQuery({
    queryKey: ['templates', serviceId],
    queryFn: () => templatesApi.getTemplates(serviceId).then(res => res.data),
    enabled: !!serviceId,
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useUnassignedTemplates = (serviceId) => {
  return useQuery({
    queryKey: ['templates', serviceId, 'unassigned'],
    queryFn: () => templatesApi.getUnassignedTemplates(serviceId).then(res => res.data),
    enabled: !!serviceId,
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }) => templatesApi.createTemplate(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, id, data }) => templatesApi.updateTemplateById(serviceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, id }) => templatesApi.duplicateTemplate(serviceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template duplicated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useAssignTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, id, data }) => templatesApi.assignTemplate(serviceId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useUnassignTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, id }) => templatesApi.unassignTemplate(serviceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, id }) => templatesApi.deleteTemplate(serviceId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast.success('Template deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Something went wrong');
    },
  });
};
