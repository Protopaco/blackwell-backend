import readClients from '#db/client/readClients.js';
import replaceClients from '#db/client/replaceClients.js';
import clientsCache from '#utils/caches/clientsCache.js';

type RemoveDevTestClientRowsResult = {
  removedCount: number;
};

const removeDevTestClientRows = async (
  shouldRemoveClientCode: (clientCode: string) => boolean,
): Promise<RemoveDevTestClientRowsResult> => {
  const clients = await readClients();
  const retainedClients = clients.filter((client) => !shouldRemoveClientCode(client.clientCode));
  const removedCount = clients.length - retainedClients.length;

  if (removedCount > 0) {
    await replaceClients(retainedClients);
  }

  const clientConfigFileId = process.env.CLIENT_CONFIG_FILE_ID;
  if (clientConfigFileId) clientsCache.delete(clientConfigFileId);

  return { removedCount };
};

export default removeDevTestClientRows;
export type { RemoveDevTestClientRowsResult };
