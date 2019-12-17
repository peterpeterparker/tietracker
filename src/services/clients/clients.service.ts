import { get, set } from 'idb-keyval';

import uuid from 'uuid/v4';

import { Client, ClientData } from '../../models/client';

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
                    data: data
                }

                clients.push(client);
            
                set('clients', clients);

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
}