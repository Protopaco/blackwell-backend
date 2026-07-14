import request from 'supertest';
import app from '#app.js';
import Client from '#models/Client.js';

const getClientById = async (clientId: string): Promise<Client> => {
  const response = await request(app).get('/api/v1/client');
  if (response.status !== 200) {
    throw new Error(`getClientById failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const client = response.body.find((candidate: Client) => candidate.clientId === clientId);
  if (!client) throw new Error(`Client not found in list: ${clientId}`);

  return client;
};

export default getClientById;
