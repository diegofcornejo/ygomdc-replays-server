
const express = require('express')
var cors = require('cors')
const async = require("async");
const redis = require("redis");
// const client = redis.createClient();
const client = redis.createClient({
    host: process.env.REDIS_YGOPRO_HOST,
    port: process.env.REDIS_YGOPRO_PORT,
    password: process.env.REDIS_YGOPRO_PASSWORD
});

client.on("error", function(error) {
    console.error(error);
});

const app = express()
const port = 3911

app.use(cors())

app.get('/replay', (req, res) => {
    var replays = [];
    client.keys('replay:*', function (err, keys) {
        if (err) return console.log(err);
        if (keys) {
            async.map(keys, function (key, cb) {
                client.hmget(key, ["player_names","date_time"], function (error, value) {
                    if (error) return cb(error);
		    var players = value[0].replace(/\s/g, '');
		    players = players.split("VS");
                    var replay = {};
                    replay['recid'] = key.substring(7, key.length);
                    replay['date'] = value[1];
                    replay['player1'] = players[0];
		    replay['player2'] = players[1];
                    cb(null, replay);
                });
            }, function (error, results) {
                if (error) return console.log(error);
                res.json({
                    data: results
                });
            });
        }
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
