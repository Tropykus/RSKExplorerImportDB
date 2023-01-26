import { MongoClient } from 'mongodb'
import { createMigration, processCollection } from './processCollection'
import * as dotenv from 'dotenv'

dotenv.config();

async function startMigration() {
  try {
    // Connecting to MongoDB
    const url = process.env.OLD_DATABASE_URL;
    const dbName = process.env.OLD_DATABASE_NAME;
    const client = new MongoClient(url);
    const db = client.db(dbName);
    // Fetch collection list
    let collections = [{ name: 'config' }, { name: 'status' }, { name: 'verificationResults' }, { name: 'contractsVerifications' }, { name: 'transactionsPending' }, { name: 'tokensAddresses' }, { name: 'addresses' }, { name: 'balancesLog' }, { name: 'blocksSummary' }, { name: 'blocks' }, { name: 'balances' }, { name: 'txPool' }, { name: 'statsCollection' }, { name: 'blockTraces' }, { name: 'transactions' }, { name: 'events' }, { name: 'internalTransactions' }];
    // let collections = await db.listCollections().toArray();
    await createMigration();
    for (const collection of collections) {
      await processCollection(db, collection.name)
    }
    // Replacing this line
    // await collections.forEach(async (collection) => { await processCollection(db, collection.name) });
  } catch (err) {
    console.error(err);
  }
}

startMigration();
