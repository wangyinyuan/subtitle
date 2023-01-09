const express = require("express");
const path = require("path")
const { search, lyric, song_url_v1, album, song_detail } = require('NeteaseCloudMusicApi');
// 普通话注音
const { pinyin } = require('pinyin-pro');
// 粤语注音
const ToJyutping = require('to-jyutping');
// 日语注音
const Kuroshiro = require("kuroshiro");
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
const kuroshiro = new Kuroshiro();
const kuromojiAnalyzer = new KuromojiAnalyzer();
kuroshiro.init(kuromojiAnalyzer);
// 韩语注音
const kpop = require('kpop')

const app = express();

const cors = require("cors")
app.use(cors())

app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
})

app.post('/api/search', async (req, res) => {
    try {
        let result = await search({
            keywords: req.body.keywords,
            type: 1,
            limit: 10,
            offset: (req.body.pageNum-1)*10
        })
        if (result.body.result.songs) {
            const detail = await song_detail({
                ids: result.body.result.songs.map(i => i.id).join(',')
            })
            if (detail.status === 200) {
                for (let i = 0; i < result.body.result.songs.length; i++) {
                    result.body.result.songs[i].noCopyrightRcmd = detail.body.songs[i].noCopyrightRcmd === null ? 1 : 0
                    result.body.result.songs[i].albumCover = detail.body.songs[i].al.picUrl
                }
            }
        }
        res.json(result)
    } catch (error) {
        res.json(error)
    }
})

app.post('/api/detail', async (req, res) => {
    try {
        const detail = await song_detail({
            ids: `${req.body.id}`
        })
        if(detail.status!==200){
            console.error(`请求歌曲详情错误！${detail.status}`)
            res.json(`请求歌曲详情错误！${detail.status}`)
        }else{
            let song = detail.body.songs[0]
            song.album = song.al
            song.al=undefined;
            song.albumCover = song.album.picUrl
            res.json(song)
        }
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
            level: 'standard'
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
                html += `${e.lyric[i]===' '?' ':e.lyric[i]}<rp>(</rp><rt>${py[i] === e.lyric[i] ? '' : py[i]}</rt><rp>)</rp>`
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
                html += `${py[i][0]===' '?' ':py[i][0]}<rp>(</rp><rt>${py[i][1] === null ? '' :
                        parseInt(py[i][1].split(' ')[0].slice(-1)) ? `${py[i][1].split(' ')[0].slice(0, -1)}<sup>${py[i][1].split(' ')[0].slice(-1)}</sup>` : py[i][1].split(' ')[0]
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

app.post('/api/pinyin/korean', (req, res) => {
    const koreanSplitRegex = /([\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]+)|([^\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]+)/g
    const koreanRegex = /[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]+/g

    try {
        const originalLyric = req.body.lyric
        let out = []
        for (let e of originalLyric) {
            let lyric = e
            let html = '<ruby>'
            const origin = e.lyric.match(koreanSplitRegex);
            for (let l of origin) {
                if(l===' '){ // 是空格
                    html+=' <rt></rt>'
                }else if(l.match(koreanRegex)===null){ // 不是韩文字符
                    html+=`${l}<rt></rt>`
                }else{// 是韩文！
                    html+=`${l}<rp>(</rp><rt>${kpop.romanize(l)}</rt><rp>)</rp>`
                }
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