const mongoose = require("mongoose");
const mongoDb = process.env.MONGODB_URI;

const db = mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });