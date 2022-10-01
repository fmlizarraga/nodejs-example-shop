const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  // RjK6aMqoUcWcIktD
  MongoClient.connect('mongodb+srv://fml:RjK6aMqoUcWcIktD@cluster0.hxnirdg.mongodb.net/shop?retryWrites=true&w=majority')
  .then(client => {
    console.log('Connected to MongoDB');
    _db = client.db();
    callback();
  })
  .catch(err => {
    console.log(err);
    throw err;
  });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;