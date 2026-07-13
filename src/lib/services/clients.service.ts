import {v4 as uuid} from 'uuid';
import type {Client, ClientData} from '../types/client';
import {isEmptyString, isNullish} from '../utils/utils.nullish';
import {Service} from './_service';

export class ClientsService extends Service<Client[]> {
  static #instance: ClientsService;

  private constructor() {
    super({key: 'clients'});
  }

  static getInstance() {
    if (isNullish(ClientsService.#instance)) {
      ClientsService.#instance = new ClientsService();
    }

    return ClientsService.#instance;
  }

  async create(data: ClientData): Promise<Client> {
    let clients = await this.get();

    if (isNullish(clients) || clients.length <= 0) {
      clients = [];
    }

    const now = new Date().getTime();

    data.created_at = now;
    data.updated_at = now;

    if (isEmptyString(data.color)) {
      data.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    const client: Client = {
      id: uuid(),
      data: data,
    };

    clients.push(client);

    await this.set(clients);

    return client;
  }

  async list(): Promise<Client[]> {
    const clients = await this.get();
    return clients ?? [];
  }

  async find(id: string): Promise<Client | undefined> {
    try {
      const clients = await this.get();

      return clients?.find((filteredClient) => filteredClient.id === id);
    } catch (_err: unknown) {
      return undefined;
    }
  }

  async update(client: Option<Client>): Promise<void> {
    if (isNullish(client?.data)) {
      throw new Error('Client is not defined.');
    }

    const clients = await this.get();

    if (isNullish(clients) || clients.length <= 0) {
      throw new Error('No clients found.');
    }

    const index = clients.findIndex((filteredClient) => filteredClient.id === client.id);

    if (index < 0) {
      throw new Error('Client not found.');
    }

    client.data.updated_at = new Date().getTime();

    clients[index] = client;

    await this.set(clients);
  }
}
