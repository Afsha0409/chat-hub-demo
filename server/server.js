const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (audio uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mount upload router
const uploadRouter = require('./upload');
app.use(uploadRouter);

const MONGO_URI = 'mongodb+srv://afshanaaz0409:ZdcPBdb6qfiiMGF8@cluster0.by9c7uv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'whatsapp';
const COLLECTION = 'processed_messages';

async function getDb() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return client.db(DB_NAME);
}

// Get all conversations grouped by wa_id
app.get('/api/conversations', async (req, res) => {
  const db = await getDb();
  const allMessages = await db.collection(COLLECTION).find().toArray();

  // keep grouped here so it's available everywhere
  const grouped = {};

  for (const msg of allMessages) {
    // normalize timestamp
    let ts = msg.timestamp;
    let dateObj;

    if (typeof ts === 'number' || (typeof ts === 'string' && /^\d+$/.test(ts))) {
      // convert milliseconds to seconds if needed
      if (String(ts).length > 10) ts = Math.floor(Number(ts) / 1000);
      dateObj = new Date(Number(ts) * 1000);
    } else if (typeof ts === 'string' && !isNaN(Date.parse(ts))) {
      dateObj = new Date(ts);
    } else {
      dateObj = new Date(0);
    }
    msg._parsedTimestamp = dateObj;

    // normalize text field
    const messageText =
      typeof msg.content === 'string'
        ? msg.content
        : msg.text?.body || '';

    msg.messageText = messageText;

    // group by wa_id
    if (!grouped[msg.wa_id]) {
      grouped[msg.wa_id] = {
        wa_id: msg.wa_id,
        user: {
          name: msg.name || '',
        }, messages: [], latest_message: null
      };
    }
    grouped[msg.wa_id].messages.push(msg);

    // set latest message
    if (
      !grouped[msg.wa_id].latest_message ||
      msg._parsedTimestamp > grouped[msg.wa_id].latest_message._parsedTimestamp
    ) {
      grouped[msg.wa_id].latest_message = msg;
    }
  }

  // format result
  // format result
  const conversations = Object.values(grouped).map(conv => ({
    wa_id: conv.wa_id,
    user: {
      name: conv.user?.name || '',
    },
    latest_message: {
      content: conv.latest_message?.messageText || '',
      timestamp: conv.latest_message?._parsedTimestamp.toISOString() || ''
    }
  }));



  res.json(conversations);
});



// app.get('/api/conversations', async (req, res) => {
//   const db = await getDb();
//   const messages = await db.collection(COLLECTION).find().toArray();
//   const grouped = {};
//   messages.forEach(msg => {
//     // Try to extract name from multiple possible locations
//     let name = msg.name;
//     if (!name && msg.profile && msg.profile.name) name = msg.profile.name;
//     if (!name && msg.sender_name) name = msg.sender_name;
//     if (!name && msg.contacts && Array.isArray(msg.contacts)) {
//       for (const contact of msg.contacts) {
//         if (contact.profile && contact.profile.name) {
//           name = contact.profile.name;
//           break;
//         }
//       }
//     }
//     if (!name && msg.phone_number) name = msg.phone_number;
//     if (!name) name = msg.wa_id;
//     if (!grouped[msg.wa_id]) {
//       grouped[msg.wa_id] = {
//         wa_id: msg.wa_id,
//         name,
//         phone_number: msg.phone_number || msg.wa_id,
//         latest_message: msg,
//         unread_count: 0,
//         user: { name, wa_id: msg.wa_id, phone_number: msg.phone_number }
//       };
//     }
//     if (!grouped[msg.wa_id].latest_message || new Date(msg.timestamp) > new Date(grouped[msg.wa_id].latest_message.timestamp)) {
//       grouped[msg.wa_id].latest_message = msg;
//     }
//     if (!msg.is_from_me && msg.status === 'sent') {
//       grouped[msg.wa_id].unread_count += 1;
//     }

//   });
//   res.json(Object.values(grouped));
// });

// Get all messages for a wa_id
app.get('/api/messages', async (req, res) => {
  const wa_id = req.query.wa_id;
  const db = await getDb();

  // Mark all incoming (not from me) as read
  await db.collection(COLLECTION).updateMany(
    {
      wa_id,
      $or: [
        { is_from_me: false },
        { is_from_me: { $exists: false } }
      ],
      status: { $ne: 'read' }
    },
    { $set: { status: 'read' } }
  );

  // Then fetch all messages
  const messages = await db.collection(COLLECTION)
    .find({ wa_id })
    .sort({ timestamp: 1 })
    .toArray();

  // Normalize messages
  const normalized = messages.map(msg => {
    let ts = msg.timestamp;
    let dateObj;

    if (typeof ts === 'number' || (typeof ts === 'string' && /^\d+$/.test(ts))) {
      if (String(ts).length > 10) ts = Math.floor(Number(ts) / 1000); // ms to s
      dateObj = new Date(Number(ts) * 1000);
    } else if (typeof ts === 'string' && !isNaN(Date.parse(ts))) {
      dateObj = new Date(ts);
    } else {
      dateObj = new Date(0); // fallback to old date
    }

    // Removed grouped logic here

    return {
      id: msg.id,
      wa_id: msg.wa_id,
      content: msg.content || (msg.text && msg.text.body) || '',
      message_type: msg.type || msg.message_type || 'text',
      timestamp: dateObj.toISOString(),
      status: 'read', // already marked
      is_from_me: msg.is_from_me !== undefined ? msg.is_from_me : (msg.from !== wa_id),
      sender_name: msg.sender_name || msg.name || '',
    };
  });

  res.json(normalized);
});


// app.get('/api/messages', async (req, res) => {
//   const wa_id = req.query.wa_id;
//   const db = await getDb();

//   // Mark all incoming (not from me) as read
//   await db.collection(COLLECTION).updateMany(
//     {
//       wa_id,
//       $or: [
//         { is_from_me: false },
//         { is_from_me: { $exists: false } }
//       ],
//       status: { $ne: 'read' }
//     },
//     { $set: { status: 'read' } }
//   );


//   // Then fetch all messages
//   const messages = await db.collection(COLLECTION)
//     .find({ wa_id })
//     .sort({ timestamp: 1 })
//     .toArray();

//   // Normalize messages
//   const normalized = messages.map(msg => {
//     let ts = msg.timestamp;
//     let dateObj;

//     if (typeof ts === 'number' || (typeof ts === 'string' && /^\d+$/.test(ts))) {
//       if (String(ts).length > 10) ts = Math.floor(Number(ts) / 1000); // ms to s
//       dateObj = new Date(Number(ts) * 1000);
//     } else if (typeof ts === 'string' && !isNaN(Date.parse(ts))) {
//       dateObj = new Date(ts);
//     } else {
//       dateObj = new Date(0); // fallback to old date
//     }

//     msg._parsedTimestamp = dateObj;

//     // if (!grouped[msg.wa_id].latest_message || msg._parsedTimestamp > grouped[msg.wa_id].latest_message._parsedTimestamp) {
//     //   grouped[msg.wa_id].latest_message = msg;
//     // }

//     return {
//       id: msg.id,
//       wa_id: msg.wa_id,
//       content: msg.content || (msg.text && msg.text.body) || '',
//       message_type: msg.type || msg.message_type || 'text',
//       timestamp: isoTimestamp,
//       status: 'read', // already marked
//       is_from_me: msg.is_from_me !== undefined ? msg.is_from_me : (msg.from !== wa_id),
//       sender_name: msg.sender_name || msg.name || '',
//     };
//   });

//   res.json(normalized);
// });











// app.get('/api/messages', async (req, res) => {
//   const wa_id = req.query.wa_id;
//   const db = await getDb();
//   // Find all messages for this wa_id
//   const messages = await db.collection(COLLECTION)
//     .find({ wa_id: wa_id })
//     .sort({ timestamp: 1 })
//     .toArray();

//   // Normalize messages for frontend
//   const normalized = messages.map(msg => {
//     let ts = msg.timestamp;
//     let isoTimestamp = '';
//     if (typeof ts === 'number' || (typeof ts === 'string' && /^\d+$/.test(ts))) {
//       // Numeric timestamp (seconds or ms)
//       if (String(ts).length > 10) ts = Math.floor(Number(ts) / 1000); // ms to s
//       isoTimestamp = new Date(Number(ts) * 1000).toISOString();
//     } else if (typeof ts === 'string' && !isNaN(Date.parse(ts))) {
//       isoTimestamp = new Date(ts).toISOString();
//     } else {
//       isoTimestamp = '';
//     }
//     return {
//       id: msg.id,
//       wa_id: msg.wa_id,
//       content: msg.content || (msg.text && msg.text.body) || '',
//       message_type: msg.type || msg.message_type || 'text',
//       timestamp: isoTimestamp,
//       status: msg.status || 'sent',
//       is_from_me: msg.is_from_me !== undefined ? msg.is_from_me : (msg.from !== wa_id),
//       sender_name: msg.sender_name || msg.name || '',
//       // add other fields as needed
//     };
//   });

//   res.json(normalized);
// });

// Send a message (demo)
app.post('/api/send', async (req, res) => {
  const { wa_id, content } = req.body;
  const db = await getDb();

  const msg = {
    wa_id,
    name: 'Me',
    content,
    timestamp: new Date().toISOString(),
    status: 'read', // directly set read if from me
    is_from_me: true,
    from: 'me',
    id: 'demo_' + Date.now()
  };

  await db.collection(COLLECTION).insertOne(msg);
  res.json(msg);
});

// app.post('/api/send', async (req, res) => {
//   const { wa_id, content } = req.body;
//   const db = await getDb();
//   const msg = {
//     wa_id,
//     name: 'Me',
//     content,
//     timestamp: new Date().toISOString(),
//     status: 'sent',
//     is_from_me: true,
//     from: 'me', // or use your own wa_id if you want
//     id: 'demo_' + Date.now()
//   };
//   await db.collection(COLLECTION).insertOne(msg);
//   res.json(msg);


// });

// Mark messages as read for a conversation
app.post('/api/conversations/:wa_id/read', async (req, res) => {
  const { wa_id } = req.params;
  const db = await getDb();

  await db.collection(COLLECTION).updateMany(
    { wa_id, is_from_me: false, status: { $ne: 'read' } }, // only received msgs
    { $set: { status: 'read' } }
  );

  res.json({ success: true });
});



// Webhook payload processor (for batch import)
app.post('/api/webhook', async (req, res) => {
  const payload = req.body;
  const db = await getDb();
  if (payload.payload_type === 'whatsapp_webhook') {
    for (const entry of payload.metaData.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          for (const msg of change.value.messages || []) {
            await db.collection(COLLECTION).updateOne(
              { id: msg.id },
              {
                $setOnInsert: {
                  ...msg,
                  wa_id: change.value.contacts[0].wa_id,
                  name: change.value.contacts[0].profile.name,
                  status: 'sent'
                }
              },
              { upsert: true }
            );
          }
        }
        if (change.field === 'statuses') {
          for (const status of change.value.statuses || []) {
            await db.collection(COLLECTION).updateOne(
              { id: status.id },
              { $set: { status: status.status } }
            );
          }
        }
      }
    }
  }
  res.json({ ok: true });
});

// Endpoint to process payloads and insert/update messages and statuses
app.post('/api/process-payload', async (req, res) => {
  const payload = req.body;
  const db = await getDb();
  let inserted = 0;
  let updated = 0;
  if (payload.payload_type === 'whatsapp_webhook') {
    for (const entry of payload.metaData.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          for (const msg of change.value.messages || []) {
            const result = await db.collection(COLLECTION).updateOne(
              { id: msg.id },
              {
                $setOnInsert: {
                  ...msg,
                  wa_id: change.value.contacts[0].wa_id,
                  name: change.value.contacts[0].profile.name,
                  status: 'sent'
                }
              },
              { upsert: true }
            );
            if (result.upsertedCount) inserted++;
          }
        }
        if (change.field === 'statuses') {
          for (const status of change.value.statuses || []) {
            const result = await db.collection(COLLECTION).updateOne(
              { id: status.id },
              { $set: { status: status.status } }
            );
            if (result.modifiedCount) updated++;
            // Also update by meta_msg_id if present
            if (status.meta_msg_id) {
              const result2 = await db.collection(COLLECTION).updateOne(
                { meta_msg_id: status.meta_msg_id },
                { $set: { status: status.status } }
              );
              if (result2.modifiedCount) updated++;
            }
          }
        }
      }
    }
  }
  res.json({ inserted, updated });
});

app.listen(3001, () => console.log('API running on port 3001'));
