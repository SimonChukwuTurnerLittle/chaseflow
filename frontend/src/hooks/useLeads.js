import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import * as leadsApi from '../api/leadsApi';

export const useLeads = (params) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsApi.getLeads(params).then(res => res.data),
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useLead = (id) => {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.getLead(id).then(res => res.data),
    enabled: !!id,
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => leadsApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => leadsApi.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => leadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useLeadOpportunities = (leadId) => {
  return useQuery({
    queryKey: ['leads', leadId, 'opportunities'],
    queryFn: () => leadsApi.getLeadOpportunities(leadId).then(res => res.data),
    enabled: !!leadId,
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useLeadNotes = (leadId) => {
  return useQuery({
    queryKey: ['leads', leadId, 'notes'],
    queryFn: () => leadsApi.getLeadNotes(leadId).then(res => res.data),
    enabled: !!leadId,
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, data }) => leadsApi.addNote(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['leads', leadId, 'notes'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useLeadFiles = (leadId) => {
  return useQuery({
    queryKey: ['leads', leadId, 'files'],
    queryFn: () => leadsApi.getLeadFiles(leadId).then(res => res.data),
    enabled: !!leadId,
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, formData }) => leadsApi.uploadFile(leadId, formData),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['leads', leadId, 'files'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, fileId }) => leadsApi.deleteFile(leadId, fileId),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['leads', leadId, 'files'] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};
