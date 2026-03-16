import client from './client';

export const getTemplates = (sequenceId) =>
  client.get(`/sequences/${sequenceId}/templates`);

export const updateTemplate = (sequenceId, channel, data) =>
  client.put(`/sequences/${sequenceId}/templates/${channel}`, data);
