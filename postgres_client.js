var exports = module.exports = {};

var pg = require('pg');

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

        var rows = res.rows;
        response.send({"rows": rows});

    });

}
