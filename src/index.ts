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
    // Getting command line parameter
    const targetCollection = process.argv[2];
    let collections;
    // Fetch collection list
    if (targetCollection == undefined)
      collections = await db.listCollections().toArray();
    else
      collections = [{ name: targetCollection }];
    collections = [{ name: 'tokensAddresses' }, { name: 'balances' }, { name: 'blocks' }];
    console.log('Collections to process:', collections.map((collection) => { return collection.name }));
    await createMigration();
    // Migrate multiple collections in parallel
    // await Promise.all(collections.map(async (collection) => {
    //   await processCollection(db, collection.name);
    // }));
    // Migrate collections in secuence
    for (const collection of collections) {
      await processCollection(db, collection.name)
    }
  } catch (err) {
    console.error(err);
  }
}

startMigration();
