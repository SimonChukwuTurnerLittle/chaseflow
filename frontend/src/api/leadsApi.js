import client from './client';

export const getLeads = (params) =>
  client.get('/leads', { params });

export const getLead = (id) =>
  client.get(`/leads/${id}`);

export const createLead = (data) =>
  client.post('/leads', data);

export const updateLead = (id, data) =>
  client.put(`/leads/${id}`, data);

export const deleteLead = (id) =>
  client.delete(`/leads/${id}`);

export const getLeadNotes = (leadId) =>
  client.get(`/leads/${leadId}/notes`);

export const addNote = (leadId, data) =>
  client.post(`/leads/${leadId}/notes`, data);

export const getLeadFiles = (leadId) =>
  client.get(`/leads/${leadId}/files`);

export const uploadFile = (leadId, formData) =>
  client.post(`/leads/${leadId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteFile = (leadId, fileId) =>
  client.delete(`/leads/${leadId}/files/${fileId}`);

export const downloadFile = (leadId, fileId) =>
  client.get(`/leads/${leadId}/files/${fileId}/download`, {
    responseType: 'blob',
  });
