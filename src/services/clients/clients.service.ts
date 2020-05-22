import {get, set} from 'idb-keyval';

import {v4 as uuid} from 'uuid';

import {Client, ClientData} from '../../models/client';

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

  create(data: ClientData): Promise<Client> {
    return new Promise<Client>(async (resolve, reject) => {
      try {
        let clients: Client[] = await get('clients');

        if (!clients || clients.length <= 0) {
          clients = [];
        }

        const now: number = new Date().getTime();

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

        resolve(client);
      } catch (err) {
        reject(err);
      }
    });
  }

  list(): Promise<Client[]> {
    return new Promise<Client[]>(async (resolve, reject) => {
      try {
        const clients: Client[] = await get('clients');

        if (!clients || clients.length <= 0) {
          resolve([]);
          return;
        }

        resolve(clients);
      } catch (err) {
        reject(err);
      }
    });
  }

  find(id: string): Promise<Client | undefined> {
    return new Promise<Client | undefined>(async (resolve) => {
      try {
        const clients: Client[] = await get('clients');

        if (!clients || clients.length <= 0) {
          resolve(undefined);
          return;
        }

        const client: Client | undefined = clients.find((filteredClient: Client) => {
          return filteredClient.id === id;
        });

        resolve(client);
      } catch (err) {
        resolve(undefined);
      }
    });
  }

  update(client: Client | undefined): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (!client || !client.data) {
          reject('Client is not defined.');
          return;
        }

        const clients: Client[] = await get('clients');

        if (!clients || clients.length <= 0) {
          reject('No clients found.');
          return;
        }

        const index: number = clients.findIndex((filteredClient: Client) => {
          return filteredClient.id === client.id;
        });

        if (index < 0) {
          reject('Client not found.');
          return;
        }

        client.data.updated_at = new Date().getTime();

        clients[index] = client;

        await set(`clients`, clients);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
