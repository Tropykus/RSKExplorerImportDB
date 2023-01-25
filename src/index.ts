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
    let collections = [{ name: 'contractsVerifications' }, { name: 'config' }, { name: 'status' }, { name: 'internalTransactions' }, { name: 'events' }, { name: 'transactions' }, { name: 'balances' }, { name: 'txPool' }, { name: 'blockTraces' }, { name: 'statsCollection' }, { name: 'blocksSummary' }, { name: 'blocks' }, { name: 'balancesLog' }, { name: 'addresses' }, { name: 'tokensAddresses' }];
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
