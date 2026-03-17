import client from './client';

export const getTemplates = (serviceId) =>
  client.get(`/services/${serviceId}/templates`);

export const getUnassignedTemplates = (serviceId) =>
  client.get(`/services/${serviceId}/templates/unassigned`);

export const createTemplate = (serviceId, data) =>
  client.post(`/services/${serviceId}/templates`, data);

export const updateTemplateById = (serviceId, id, data) =>
  client.put(`/services/${serviceId}/templates/${id}`, data);

export const duplicateTemplate = (serviceId, id) =>
  client.post(`/services/${serviceId}/templates/${id}/duplicate`);

export const assignTemplate = (serviceId, id, data) =>
  client.put(`/services/${serviceId}/templates/${id}/assign`, data);

export const unassignTemplate = (serviceId, id) =>
  client.put(`/services/${serviceId}/templates/${id}/unassign`);

export const deleteTemplate = (serviceId, id) =>
  client.delete(`/services/${serviceId}/templates/${id}`);
