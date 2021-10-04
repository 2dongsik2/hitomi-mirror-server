const child_process = require('child_process');
const express = require('express');
const sqlite3 = require('sqlite3');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs')

const PORT = 80;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}))

app.get('/', (req, res) => {
    res.send("/data<br>/files")
});

app.get('/version', (req, res) => {
    res.send(fs.readFileSync('latest.date').toString());
});

app.get('/data', (req, res) => {
    if (!req.query.query)
        res.send("empty query. please set query parameter");
    else {
        data_query(req.query.query).then((result) => {
            res.json(result || {});
        }).catch((err) => {
            console.log(err);
            res.writeHead(400);
            res.write(JSON.stringify(err));
            res.end();
        });
    }
});

app.post('/data', (req, res) => {
    if (!req.body.query)
        res.json({ error: "empty query. please set query parameter" });
    else {
        data_query(req.body.query).then((result) => {
            res.json(result || {});
        }).catch((err) => {
            console.log(err);
            res.writeHead(400);
            res.write(JSON.stringify(err));
            res.end();
        });
    }
});

app.get('/files', async (req, res) => {
    if (!req.query.query)
        res.send("empty query. please set query parameter");
    else {
        files_query(req.query.query).then((result) => {
            res.json(result || {});
        }).catch((err) => {
            console.log(err);
            res.writeHead(400);
            res.write(JSON.stringify(err));
            res.end();
        });
    }
});

app.post('/files', async (req, res) => {
    if (!req.body.query)
        res.json({ error: "empty query. please set query parameter" });
    else {
        files_query(req.body.query).then((result) => {
            res.json(result || {});
        }).catch((err) => {
            console.log(err);
            res.writeHead(400);
            res.write(JSON.stringify(err));
            res.end();
        });
    }
});

function subdomain(hash, base = 'b') {
    g = parseInt(hash.substr(hash.length - 3, 2), 16);
    if (isNaN(g))
        return 97 + base;
    if (g < 0x44)
        return String.fromCharCode(99) + base;
    if (g < 0x88)
        return String.fromCharCode(98) + base;
    return String.fromCharCode(97) + base;
}
function imageurl(image, dir = null, ext = null) {
    if (image['hasavif']) dir = 'avif';
    if (image['haswebp']) dir = 'webp';
    if (!ext) ext = dir;
    if (!ext) ext = image['name'].split('.')[-1];
    if (!ext) ext = 'jpg';
    if (!dir) dir = 'images';
    hash = image['hash'];
    sdmin = subdomain(image['hash'], (image['hasavif'] || image['haswebp']) ? 'a' : 'b');
    return `https://${sdmin}.hitomi.la/${dir}/${[...hash].pop()}/${hash.substr(hash.length - 3, 2)}/${hash}.${ext}`;
}

app.get('/image', async (req, res) => {
    if (!req.query.data)
        res.json({ error: "empty or invalid data" });
    let url = imageurl(JSON.parse(req.query.data));
    console.log(url);
    let axres = await axios({
        url: url,
        method: 'GET',
        headers: {
            'Referer': 'https://hitomi.la/'
        },
        responseType: 'stream'
    });
    // ext = 'jpg';
    // if (req.body['hasavif']) ext = 'avif'
    // if (req.body['haswebp']) ext = 'webp'
    // res.set("Content-Type", `image/${ext}`);
    // res.send(axres.data);
    axres.data.pipe(res);
})

app.post('/image', async (req, res) => {
    if (!req.body.hash)
        res.json({ error: "empty or invalid data" });
    let url = imageurl(req.body);
    console.log(url);
    let axres = await axios({
        url: url,
        method: 'GET',
        headers: {
            'Referer': 'https://hitomi.la/'
        },
        responseType: 'stream'
    });
    // ext = 'jpg';
    // if (req.body['hasavif']) ext = 'avif'
    // if (req.body['haswebp']) ext = 'webp'
    // res.set("Content-Type", `image/${ext}`);
    // res.send(axres.data);
    axres.data.pipe(res);
})

app.listen(PORT, () => {
    console.log(`Listen on ${PORT}`)
});

const data_query = (query) => new Promise((resolve, reject) => {
    console.log("query: ", query);
    console.debug("query start");
    const data_db = new sqlite3.Database('./data.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.log(err);
            reject(err);
        } else {
            console.log('data.db connect success');
        }
    });
    data_db.serialize();
    data_db.all(query, (err, row) => {
        console.log("query end");
        if (err) {
            console.debug(err);
            reject(err);
        }
        else {
            resolve(row);
        }
    });
});

const files_query = (query) => new Promise((resolve, reject) => {
    console.log("query: ", query);
    console.debug("query start");
    const files_db = new sqlite3.Database('./files.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.log(err);
            reject(err);
        } else {
            console.log('files.db connect success');
        }
    });
    files_db.serialize();
    files_db.all(query, (err, row) => {
        console.log("query end");
        if (err) {
            console.debug(err);
            reject(err);
        }
        else {
            resolve(row);
        }
    });
});

let update = {
    process: null,
    log: ""
};
app.get('/update', (req, res) => {
    if (update.process)
        return res.send(`@@update process already started@@<br>check logs: <a href="/update/logs">here</a>`);
    update.log = "";
    update.process = child_process.spawn("./update.sh");
    update.process.stdout.on('data', function (data) {
        update.log += data.toString().split('\n').filter(Boolean).map(x => "[OUTPUT]: " + x).join('<br>') + "<br>";
    });
    update.process.stderr.on('data', function (data) {
        update.log += data.toString().split('\n').filter(Boolean).map(x => "[ERROR]: " + x).join('<br>') + "<br>";
    });
    update.process.on('exit', function (code) {
        update.log += "@@@@END OF PROCESS@@@@";
        update.process = null;
    });
    res.send(`update process created<br>check logs: <a href="/update/logs">here</a>`);
});

app.get('/update/logs', (req, res) => {
    res.send(update.log);
})