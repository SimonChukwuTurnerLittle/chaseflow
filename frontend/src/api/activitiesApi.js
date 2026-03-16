import client from './client';

export const getActivities = (opportunityId) =>
  client.get(`/opportunities/${opportunityId}/activities`);

export const getLeadActivities = (leadId) =>
  client.get(`/leads/${leadId}/activities`);
