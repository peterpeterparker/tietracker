import { get, set } from 'idb-keyval';

import { Client } from "../../models/client";

export async function saveClient(client: Client) {
    let clients: Client[] = await loadClients();

    if (!clients || clients.length <= 0) {
        clients = [];
    }

    clients.push(client);

    set('clients', clients);
}

export async function loadClients(): Promise<Client[]> {
    return get('clients');
}