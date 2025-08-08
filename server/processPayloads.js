const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://afshanaaz0409:ZdcPBdb6qfiiMGF8@cluster0.by9c7uv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'whatsapp';
const COLLECTION = 'processed_messages';
const PAYLOADS_DIR = path.join(__dirname, '../payloads'); // adjust if needed

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const col = db.collection(COLLECTION);

  const files = fs.readdirSync(PAYLOADS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const payload = JSON.parse(fs.readFileSync(path.join(PAYLOADS_DIR, file), 'utf8'));
    if (payload.payload_type === 'whatsapp_webhook') {
      for (const entry of payload.metaData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            for (const msg of change.value.messages || []) {
              await col.updateOne(
                { id: msg.id },
                { $setOnInsert: {
                  ...msg,
                  wa_id: change.value.contacts[0].wa_id,
                  name: change.value.contacts[0].profile.name,
                  status: 'sent'
                }},
                { upsert: true }
              );
            }
          }
          if (change.field === 'statuses') {
            for (const status of change.value.statuses || []) {
              await col.updateOne(
                { id: status.id },
                { $set: { status: status.status } }
              );
            }
          }
        }
      }
    }
  }
  await client.close();
  console.log('Done processing payloads.');
}

main();
