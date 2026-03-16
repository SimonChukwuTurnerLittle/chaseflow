import client from './client';

export const getServices = () =>
  client.get('/services');

export const getService = (id) =>
  client.get(`/services/${id}`);

export const createService = (data) =>
  client.post('/services', data);

export const updateService = (id, data) =>
  client.put(`/services/${id}`, data);

export const deleteService = (id) =>
  client.delete(`/services/${id}`);
