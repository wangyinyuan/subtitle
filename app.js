const express = require("express");
const path = require("path")
const cors = require("cors")
const { search, lyric, song_url_v1, album } = require('NeteaseCloudMusicApi');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(cors());

const port = 3000;

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, '../public/index.html'));
})

app.post('/api/search', async (req, res) => {
    try {
        const result = await search({
            keywords: req.body.keywords,
            type: 1,
            limit: 10
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
})

app.post('/api/lyric', async (req, res) => {
    try {
        const result = await lyric({
            id: req.body.id
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
})

app.post('/api/songURL', async (req, res) => {
    try {
        const result = await song_url_v1({
            id: req.body.id,
            level:'exhigh'
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
})

app.post('/api/album', async (req, res) => {
    try {
        const result = await album({
            id: req.body.id
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
})

app.listen(port, () => {
    console.log(`The server running at http://localhost:${port}`);
})