import { connect, listAccounts } from "@canton-network/dapp-sdk";

export async function connectCanton(): Promise<string> {
  const result = await connect();
  if (!result.isConnected) throw new Error(result.reason || "The wallet was rejected.");
  const accounts = await listAccounts();
  const partyId = accounts.find((account) => account.partyId)?.partyId;
  if (!partyId) throw new Error("The wallet did not return a party.");
  return partyId;
}
