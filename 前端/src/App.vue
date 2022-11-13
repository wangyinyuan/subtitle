<script>
async function api(name, parm) {
    let out = {};
    await fetch('http://localhost:3000/api/' + name, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(parm)
    }).then(response => response.json()).then(data => {
        out = data
    })
    return out;
}

export default {
    data() {
        return {
            searchData: [],
            lyric: '',
            parsedLyric: [],
            songURL: '',
            searchInput: undefined,
            play: 0,
            musicTime: 0
        }
    },
    methods: {
        async search() {
            let data = await api('search', { keywords: this.searchInput })
            if (data.status === 200) {
                this.searchData = data.body.result.songs
            }
        },
        async subtitle(row) {
            let lyric = await api('lyric', { id: row.id })
            if (lyric.status === 200) {
                this.lyric = lyric.body.lrc.lyric;
                this.parsedLyric = this.parseLyric;
            }
            let songURL = await api('songURL', { id: row.id })
            if (songURL.status === 200) {
                let url = songURL.body.data[0].url.split(':')
                url[0]+='s';
                this.songURL = url.join(':')
            }
            this.play = 1;
            let dom = document.getElementById('music');
            dom.onplay = function () {
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
            dom.onpause = function () {
                if (document.exitFullScreen) {
                    document.exitFullscreen()
                }
                //兼容火狐
                if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen()
                }
                //兼容谷歌等
                if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen()
                }
                //兼容IE
                if (document.msExitFullscreen) {
                    document.msExitFullscreen()
                }
            }
        },
        setMusicTime() {
            let dom = document.getElementById('music');
            this.musicTime = dom.currentTime;
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
        back(){
            this.play = 0;
            let dom = document.getElementById('music');
            dom.pause();
        }
    },
    computed: {
        singers() {
            let out = [];
            let singers = this.searchData
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
                const lyricExp = /^\[(\d*):(\d*).(\d*)\](.*)/
                let result;
                if ((result = line.match(lyricExp)) !== null) {
                    return {
                        data: {
                            time: +result[1] * 60 + +result[2] + +result[3] / 1000,
                            lyric: result[4].trim()
                        }
                    }
                }
            }
            let lyric = this.lyric

            const lrcObj = []
            const lrcArr = lyric.split("\n").filter(value => {
                // 1.通过回车去分割歌词每一行,遍历数组，去除空行空格
                return value.trim() !== ''
            }).map(value => {
                // 2.解析歌词
                const line = parseLyricLine(value.trim())
                lrcObj.push(line.data)
                return value.trim();
            })
            return lrcObj;
        }
    }
}
</script>
<template>
    <div class="search" v-show="!play">
        <div class="searchIcon">
            <img src="/icon.svg" alt="图标" class="searchIcon">
        </div>
        <div class="searchInputGroup">
            <el-input class="searchInput" size="large" v-model="searchInput" placeholder="请输入歌名" clearable @keyup.enter.native="search" />
            <el-button size="large" @click="search">搜索</el-button>
        </div>
        <div class="searchData" v-if="searchData.length">
            <el-table class="searchDataTable" :data="searchData" @row-click="subtitle" stripe>
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
                <a href="https://beian.miit.gov.cn/" target="_blank">鲁ICP备2022004418号-1</a>
            </p>
            <p class="footerP">
                <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=37028102001214"
                    style="display:inline-block">
                    <img style="vertical-align:middle" src="https://gaoshengjie.cn/images/ghs.png" alt="">
                    <span style="vertical-align:middle">鲁公网安备 37028102001214号</span>
                </a>
            </p>
        </footer>
    </div>
    <div class="play" v-show="play">
        <div class="lyricList">
            <span v-for="(item, index) in parsedLyric" v-show="isThisLyric(index)" style="font-family:'宋体'">{{ item.lyric }}</span>
        </div>
        <div class="playFooter">
            <el-button size="large" round @click="back" style="font-family:'黑体'">返回</el-button>
            <div style="width:2vw"></div>
            <audio id="music" :src="songURL" controls preload="auto" :ontimeupdate="setMusicTime" />
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

.playFooter {
    position: absolute;
    bottom: 1vw;
    display: flex;
    align-items: center;
}

.lyricList {
    padding: 2vw;
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
    background-color: black;
    font-size: 8vw;
    color: white;
    line-height: 8vw;
    text-align: left;
    transition: .3s ease-in-out;
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
}

.searchInputGroup {
    display: flex;
}

.searchInput {
    width: 40vw;
}
</style>