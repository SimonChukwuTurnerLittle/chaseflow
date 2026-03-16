import client from './client';

export const getDrafts = (params) =>
  client.get('/drafts', { params });

export const getDraft = (id) =>
  client.get(`/drafts/${id}`);

export const updateDraft = (id, data) =>
  client.put(`/drafts/${id}`, data);

export const approveDraft = (id) =>
  client.post(`/drafts/${id}/approve`);

export const rejectDraft = (id) =>
  client.post(`/drafts/${id}/reject`);
