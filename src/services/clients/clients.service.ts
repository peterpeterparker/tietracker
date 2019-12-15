import { get, set } from 'idb-keyval';

import { Client } from "../../models/client";

export async function saveClient(client: Client) {
    let clients: Client[] = await get('clients');

    if (!clients || clients.length <= 0) {
        clients = [];
    }

    set('clients', clients);
}