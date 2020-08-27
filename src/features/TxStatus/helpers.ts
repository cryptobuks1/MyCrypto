import { ProviderHandler, getTxsFromAccount } from '@services';
import {
  makeTxConfigFromTxResponse,
  makeTxConfigFromTxReceipt,
  makeUnknownTxReceipt,
  makePendingTxReceipt
} from '@utils';
import {
  ITxType,
  ITxHash,
  NetworkId,
  StoreAccount,
  Asset,
  Network,
  ITxConfig,
  TxQueryTypes
} from '@types';

export const fetchTxStatus = async ({
  txHash,
  networkId,
  networks,
  accounts,
  assets
}: {
  txHash: string;
  networkId: NetworkId;
  networks: Network[];
  accounts: StoreAccount[];
  assets: Asset[];
}) => {
  const network = networks.find((n) => n.id === networkId)!;
  const txCache = getTxsFromAccount(accounts);
  const cachedTx = txCache.find(
    (t) => t.hash === (txHash as ITxHash) && t.asset.networkId === networkId
  );
  if (cachedTx) {
    return {
      config: makeTxConfigFromTxReceipt(cachedTx, assets, networks, accounts),
      receipt: cachedTx
    };
  }
  const provider = new ProviderHandler(network);
  const fetchedTx = await provider.getTransactionByHash(txHash as ITxHash, true);
  if (!fetchedTx) {
    return;
  }

  const fetchedTxConfig = makeTxConfigFromTxResponse(fetchedTx, assets, network, accounts);
  return {
    config: fetchedTxConfig,
    receipt:
      fetchedTx && fetchedTx.confirmations
        ? makeUnknownTxReceipt(txHash as ITxHash)(ITxType.UNKNOWN, fetchedTxConfig)
        : makePendingTxReceipt(txHash as ITxHash)(ITxType.UNKNOWN, fetchedTxConfig)
  };
};

export const createQueryParams = (txConfig: ITxConfig, type: TxQueryTypes) => {
  const { to, from, gasLimit, nonce, chainId, value, data } = txConfig.rawTransaction;
  const senderAddress = txConfig.senderAccount?.address;
  return {
    from: from || senderAddress,
    type,
    to,
    gasLimit,
    nonce,
    chainId,
    value,
    data
  };
};
