import client from './client';

export const getSequences = (serviceId) =>
  client.get(`/services/${serviceId}/sequences`);

export const createSequence = (serviceId, data) =>
  client.post(`/services/${serviceId}/sequences`, data);

export const updateSequence = (serviceId, id, data) =>
  client.put(`/services/${serviceId}/sequences/${id}`, data);

export const deleteSequence = (serviceId, id) =>
  client.delete(`/services/${serviceId}/sequences/${id}`);
