import { PrismaClient } from '@prisma/client'
import { processDocument } from './processingFunctions'

const prisma = new PrismaClient();

let migration_id;
const batchSize = parseInt(process.env.BATCH_SIZE);

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
  const initial = parseInt((await prisma.$queryRawUnsafe(`SELECT COUNT(1) as counter from ${collection}`))[0].counter);
  console.log(`Registered documents: ${initial}`);
  let pageNumber = Math.trunc(initial / batchSize);
  if (pageNumber < 1) pageNumber = 1;
  let count = (pageNumber - 1) * batchSize;
  await prisma.migration_detail.update({
    where: { id: migration_detail_record.id },
    data: {
      total,
      initial,
      processed: count,
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
    let max_read, min_read, current_read, max_write, min_write, current_write;
    const maxPages = Math.ceil(total / batchSize);

    for (pageNumber; pageNumber <= maxPages; pageNumber++) {
      let initial_time = Date.now();
      console.log(`\nPage ${pageNumber} of ${maxPages}`);
      let cursor = await db.collection(collection).find().sort({ _id: 1 }).skip(pageNumber > 0 ? ((pageNumber - 1) * batchSize) : 0).limit(batchSize).toArray();
      // Check storeFunction defined in processingDocument for collection
      let storeFunction = processDocument[collection];
      if (storeFunction === undefined)
        throw new Error(`No store function defined for collection ${collection}`);
      current_read = ((Date.now() - initial_time)) / 1000;
      console.log(`Read time: ${current_read}`);
      // Processing documents
      initial_time = Date.now();
      await Promise.all(cursor.map(async (document) => {
        // Loop for retrying process
        for (let i = 1; i <= 3; i++) {
          try {
            await storeFunction(document);
            count++;
            // process.stdout.write(`\rProcessed documents: ${count}`);
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
                await prisma.migration_detail.update({
                  where: { id: migration_detail_record.id },
                  data: { status: 'error' }
                });
                pageNumber = maxPages;
              } catch {
                console.log('\n\n!!! ERROR SAVING ERROR!!!\n')
              }
            } else {
              console.log('\n\n!!! ERROR !!!\n', `--- Try: ${i} ---`, error)
            }
          }
        }
      }));
      current_write = (Date.now() - initial_time) / 1000;
      console.log(`Write time: ${current_write}`);
      console.log(`Processed documents: ${count}`);
      if ((min_read === undefined) || (min_read > current_read))
        min_read = current_read
      if ((max_read === undefined) || (max_read < current_read))
        max_read = current_read
      if ((min_write === undefined) || (min_write > current_write))
        min_write = current_write
      if ((max_write === undefined) || (max_write < current_write))
        max_write = current_write
      // Update migration detail
      await prisma.migration_detail.update({
        where: { id: migration_detail_record.id },
        data: {
          processed: count,
          min_read,
          max_read,
          min_write,
          max_write,
        }
      });
    }
    if (count == total) {
      await prisma.migration_detail.update({
        where: { id: migration_detail_record.id },
        data: { status: 'done' }
      });
      console.log(`\nCollection ${collection} was processed successfully`);
    } else {
      await prisma.migration_detail.update({
        where: { id: migration_detail_record.id },
        data: { status: 'error' }
      });
      console.log(`\nCollection ${collection} was processed with errors`);
    }
  }
}
