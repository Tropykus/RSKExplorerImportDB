import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

// Dictionary (collection: Processing fuction) 
export let processDocument = {
  'config': config,
  'status': status,
  'verificationResults': verificationResults,
  'contractsVerifications': contractsVerifications,
  'transactionsPending': transactionsPending,
  'tokensAddresses': tokensAddresses,
  'addresses': addresses,
  'balancesLog': balancesLog,
  'blocks': blocks,
  'blocksSummary': blocksSummary,
  'statsCollection': statsCollection,
  'blockTraces': blockTraces,
  'txPool': txPool,
  'balances': balances,
  'transactions': transactions,
  'events': events,
  'internalTransactions': internalTransactions
}

async function config(document) {
  let data = {
    data: document,
    old_id: document._id
  };
  await prisma.config.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function status(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    timestamp: document.timestamp
  };
  await prisma.status.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function verificationResults(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    address: String(document.address),
    match: document.match
  };
  await prisma.verificationresults.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function contractsVerifications(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    address: String(document.address)
  };
  await prisma.contractsverifications.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function transactionsPending(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    hash: String(document.hash),
    from: String(document.from),
    to: String(document.to)
  };
  await prisma.transactionspending.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function tokensAddresses(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    address: String(document.address),
    contract: String(document.contract)
  };
  await prisma.tokensaddresses.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function addresses(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    // createdByTx_timestamp: String(document.createdByTx.timestamp),
    address: String(document.address),
    balance: String(document.balance),
    type: String(document.type),
    name: document.name
  };
  await prisma.addresses.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function balancesLog(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    blockhash: String(document.blockHash)
  };
  await prisma.balanceslog.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function blocks(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    number: document.number,
    hash: String(document.hash),
    size: document.size,
    received: document._received,
    timestamp: document.timestamp,
    miner: String(document.miner)
  };
  await prisma.blocks.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function blocksSummary(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    hash: String(document.hash),
    number: document.number,
    timestamp: document.timestamp
  };
  await prisma.blockssummary.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function statsCollection(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    timestamp: document.timestamp,
    blocknumber: document.blockNumber
  };
  await prisma.statscollection.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function blockTraces(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    hash: String(document.hash)
  };
  await prisma.blocktraces.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function txPool(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    timestamp: document.timestamp
  };
  await prisma.txpool.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function balances(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    address: String(document.address),
    blocknumber: document.blockNumber,
    blockhash: String(document.blockHash),
    timestamp: document.timestamp
  };
  await prisma.balances.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function transactions(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    txid: String(document.txId),
    hash: String(document.hash),
    blocknumber: String(document.blockNumber),
    transactionindex: String(document.transactionIndex),
    timestamp: document.timestamp,
    from: String(document.from),
    to: String(document.to),
    txtype: String(document.txType),
    blockhash: String(document.blockHash)
  };
  await prisma.transactions.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
} 1

async function events(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    eventid: String(document.eventId),
    timestamp: document.timestamp,
    blocknumber: document.blockNumber,
    transactionhash: String(document.transactionHash),
    signature: String(document.signature),
    address: String(document.address),
    event: String(document.event),
    blockhash: String(document.blockHash),
  };
  await prisma.events.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}

async function internalTransactions(document) {
  let data = {
    data: document,
    old_id: String(document._id),
    blockhash: String(document.blockHash),
    blocknumber: document.blockNumber,
    transactionhash: String(document.transactionHash),
    action_from: String(document.action.from),
    action_to: String(document.action.to),
    type: String(document.type),
    internaltxid: String(document.internalTxId)
  };
  await prisma.internaltransactions.upsert({
    where: { old_id: data.old_id },
    update: data,
    create: data,
  });
}
