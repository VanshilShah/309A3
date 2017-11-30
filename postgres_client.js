var exports = module.exports = {};

var pg = require('pg');

var config = {
  host: '',
  port: 5432,
  user: '',
  password: '',
  database: '',
};

pg.defaults.ssl = true;

var pool = new pg.Pool(config);

pool.connect(function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  else{
    console.log('pool connected');
  }
});

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack)
});
