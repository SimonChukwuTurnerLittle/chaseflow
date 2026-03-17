import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import * as draftsApi from '../api/draftsApi';

export const useDrafts = (params) => {
  return useQuery({
    queryKey: ['drafts', params],
    queryFn: () => draftsApi.getDrafts(params).then(res => res.data),
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useDraft = (id) => {
  return useQuery({
    queryKey: ['drafts', id],
    queryFn: () => draftsApi.getDraft(id).then(res => res.data),
    enabled: !!id,
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useUpdateDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => draftsApi.updateDraft(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useApproveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => draftsApi.approveDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft approved');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useRejectDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => draftsApi.rejectDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      toast.success('Draft rejected');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
