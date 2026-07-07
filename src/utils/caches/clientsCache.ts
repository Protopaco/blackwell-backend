import { createCache } from '#utils/cache.js';
import { CACHE_TTL_MEDIUM_MS } from '#config/constants.js';
import Client from '#models/Client.js';

// Shared cache instance for readClients, keyed by clientConfigFileId.
const clientsCache = createCache<Client[]>(CACHE_TTL_MEDIUM_MS);

export default clientsCache;
