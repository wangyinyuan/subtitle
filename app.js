const express = require("express");
const path = require("path")
const { search, lyric, song_url_v1, album } = require('NeteaseCloudMusicApi');

const { pinyin } = require('pinyin-pro');
const ToJyutping = require('to-jyutping');
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
const kuroshiro = new Kuroshiro();
const kuromojiAnalyzer = new KuromojiAnalyzer();
kuroshiro.init(kuromojiAnalyzer)

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

const port = 3000;

app.get('/', (req, res) => {
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
            level: 'exhigh'
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

app.post('/api/pinyin/jpHiragana', async (req, res) => {
    try {
        const originalLyric = req.body.lyric
        let hiragana = []
        for (let e of originalLyric) {
            let lyric = e
            await kuroshiro.convert(e.lyric, { to: "hiragana", mode: "furigana" })
                .then(res => { lyric.lyric = res })
            hiragana.push(lyric)
        }
        res.json(hiragana);
    } catch (error) {
        res.json(error)
    }
})

app.post('/api/pinyin/jpRoma', async (req, res) => {
    try {
        const originalLyric = req.body.lyric
        let roma = []
        for (let e of originalLyric) {
            let lyric = e
            await kuroshiro.convert(e.lyric, { to: "romaji", mode: "furigana" })
                .then(res => { lyric.lyric = res })
            roma.push(lyric)
        }
        res.json(roma);
    } catch (error) {
        res.json(error)
    }
})

app.post('/api/pinyin/mandarin', (req, res) => {
    try {
        const originalLyric = req.body.lyric
        let out = []
        for (let e of originalLyric) {
            let lyric = e
            let html = '<ruby>'
            let py = pinyin(e.lyric, { type: 'array' })
            for (let i = 0; i < e.lyric.length; i++) {
                html += `${e.lyric[i]}<rp>(</rp><rt class="mandarinPinyin">${py[i]===e.lyric[i]?'':py[i]}</rt><rp>)</rp>`
            }
            html += '</ruby>'
            lyric.lyric = html;
            out.push(lyric)
        }
        res.json(out);
    } catch (error) {
        res.json(error)
    }
})

app.post('/api/pinyin/cantonese', (req, res) => {
    try {
        const originalLyric = req.body.lyric
        let out = []
        for (let e of originalLyric) {
            let lyric = e
            let html = '<ruby>'
            let py = ToJyutping.getJyutpingList(e.lyric)
            for (let i = 0; i < e.lyric.length; i++) {
                html += `${py[i][0]}<rp>(</rp><rt>${
                    py[i][1]===null?'':
                    parseInt(py[i][1].split(' ')[0].slice(-1))?`${py[i][1].split(' ')[0].slice(0,-1)}<sup>${py[i][1].split(' ')[0].slice(-1)}</sup>`:py[i][1].split(' ')[0]
                }</rt><rp>)</rp>`
            }
            html += '</ruby>'
            lyric.lyric = html;
            out.push(lyric)
        }
        res.json(out);
    } catch (error) {
        res.json(error)
    }
})

app.listen(port, () => {
    console.log(`The server running at http://localhost:${port}`);
})