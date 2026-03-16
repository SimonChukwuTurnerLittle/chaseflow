import client from './client';

export const getCategories = () =>
  client.get('/service-categories');

export const createCategory = (data) =>
  client.post('/service-categories', data);

export const updateCategory = (id, data) =>
  client.put(`/service-categories/${id}`, data);

export const deleteCategory = (id) =>
  client.delete(`/service-categories/${id}`);
