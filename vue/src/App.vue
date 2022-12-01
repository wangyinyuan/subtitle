<script>
console.log('望中考顺利！\n\n高晟捷，\n2022年11月5日留。')
async function api(name, parm) {
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
            lyric: '',
            parsedLyric: [],
            songURL: '',
            searchInput: undefined,
            play: 0,
            musicTime: 0,
            colorBackgroundVisible: 0,
            animationPlayState: 0,
            images: [],
            colorImageSize: [],
            colorBackgroundImage: []
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
            }
        },
        async subtitle(row) {
            const promiseAlbum = api('album', { id: row.album.id });
            const promiseLyric = api('lyric', { id: row.id })
            const promiseSongURL = api('songURL', { id: row.id })
            const [lyric, songURL, album] = await Promise.all([promiseLyric, promiseSongURL, promiseAlbum])

            if (songURL.status === 200 && lyric.status === 200 && album.status === 200) {
                this.lyric = lyric.body.lrc.lyric;
                this.parsedLyric = this.parseLyric;
                this.songURL = songURL.body.data[0].url.split(':').join('s:')
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
                        this.init()
                    }
                    init() {
                        this.canvas = document.createElement('canvas')
                        this.ctx = this.canvas.getContext('2d')
                        this.createImg(this.options.base64)
                    }
                    createImg(base64) { // 加载图片
                        return new Promise((resolve, reject) => {
                            const img = new Image()
                            img.src = base64
                            img.onload = () => {
                                this.img = img
                                this.splitImg()
                                resolve()
                            }
                            img.onerror = (e) => {
                                console.log(e)
                                reject(e)
                            }
                        })
                    }
                    drawImg(options) { // 绘制图片
                        this.canvas.width = this.simpleWidth
                        this.canvas.height = this.simpleHeight
                        this.ctx.drawImage(this.img, options.x, options.y, this.simpleWidth, this.simpleHeight, 0, 0, this.simpleWidth, this.simpleHeight)
                        const base64 = this.canvas.toDataURL()
                        that.images.push(base64)
                    }

                    splitImg() {
                        this.simpleWidth = parseInt(this.img.width / this.options.col)
                        this.simpleHeight = parseInt(this.img.height / this.options.row)
                        that.images=[]
                        for (let y = 0; y < this.options.row; y++) {
                            for (let x = 0; x < this.options.col; x++) {
                                this.drawImg({
                                    x: x * this.simpleWidth,
                                    y: y * this.simpleHeight,
                                })
                            }
                        }
                    }
                }

                const background = async (url) => {
                    const img = new Image();
                    img.src = url;
                    img.setAttribute("crossOrigin", 'Anonymous')
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const base64 = canvas.toDataURL('image/jpeg');
                        let splitImage = new SplitImage({
                            row: 2,
                            col: 2,
                            base64
                        })
                    }
                }

                background(albumCover)
            }
            let dom = document.getElementById('music');
            dom.onplay = () => {
                this.animationPlayState = 1
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
                this.animationPlayState = 0
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
            this.play = 1;
        },
        setMusicTime() {
            this.musicTime = document.getElementById('music').currentTime;
        },
        isThisLyric(index) {
            let out = false
            if (index + 1 <= this.parsedLyric.length - 1) {
                out = this.parsedLyric[index].time <= this.musicTime && this.parsedLyric[index + 1].time > this.musicTime
            } else {
                out = this.parsedLyric[index].time <= this.musicTime
            }
            return out
        },
        back() {
            document.getElementById('music').pause();
            this.play = 0;
            document.querySelector('title').innerText = '字幕'
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
            function parseLyricLine(line) {
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

            const lrcObj = [];
            const lrcArr = lyric.split("\n").filter(value => {
                // 1.通过回车去分割歌词每一行,遍历数组，去除空行空格
                return value.trim() !== ''
            }).map(value => {
                // 2.解析歌词
                const line = parseLyricLine(value.trim());
                lrcObj.push(line);
                return value.trim();
            })
            return lrcObj;
        },
    },
    created() {
        let that = this
        function change() {
            that.screenWidth = document.body.clientWidth;
            that.screenHeight = document.body.clientHeight;
            that.colorImageSize[0] = Math.max(that.screenHeight, that.screenWidth) / 2
            that.colorImageSize[1] = that.colorImageSize[0] * Math.sqrt(2)
            that.colorBackgroundImage = [{
                left: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2),
                top: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2)
            },
            {
                left: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2) + that.colorImageSize[0],
                top: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2)
            },
            {
                left: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2),
                top: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2) + that.colorImageSize[0]
            },
            {
                left: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2) + that.colorImageSize[0],
                top: -((that.colorImageSize[1] - that.colorImageSize[0]) / 2) + that.colorImageSize[0]
            }]
        }
        change()
        window.onresize = () => {
            return (() => {
                change()
            })()
        };
    }
}
</script>
<template>
    <div class="search" v-show="!play">
        <div>
            <img src="/icon/icon.svg" alt="图标" class="searchIcon">
        </div>
        <div class="searchInputGroup">
            <el-input class="searchInput" size="large" v-model="searchInput" placeholder="请输入歌名" clearable
                @keyup.enter.native="search" />
            <el-button size="large" @click="search">搜索</el-button>
        </div>
        <div class="searchData" v-if="searchTableShow">
            <el-table class="searchDataTable" :data="searchData" @row-click="subtitle" empty-text="无歌曲" stripe>
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
            <p class="footerP">
                <img style="vertical-align:middle" src="https://gaoshengjie.cn/images/ghs.png" width="20" height="20"
                    alt="公安徽标">
                <el-link target="_blank"
                    href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028102001219">
                    <span style="vertical-align:middle">鲁公网安备 37028102001219号</span>
                </el-link>
            </p>
            <p class="footerP">
                <el-link href="https://www.12377.cn/" target="_blank">中国互联网违法和不良信息举报中心</el-link>
            </p>
            <p class="footerP">
                来自青岛，用<span style="color:red;">♥</span>制作
            </p>
            <p class="footerP fontHint">字体使用 方正清刻本悦宋</p>
        </footer>
    </div>
    <div class="play" v-show="play">
        <div class="colorBackground background" v-show="colorBackgroundVisible">
            <div class="colorBackgroundContainer">
                <img class="colorBackgroundImage" v-for="(e, i) in images" :src="e" :style="`
                width:${colorImageSize[1]}px;
                aspect-ratio:1/1;
                left:${colorBackgroundImage[i].left}px;
                top:${colorBackgroundImage[i].top}px;
                animation-play-state:${animationPlayState ? 'running' : 'paused'}
                `" />
            </div>
        </div>
        <div class="blackBackground background" v-show="!colorBackgroundVisible"></div>

        <div class="lyricList">
            <span v-for="(item, index) in parsedLyric" v-show="isThisLyric(index)">{{ item.lyric }}</span>
        </div>
        <div class="playFooter">
            <el-button size="large" round @click="back">返回</el-button>
            <audio id="music" :src="songURL" controls preload="auto" :ontimeupdate="setMusicTime" />
            <el-switch class="colorSwitch" v-model="colorBackgroundVisible" size="large" active-text="彩色背景"
                inactive-text="黑色背景" />
        </div>
    </div>
</template>
<style>
footer {
    margin-top: 1vw;
}

.footerP {
    margin: 0;
}

.fontHint {
    font-family: fangzhengsong;
    font-weight: inherit;
}

.playFooter {
    position: absolute;
    bottom: 1vw;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2vw;
}

.colorSwitch {
    background-color: white;
    border-radius: 15px;
    padding-right: 15px;
    padding-left: 15px;
}

.lyricList {
    font-size: 8vw;
    padding: 2vw;
    font-family: fangzhengsong;
    font-weight: 800;
    color: white;
    z-index:0;
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
    filter: blur(90px);
    transform: scale(100%);
}

.colorBackground {
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    overflow: hidden;
}

.play {
    display: flex;
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
}

.searchDataTable {
    width: 100%;
    margin-top: 1vw;
}

.el-table__row {
    cursor: pointer;
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
</style>