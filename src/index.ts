import { infinityExchangeMainnetDesc, wyvernExchangeMainnetDesc, seaportExchangeMainnetDesc } from './config';
import { ContractFactory } from './models/contracts/contract.factory';
import { EventHandler } from './models/event-handlers/handler';
import { CollectionProvider } from './models/collection-provider';
import { trimLowerCase } from '@infinityxyz/lib/utils';
import { TransactionReceiptProvider } from './models/transaction-receipt-provider';
import { ChainId } from '@infinityxyz/lib/types/core';
import { ProtocolFeeProvider } from './models/protocol-fee-provider';
import { Providers } from 'models/Providers';
import { Firebase } from 'database/Firebase';

function main() {
  const providers = new Providers();
  const firebase = new Firebase();
  const contractFactory = new ContractFactory(providers, firebase);
  const attemptToIndexMissingCollections = false; // set based on env
  const collectionProvider = new CollectionProvider(50, firebase, attemptToIndexMissingCollections);
  const handler = new EventHandler(firebase, providers, collectionProvider);
  const protocolFeeProvider = new ProtocolFeeProvider(firebase, providers);
  const mainnetTxReceiptProvider = new TransactionReceiptProvider(500, providers.getProviderByChainId(ChainId.Mainnet));
  const infinityExchangeMainnet = contractFactory.create(
    infinityExchangeMainnetDesc,
    handler,
    mainnetTxReceiptProvider,
    protocolFeeProvider
  );
  const wyvernExchangeMainnet = contractFactory.create(
    wyvernExchangeMainnetDesc,
    handler,
    mainnetTxReceiptProvider,
    protocolFeeProvider
  );
  const seaportExchangeMainnet = contractFactory.create(
    seaportExchangeMainnetDesc,
    handler,
    mainnetTxReceiptProvider,
    protocolFeeProvider
  );

  infinityExchangeMainnet
    .sync()
    .then(() => {
      console.log('Infinity Exchange Mainnet backfilled');
    })
    .catch((err) => {
      console.error(err);
    });
  //   wyvernExchangeMainnet
  //     .sync()
  //     .then(() => {
  //       console.log('Wyvern Exchange Mainnet backfilled');
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // seaportExchangeMainnet
  //   .sync()
  //   .then(() => {
  //     console.log('Seaport Exchange Mainnet backfilled');
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
}

async function getSaleByTx(firebase: Firebase) {
  const hash = trimLowerCase('0x0226b51c5c319bd31b5645293942002e5818c5585bea1abfef3c7086eaac9335');

  const snaps = await firebase.db.collection('sales').where('txHash', '==', hash).get();
  snaps.docs.forEach((doc) => {
    const id = doc.id;
    const sale = doc.data();

    console.log(`Found sale with hash: ${hash} Id: ${id}`);
    console.log(JSON.stringify(sale, null, 2));
  });

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  console.log(`Found ${snaps.docs.length} sales with hash: ${hash}`);
}

void main();
