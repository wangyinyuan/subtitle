<script>
console.log('望中考顺利！\n\n高晟捷，\n2022年11月5日留。')
const api = async (name, parm) => {
    let out = {}
    // await fetch('http://localhost:3000/api/' + name, {
    await fetch('/api/' + name, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(parm)
    }).then(response => response.json()).then(data => out = data);
    return out;
}

export default {
    data() {
        return {
            searchData: [],
            searchTableShow: 0,
            lyric: [],
            parsedLyric: [],
            songURL: '',
            searchInput: undefined,
            play: false,
            musicTime: 0,
            colorBackgroundVisible: true,
            oldColorBackgroundVisible: true,
            animationPlayState: false,
<<<<<<< HEAD
            loading: false,
=======
>>>>>>> master
            colorImageSize: [],
            colorBackgroundImage: [],
            pinyinOptions: [
                {
                    value: 'none',
                    label: '不注音',
                },
                {
                    value: 'cantonese',
                    label: '粤语(粤拼)'
                },
                {
                    value: 'mandarin',
                    label: '普通话(汉语拼音)'
                },
                {
                    value: 'jpRoma',
                    label: '日语(罗马字)'
                },
                {
                    value: 'jpHiragana',
                    label: '日语(平假名)'
                },
            ],
            pinyinLyric: {
                mandarin: [],
                cantonese: [],
                jpRoma: [],
                jpHiragana: []
            },
            pinyin: 'none'
        }
    },
    methods: {
        async search() {
            if (this.searchInput) {
                const data = await api('search', { keywords: this.searchInput });
                if (data.status === 200) {
                    this.searchTableShow = 1;
                    this.searchData = data.body.result.songs ? data.body.result.songs : [];
                }
            }else{
                this.searchTableShow = false;
            }
        },
        async subtitle(row) {
<<<<<<< HEAD
            // 若不能播放
            if ((row.fee === 1 || row.fee === 4) && row.noCopyrightRcmd === 1) {
                return;
            }

            this.loading = true;

=======
            console.log(JSON.parse(JSON.stringify(row)))
            if ((row.fee === 1 || row.fee === 4) && row.noCopyrightRcmd===1) {
                return 0;
            }
>>>>>>> master
            this.pinyinLyric = {
                mandarin: [],
                cantonese: [],
                jpRoma: [],
                jpHiragana: []
            }
            this.pinyin = 'none'
            this.animationPlayState = false
            document.getElementById('colorBackgroundChangeSwitch').disabled = false

            const promiseAlbum = api('album', { id: row.album.id });
            const promiseLyric = api('lyric', { id: row.id })
            const promiseSongURL = api('songURL', { id: row.id })
            const [lyric, songURL, album] = await Promise.all([promiseLyric, promiseSongURL, promiseAlbum])
            if (songURL.status === 200) {
                this.songURL = songURL.body.data[0].url.split(':').join('s:')
            } else {
                this.loading = false;
                ElMessage.error(`音乐获取失败！错误码：${songURL.status}`)
                return;
            }
            if (lyric.status === 200) {
                this.lyric = lyric.body.lrc.lyric;
                this.parsedLyric = this.parseLyric;
            } else {
                this.loading = false;
                ElMessage.error(`歌词获取失败！错误码：${lyric.status}`);
                return;
            }
            if (album.status === 200) {
                let albumCover = album.body.songs[0].al.picUrl;
                let that = this;
                class SplitImage {
                    constructor(options) {
                        this.options = options
                        this.input = null
                        this.canvas = null
                        this.ctx = null
                        this.img = null
                        this.simpleWidth = 0
                        this.simpleHeight = 0
                        this.createImg(this.options.base64)
                    }
                    createImg(base64) {
                        return new Promise((resolve, reject) => {
                            const img = new Image()
                            img.src = base64
                            img.onload = () => {
                                this.img = img
                                this.splitImg()
                                resolve()
                            }
                            img.onerror = (e) => {
                                console.error(`专辑图片加载错误！错误信息：${e}`)
                                ElMessage({
                                    type: 'error',
                                    message: `专辑图片加载错误！错误信息：${e}`,
                                    duration: 0,
                                    showClose: true
                                })
                                reject(e)
                            }
                        })
                    }
                    drawImg(options) {
                        this.canvas.width = this.simpleWidth
                        this.canvas.height = this.simpleHeight
                        this.ctx.drawImage(this.img, options.x, options.y, this.simpleWidth, this.simpleHeight, 0, 0, this.simpleWidth, this.simpleHeight)
                    }

                    splitImg() {
                        this.simpleWidth = this.img.width / this.options.col
                        this.simpleHeight = this.img.height / this.options.row
                        let i = 0
                        for (let y = 0; y < this.options.row; y++) {
                            for (let x = 0; x < this.options.col; x++) {
                                this.canvas = document.getElementById(`colorBackgroundImage${i}`)
                                this.ctx = this.canvas.getContext('2d')
                                this.drawImg({
                                    x: x * this.simpleWidth,
                                    y: y * this.simpleHeight
                                })
                                i++;
                            }
                        }
                        that.colorBackgroundVisible = that.oldColorBackgroundVisible
                        if (that.colorBackgroundVisible) {
                            let element = document.getElementsByClassName('colorBackground')[0]
                            element.style.display = 'auto';
<<<<<<< HEAD
                            setTimeout(() => {
                                element.style.opacity = 1;
                            }, 1)
=======
                            element.style.opacity = 1;
>>>>>>> master
                        }
                    }
                }
                const background = async (url) => {
                    this.oldColorBackgroundVisible = Boolean(`${this.colorBackgroundVisible}`)
                    this.colorBackgroundVisible = false
                    let element = document.getElementsByClassName('colorBackground')[0]
                    element.style.opacity = 0;
<<<<<<< HEAD
                    new SplitImage({
=======
                    let splitImage = new SplitImage({
>>>>>>> master
                        row: 2,
                        col: 2,
                        base64: url
                    })
                }
                background(albumCover)
            } else {
                document.getElementById('colorBackgroundChangeSwitch').disabled = true;
                ElMessage.error(`专辑获取错误！错误码：${album.status}`)
            }

            let dom = document.getElementById('music');
            dom.onplay = () => {
                this.animationPlayState = true
                // 全屏
                if (document.documentElement.RequestFullScreen) {
                    document.documentElement.RequestFullScreen();
                }
                if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                }
                if (document.documentElement.webkitRequestFullScreen) {
                    document.documentElement.webkitRequestFullScreen();
                }
                if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
            }
            dom.onpause = () => {
                this.animationPlayState = false
                // 取消全屏
                if (document.exitFullScreen) {
                    document.exitFullscreen()
                }
                //火狐
                if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen()
                }
                //谷歌
                if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen()
                }
                //IE
                if (document.msExitFullscreen) {
                    document.msExitFullscreen()
                }
            }
            document.querySelector('title').innerText = `${row.name} - 字幕`
            this.play = true;
            let element = document.getElementsByClassName('play')[0]
            let element1 = document.getElementsByClassName('search')[0]
            element.style.display = 'flex';
            setTimeout(() => {
                element.style.opacity = 1;
                element1.style.display = 'none';
            }, 1)
<<<<<<< HEAD
            this.loading = false;
=======
>>>>>>> master
        },
        setMusicTime() {
            this.musicTime = document.getElementById('music').currentTime;
        },
        isThisLyric(index) {
            const lyricTime = this.parsedLyric[index].time;
            const musicTime = this.musicTime
            // 求出下一句时间 解决群青问题
            let i = 1;
            let nextTime = 0;
            while (nextTime <= lyricTime && index !== this.parsedLyric.length - 1 && (index + i) <= this.parsedLyric.length - 1) {
                nextTime = this.parsedLyric[index + i].time
                i++
            }
            if (musicTime >= lyricTime && (index === this.parsedLyric.length - 1 || musicTime < nextTime)) {
                return 1;
            }
            return 0
        },
        back() {
            document.getElementById('music').pause();
            this.play = false;
            let element = document.getElementsByClassName('play')[0]
            let element1 = document.getElementsByClassName('search')[0]
            element1.style.display = 'block';
            element.style.opacity = 0;
            setTimeout(() => {
                element.style.display = 'none';
            }, 500)
            document.querySelector('title').innerText = '字幕'
        },
        async pinyinChange(val) {
            if (JSON.stringify(this.pinyinLyric[val]) == '[]' && val !== 'none') {
                const data = await api(`pinyin/${val}`, { lyric: this.parsedLyric })
                this.pinyinLyric[val] = data
            }
        },
        tableRowClassName({ row }) {
<<<<<<< HEAD
            if ((row.fee === 0 || row.fee === 8) && row.noCopyrightRcmd === 1) {
=======
            if ((row.fee === 0 || row.fee === 8)&&row.noCopyrightRcmd===1) {
>>>>>>> master
                return 'freeMusic'
            } else {
                return 'vipMusic'
            }
        },
        backgorundChange(val) {
            let element = document.getElementsByClassName('colorBackground')[0]
            if (val) {
                element.style.display = 'block';
<<<<<<< HEAD
                setTimeout(() => {
                    element.style.opacity = 1;
                }, 1)
=======
                setTimeout(()=>{
                    element.style.opacity = 1;
                },1)
>>>>>>> master
            } else {
                element.style.opacity = 0;
                setTimeout(() => {
                    element.style.display = 'none';
                }, 500);
            }
        }
    },
    computed: {
        singers() {
            let out = [];
            const singers = this.searchData
            singers.forEach((song, songIndex) => {
                song.artists.forEach((singer, singerIndex, arr) => {
                    if (out[songIndex] === undefined) {
                        out[songIndex] = ''
                    }
                    out[songIndex] += singerIndex == arr.length - 1 ? singer.name : singer.name + "、"
                })
            })
            return out
        },
        parseLyric() {
            const parseLyricLine = line => {
                const lyricExp = /^\[(\d*):(\d*).(\d*)\](.*)/;
                let result;
                if ((result = line.match(lyricExp)) !== null) {
                    return {
                        //转换时间和audio.currentTime相同
                        time: +result[1] * 60 + +result[2] + +result[3] / 1000,
                        lyric: result[4].trim()
                    }
                }
            }
            const lyric = this.lyric;
            const lrcObj = lyric.split("\n").filter(value => {
                // 1.通过回车去分割歌词每一行,遍历数组，去除空行空格
                return value.trim() !== ''
            }).map(value => {
                // 2.解析歌词
                return parseLyricLine(value.trim());
            })
            return lrcObj;
        },
    },
    created() {
        let that = this
<<<<<<< HEAD
        const change = () => {
=======
        const change = ()=>{
>>>>>>> master
            that.screenWidth = document.body.clientWidth;
            that.screenHeight = document.body.clientHeight;
            that.colorImageSize[0] = Math.max(that.screenHeight, that.screenWidth) / 2
            that.colorImageSize[1] = that.colorImageSize[0] * Math.sqrt(2)
            const margin = -((that.colorImageSize[1] - that.colorImageSize[0]) / 2);
            that.colorBackgroundImage = [{
                left: margin,
                top: margin
            },
            {
                left: margin + that.colorImageSize[0],
                top: margin
            },
            {
                left: margin,
                top: margin + that.colorImageSize[0]
            },
            {
                left: margin + that.colorImageSize[0],
                top: margin + that.colorImageSize[0]
            }]
        }
        change()
        window.onresize = () => {
            return change()
        };
    }
}
</script>
<template>
    <div class="search">
        <div>
            <img src="/icon/icon.svg" alt="图标" class="searchIcon">
        </div>
        <div class="searchInputGroup">
            <el-input class="searchInput" size="large" v-model="searchInput" placeholder="请输入歌名" clearable
                @keyup.enter.native="search" />
            <el-button size="large" @click="search">搜索</el-button>
        </div>
        <div class="searchData" v-if="searchTableShow">
<<<<<<< HEAD
            <el-table v-loading="loading" class="searchDataTable" :data="searchData" @row-click="subtitle"
                empty-text="无歌曲" stripe :row-class-name="tableRowClassName">
=======
            <el-table class="searchDataTable" :data="searchData" @row-click="subtitle" empty-text="无歌曲" stripe
                :row-class-name="tableRowClassName">
>>>>>>> master
                <el-table-column prop="name" label="歌名" />
                <el-table-column label="歌手">
                    <template #default="scope">
                        {{ singers[scope.$index] }}
                    </template>
                </el-table-column>
                <el-table-column prop="album.name" label="专辑" />
            </el-table>
        </div>
        <footer>
            <p class="footerP">高晟捷，版权所有</p>
            <p class="footerP">
                <el-link href="https://beian.miit.gov.cn/" target="_blank">鲁ICP备2022004418号-2</el-link>
            </p>
            <p class="footerP gonganFooterP">
                <el-link class="gongan f16" target="_blank"
                    href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028102001219">
                    <img src="https://gaoshengjie.cn/images/ghs.png" width="20" height="20" alt="公安徽标">
                    <span>鲁公网安备 37028102001219号</span>
                </el-link>
            </p>
            <p class="footerP">
                <el-link href="https://www.12377.cn/" target="_blank">中国互联网违法和不良信息举报中心</el-link>
            </p>
            <p class="footerP">
                来自青岛，用<span style="color:red;">♥</span>制作
            </p>
            <p class="footerP fontHint">
                <el-link href="https://source.typekit.com/source-han-serif/cn/" target="_blank"
                    style="font-family: SourceHanSerifCN-Heavy;">字体使用：思源宋体 CN Heavy</el-link>
            </p>
        </footer>
    </div>
<<<<<<< HEAD
    <div class="play">
        <div class="blackBackground background">
        </div>
        <div class="colorBackground background">
=======
    <div class="play" style="transition: opacity .5s;display:none;opacity:0;z-index:20;">
        <div class="blackBackground background">
        </div>
        <div class="colorBackground background" :style="`transition: opacity .5s;z-index:20;`">
>>>>>>> master
            <div class="colorBackgroundContainer">
                <canvas class="colorBackgroundImage" v-for="(e, i) in [0, 0, 0, 0]" :id="`colorBackgroundImage${i}`"
                    :style="`
                    width:${colorImageSize[1]}px;
<<<<<<< HEAD
                    height:${colorImageSize[1]}px;
=======
                    aspect-ratio:1/1;
>>>>>>> master
                    left:${colorBackgroundImage[i].left}px;
                    top:${colorBackgroundImage[i].top}px;
                    animation-play-state:${animationPlayState ? 'running' : 'paused'}
                    `"></canvas>
            </div>
        </div>

        <div class="lyricList">
            <span v-for="(item, index) in pinyin === 'none' ? parsedLyric : pinyinLyric[pinyin]"
                v-show="isThisLyric(index)" v-html="item.lyric"></span>
        </div>
        <div class="playFooter">
            <el-button size="large" round @click="back">返回</el-button>
            <audio id="music" :src="songURL" controls preload="auto" :ontimeupdate="setMusicTime" />
            <el-dropdown placement="top" trigger="click" class="settings">
                <span class="el-dropdown-link">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                        style="color:rgb(84 84 84);width:30px;height:30px">
                        <path fill="currentColor"
                            d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z">
                        </path>
                    </svg>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
<<<<<<< HEAD
                            <el-switch id="colorBackgroundChangeSwitch" v-model="colorBackgroundVisible" size="large"
                                active-text="彩色背景" inactive-text="黑色背景" style="width:100%" @change="backgorundChange" />
=======
                            <el-switch v-model="colorBackgroundVisible" size="large" active-text="彩色背景"
                                inactive-text="黑色背景" style="width:100%" @change="backgorundChange" />
>>>>>>> master
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <el-select v-model="pinyin" class="m-2" placeholder="注音" size="large"
                                @change="pinyinChange">
                                <el-option v-for="item in pinyinOptions" :key="item.value" :label="item.label"
                                    :value="item.value" :disabled="item.disabled" />
                            </el-select>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>
<style>
<<<<<<< HEAD
.f16{font-size: 16px;}

.gonganFooterP {
    display: flex;
    justify-content: center;
}

.gongan {
    display: flex;
    align-items: center;
}

=======
>>>>>>> master
.freeMusic {
    cursor: pointer;
}

.vipMusic {
    cursor: not-allowed;
    text-decoration: line-through;
    color: #ababab;
}

ruby>rt {
    text-align: center;
    font-size: 3vw;
}

.settings {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}

footer {
    margin-top: 1vw;
}

.footerP {
    margin: 0;
    color: var(--el-text-color-regular);
}

.footerP > .el-link {
    font-size: 16px;
}

.playFooter {
    position: absolute;
    bottom: 1vw;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2vw;
    z-index: 20;
}

.playFooter>.el-select>.select-trigger>.el-input>.el-input__wrapper {
    width: 182px;
    border-radius: 15px;
}

.lyricList {
    padding: 2vw;
    font-family: SourceHanSerifCN-Heavy;
    font-weight: 600;
    color: white;
    z-index: 20;
<<<<<<< HEAD
    font-size: 8vw;
=======
>>>>>>> master
}

.lyricList>span {
    text-align: left;
}

.blackBackground {
    background-color: black;
}

.background {
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    position: absolute;
    top: 0;
    left: 0;
}

.colorBackgroundImage {
    position: absolute;
    transition: linear;
    animation: rotate 100s infinite linear;
    z-index: 20;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.colorBackgroundContainer {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    position: relative;

    filter: blur(90px) brightness(85%) saturate(120%);
    -webkit-filter: blur(90px) brightness(85%) saturate(120%);
    -moz-filter: blur(90px) brightness(85%) saturate(120%);
    -ms-filter: blur(90px) brightness(85%) saturate(120%);
    -o-filter: blur(90px) brightness(85%) saturate(120%);

    transform: scale(120%);
}

.colorBackground {
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    overflow: hidden;
    transition: opacity .5s ease;
}

.play {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    right: 0;
    color: white;
    line-height: 8vw;
    transition: opacity .5s ease;
    opacity: 0;
    z-index: 20;
}

.searchDataTable {
    width: 100%;
    margin-top: 1vw;
}

.searchIcon {
    height: 13vw;
    min-height: 90px;
    width: 13vw;
    min-width: 90px;
}

.searchInputGroup {
    display: flex;
}

.searchInput {
    width: 40vw;
}

.search {
    z-index: 1;
}

body {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

body::-webkit-scrollbar {
    display: none;
}

.search {
    z-index: 1;
}

body {
    scrollbar-width: none;
    /* firefox */
    -ms-overflow-style: none;
    /* IE 10+ */
}

body::-webkit-scrollbar {
    display: none;
}
</style>