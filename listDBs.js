const mongoose = require('mongoose');
require('dotenv').config();

async function listDatabases() {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = new mongoose.mongo.Admin(mongoose.connection.db);
  const dbs = await admin.listDatabases();
  console.log('Databases:', dbs.databases.map(db => db.name));
  await mongoose.disconnect();
}

listDatabases().catch(console.error);
