import {get, set} from 'idb-keyval';
import {v4 as uuid} from 'uuid';
import type {Client, ClientData} from '../types/client';

export class ClientsService {
  private static instance: ClientsService;

  private constructor() {
    // Private constructor, singleton
  }

  static getInstance() {
    if (!ClientsService.instance) {
      ClientsService.instance = new ClientsService();
    }
    return ClientsService.instance;
  }

  async create(data: ClientData): Promise<Client> {
    let clients = await get<Client[]>('clients');

    if (!clients || clients.length <= 0) {
      clients = [];
    }

    const now = new Date().getTime();

    data.created_at = now;
    data.updated_at = now;

    if (!data.color) {
      data.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    const client: Client = {
      id: uuid(),
      data: data,
    };

    clients.push(client);

    await set('clients', clients);

    return client;
  }

  async list(): Promise<Client[]> {
    const clients = await get<Client[]>('clients');

    if (!clients || clients.length <= 0) {
      return [];
    }

    return clients;
  }

  async find(id: string): Promise<Client | undefined> {
    try {
      const clients = await get<Client[]>('clients');

      if (!clients || clients.length <= 0) {
        return undefined;
      }

      return clients.find((filteredClient: Client) => {
        return filteredClient.id === id;
      });
    } catch (_err: unknown) {
      return undefined;
    }
  }

  async update(client: Client | undefined): Promise<void> {
    if (!client || !client.data) {
      throw new Error('Client is not defined.');
    }

    const clients = await get<Client[]>('clients');

    if (!clients || clients.length <= 0) {
      throw new Error('No clients found.');
    }

    const index = clients.findIndex((filteredClient: Client) => {
      return filteredClient.id === client.id;
    });

    if (index < 0) {
      throw new Error('Client not found.');
    }

    client.data.updated_at = new Date().getTime();

    clients[index] = client;

    await set(`clients`, clients);
  }
}
