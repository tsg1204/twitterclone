const { connect } = require('mongodb');
const mongoose = require('mongoose');
const uri = require('./dev/keys');

async function connectDB() {
  try {
    await mongoose.connect(uri.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  } catch (err) {
    console.error('Error connecting to mongodb');
    console.error(err);
  }
}

module.exports = { connectDB };
