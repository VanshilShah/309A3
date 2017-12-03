var exports = module.exports = {};

var pg = request('pg');

var config = {
  host: 'ec2-23-21-155-53.compute-1.amazonaws.com',
  port: 5432,
  user: 'aczwartnbdscwn',
  password: process.env.DB_PASS || "",
  database: 'dfoti1pjkj320p',
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

CREATE TEMP TABLE IF NOT EXISTS users (
  user_id text UNIQUE,
  courses text
);

exports.getSomething = function(some_argument, response){
  console.log("getsomething called");
  var values = [some_argument];

  var query = "SELECT * FROM public.\"<tablename>\" WHERE somecolumn = $1";
  pool.query(query, values, function (err, res) {
    if (err){
      console.log(err);
      response.send(err);
      return
    }

    var rows = response.rows;
    response.send({"rows": rows});

  });

}

function lookupUser(request, res, next) {

  var userId = request.params.id;

  var sql = ‘SELECT * FROM users WHERE user_id = ?’;
  pool.query(sql, [ userId ], function(err, results) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({ errors: [‘Could not retrieve user’] });
    }

    if (results.rows.length === 0) {

      res.statusCode = 404;
      return res.json({ errors: [‘user not found’] });
    }

    request.user = results.rows[0];
    next();
  });
}



function insertUser(request, res) {
  var sql = 'INSERT INTO users (user_id, courses) VALUES ($1,$2) RETURNING user_id';

  var data = [
    request.params.id,
    request.body.courses,

  ];
  pool.query(sql, data, function(err, result) {
    if (err) {

      console.error(err);
      res.statusCode = 500;
      return res.json({
        errors: ['Failed to create user']
      });
    }
    var new_user = result.rows[0].user_id;
    var sql = 'SELECT * FROM users WHERE user_id = $1';
    pool.query(sql, [ new_user ], function(err, result) {
      if (err) {

        console.error(err);
        res.statusCode = 500;
        return res.json({
          errors: ['Could not retrieve user after create']
        });
      }

      res.statusCode = 201;

      res.json(result.rows[0]);
  });
});
}

function updateUser(request, res) {
  var sql = 'UPDATE users SET courses = ($2) WHERE user_id + ($1)';

  var data = [
    request.params.id,
    request.body.courses,

  ];
  pool.query(sql, data, function(err, result) {
    if (err) {

      console.error(err);
      res.statusCode = 500;
      return res.json({
        errors: ['Failed to update user']
      });
    }
    var updated_user = result.rows[0].user_id;
    var sql = 'SELECT * FROM users WHERE user_id = $1';
    pool.query(sql, [ updated_user ], function(err, result) {
      if (err) {

        console.error(err);
        res.statusCode = 500;
        return res.json({
          errors: ['Could not retrieve user after update']
        });
      }

      res.statusCode = 200;

      res.json(result.rows[0]);
  });
});
}

function deleteUser(request, res) {
  var sql = 'DELETE FROM users WHERE user_id = ($1)';

  var data = [
    request.params.id,


  ];
  pool.query(sql, data, function(err, result) {
    if (err) {

      console.error(err);
      res.statusCode = 500;
      return res.json({
        errors: ['Failed to delete user']
      });
    }
    var updated_user = result.rows[0].user_id;
    var sql = 'SELECT * FROM users ';
    pool.query(sql, [ updated_user ], function(err, result) {
      if (err) {

        console.error(err);
        res.statusCode = 500;
        return res.json({
          errors: ['Could not retrieve users after deletion']
        });
      }

      res.statusCode = 200;

      res.json(result.rows[0]);
  });
});
}
