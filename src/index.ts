import { MongoClient } from 'mongodb'

async function startMigration() {
  try {
    const url = "mongodb://rsk:gEbiq5KegHPzlRnkwr8O7gvFxjOoKBSjrxWXSmQuH2u@13.59.126.150:27017/?authMechanism=DEFAULT";
    const dbName = 'blockDB_1_1_5';
    const client = new MongoClient(url);
    const db = client.db(dbName);
    await listCollections(db);
    // await listCollection(db, 'status')
    // await listCollection(db, 'config')
  } catch (err) {
    return Promise.reject(err);
  }
}

async function listCollections(db) {
  let collections = await db.listCollections().toArray();
  console.log("Collections:");
  collections.forEach(async collection => await countCollection(db, collection.name));
};

async function countCollection(db, collection) {
  const response = await db.collection(collection).indexes();
  console.log(`Count of ${collection}: `, response)
}

async function listCollection(db, collection) {
  let cursor = await db.collection(collection).find({});
  cursor.forEach(
    (doc) => {
      console.log(doc);
    },
    (err) => {
      console.log('>>> ERROR ERROR ERROR ERROR ERROR <<<', err)
    }
  );
}

startMigration();
