
const express = require('express')
var cors = require('cors')
const async = require("async");
const redis = require("redis");
const client = redis.createClient();

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
            // console.log(keys)
            async.map(keys, function (key, cb) {
                client.hgetall(key, function (error, value) {
                    if (error) return cb(error);
                    // console.log(value)
		    var players = value.player_names.replace(/\s/g, '');
		    players = players.split("VS");
                    var replay = {};
                    replay['recid'] = key.substring(7, key.length);
                    replay['date'] = value['date_time'];
                    replay['player1'] = players[0];
		    replay['player2'] = players[1];
                    cb(null, replay);
                });
            }, function (error, results) {
                if (error) return console.log(error);
                console.log(results);
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
