import client from './client';

export const getTemplates = (serviceId) =>
  client.get(`/services/${serviceId}/templates`);

export const updateTemplate = (serviceId, stepNumber, channel, data) =>
  client.put(`/services/${serviceId}/templates/${stepNumber}/${channel}`, data);
