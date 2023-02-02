import { PrismaClient } from '@prisma/client'
import { processDocument } from './processingFunctions'

const prisma = new PrismaClient();

let migration_id;

export async function createMigration() {
  let migration_record = await prisma.migration.create({ data: {} });
  migration_id = migration_record.id;
}

export async function processCollection(db, collection) {
  if (migration_id === undefined)
    throw new Error("Migration is not created");
  let migration_detail_record = await prisma.migration_detail.create({ data: { migration_id } });
  // Get total record to process from MongoDB database
  console.log(`\nProcessing collection: ${collection}`);
  const total = await db.collection(collection).count();
  console.log(`Total documents: ${total}`);
  // Get registered records in PostgreSQL database
  const initial = (await prisma.$queryRawUnsafe(`SELECT COUNT(1) as counter from ${collection}`))[0].counter;
  console.log(`Registered documents: ${initial}`);
  await prisma.migration_detail.update({
    where: { id: migration_detail_record.id },
    data: {
      total,
      initial: parseInt(initial),
      processed: 0,
      collection
    }
  });
  if (initial >= total) {
    await prisma.migration_detail.update({
      where: { id: migration_detail_record.id },
      data: {
        status: 'done'
      }
    });
  }
  else {
    // Initialize counter of processed records
    let count = 0;
    const nPerPage = 15;
    const maxPages = Math.ceil(total / nPerPage);

    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
      console.log(`\nPage ${pageNumber} of ${maxPages}`);
      let cursor = await db.collection(collection).find().sort({ _id: 1 }).skip(pageNumber > 0 ? ((pageNumber - 1) * nPerPage) : 0).limit(nPerPage).toArray();
      // Check storeFunction defined in processingDocument for collection
      let storeFunction = processDocument[collection];
      if (storeFunction === undefined)
        throw new Error(`No store function defined for collection ${collection}`);
      // Processing documents
      await Promise.all(cursor.map(async (document) => {
        // Loop for retrying process
        for (let i = 1; i <= 3; i++) {
          try {
            await storeFunction(document);
            count++;
            await prisma.migration_detail.update({
              where: { id: migration_detail_record.id },
              data: { processed: count }
            });
            process.stdout.write(`\rProcessed documents: ${count}`);
            i = 4; // Exit from loop
          } catch (error) {
            if (i == 3) {
              try {
                await prisma.migration_error.create({
                  data: {
                    migration_detail_id: migration_detail_record.id,
                    data: document,
                    error: error.toString()
                  }
                });
              } catch {
                console.log('\n\n!!! ERROR SAVING ERROR!!!\n')
              }
            } else {
              console.log('\n\n!!! ERROR !!!\n', `--- Try: ${i} ---`, error)
            }
          }
        }
      }));
    }
    if (count == total) {
      await prisma.migration_detail.update({
        where: { id: migration_detail_record.id },
        data: { status: 'done' }
      });
      console.log(`\nCollection ${collection} was proccessed successfully`);
    } else {
      await prisma.migration_detail.update({
        where: { id: migration_detail_record.id },
        data: { status: 'error' }
      });
      console.log(`\nCollection ${collection} was proccessed with errors`);
    }
  }
}
