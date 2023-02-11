<script>
import musicPlayer from './components/musicPlayer.vue'
import copy from 'copy-to-clipboard'
console.log('愿中考顺利！\n\n高晟捷，\n2022年11月5日留。')
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

// karaoke音频处理
let processor,
    filterLowPass,
    filterHighPass,
    mix,
    mix2;

export default {
    components: {
        musicPlayer
    },
    data() {
        return {
            searchData: [],
            searchDataCache: {},
            searchTableShow: 0,
            lyric: [],
            parsedLyric: [],
            searchInput: undefined,
            play: false,
            musicTime: 0,
            colorBackgroundVisible: true,
            oldColorBackgroundVisible: true,
            animationPlayState: false,
            loading: false,
            colorImageSize: [],
            colorBackgroundImage: [],
            pinyinOptions: [
                {
                    value: 'none',
                    label: '不注音'
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
                {
                    value: 'korean',
                    label: '韩语(罗马字)'
                }
            ],
            pinyinLyric: {
                mandarin: [],
                cantonese: [],
                jpRoma: [],
                jpHiragana: [],
                korean: []
            },
            pinyin: 'none',
            rhythm: false,
            mp_song: {},
            shareLink: '',
            pageNum: 1,
            hasMoreSongs: true,
            zishaDialogVisible: false,
            lyricOffset: 0,
            preloadLyric: '',
            karaoke: false,
            lyricAnimation: true,
            showNextLyric: true,
            loop: false
        }
    },
    methods: {
        async search(pageChange) {
            let PageNum = this.pageNum
            if (pageChange) {
                PageNum += pageChange === 'last' ? (-1) : 1
            } else {
                PageNum = 1
            }
            if (this.searchInput) {
                if (this.searchInput === '自杀') {
                    this.zishaDialogVisible = true
                } else {
                    let data;
                    if (this.searchDataCache[this.searchInput] && this.searchDataCache[this.searchInput][PageNum]) {
                        data = this.searchDataCache[this.searchInput][PageNum]
                    } else {
                        // 缓存请求数据
                        data = await api('search', { keywords: this.searchInput, pageNum: PageNum });
                        if (data.status === 200) {
                            if (this.searchDataCache[this.searchInput] === undefined) {
                                this.searchDataCache[this.searchInput] = []
                            }
                            this.searchDataCache[this.searchInput][PageNum] = data
                        }
                    }

                    if (data.status === 200) {
                        this.searchTableShow = 1;
                        this.searchData = data.body.result.songs || [];
                        this.loading = false;
                        this.hasMoreSongs = data.body.result.hasMore
                        this.pageNum = PageNum
                    }
                }
            } else {
                this.searchTableShow = false;
            }
        },
        async rhythmBackground() {
            let start = 0
            // 背景跃动效果
            const animate = (height, time) => {
                let now = new Date()
                if (now - start > time) {
                    document.querySelector('.colorBackgroundContainer').style.transform = `scale(${0.003 * height + 1.2})`
                    start = now
                }
            }
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();

            let audioSource = audioContext.createMediaElementSource(document.getElementById('music'));
            let analyser = audioContext.createAnalyser();
            audioSource.connect(analyser);

            filterLowPass = audioContext.createBiquadFilter();
            audioSource.connect(filterLowPass);

            filterLowPass.type = 'lowpass';
            filterLowPass.frequency.value = 120;

            // create high-pass filter
            filterHighPass = audioContext.createBiquadFilter();
            audioSource.connect(filterHighPass);
            filterHighPass.type = 'highpass';
            filterHighPass.frequency.value = 120;

            // create the gain node
            mix = audioContext.createGain();

            mix2 = audioContext.createGain();
            audioSource.connect(mix2);
            mix2.connect(audioContext.destination);

            mix.gain.value = this.karaoke ? 1 : 0;
            mix2.gain.value = this.karaoke ? 0 : 1;

            // create the processor

            processor = audioContext.createScriptProcessor(2048 /*bufferSize*/, 2 /*num inputs*/, 1 /*num outputs*/);

            // connect everything
            filterHighPass.connect(processor);
            filterLowPass.connect(mix);
            processor.connect(mix);
            mix.connect(audioContext.destination);

            const karaoke = (evt) => {
                let inputL = evt.inputBuffer.getChannelData(0),
                    inputR = evt.inputBuffer.getChannelData(1),
                    output = evt.outputBuffer.getChannelData(0),
                    len = inputL.length,
                    i = 0
                for (; i < len; i++) {
                    output[i] = inputL[i] - inputR[i];
                }
            }

            // connect with the karaoke filter
            processor.onaudioprocess = karaoke;

            await audioContext.resume();
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            let barHeight, all;
            const draw = () => {
                all = 0
                analyser.getByteFrequencyData(dataArray);
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];
                    all += barHeight
                }
                animate(all / bufferLength, 410)
                if (!this.rhythm) {
                    audioContext.close()
                    return;
                }
                requestAnimationFrame(draw);
            }
            draw();
        },
        karaokeSwitch(value) {
            if (mix2 && mix) {
                mix2.gain.value = value ? 0 : 1;
                mix.gain.value = value ? 1 : 0;
            }
        },
        async subtitle(r, id, flag) {
            let row = r;
            if (flag === 1) {
                row = await api('detail', { id })
            }
            this.mp_song.name = row.name
            // 若不能播放
            if ((row.fee === 1 || row.fee === 4) && row.noCopyrightRcmd === 1) {
                return;
            }
            this.lyricOffset = this.showedLyricNum = 0
            this.loading = true

            this.pinyinLyric = {
                mandarin: [],
                cantonese: [],
                jpRoma: [],
                jpHiragana: [],
                korean: []
            }
            this.pinyin = 'none'
            this.shareLink = ''
            this.animationPlayState = false

            const promiseLyric = api('lyric', { id: row.id })
            const promiseSongURL = api('songURL', { id: row.id })
            const [lyric, songURL] = await Promise.all([promiseLyric, promiseSongURL])

            if (songURL.status === 200) {
                const url = songURL.body.data[0].url.split(':').join('s:')
                this.mp_song.src = url
                const plyContainer = document.getElementById('musicPlayerContainer')
                plyContainer.innerHTML = `<audio id="music" preload="auto" src="${url}" crossorigin="anonymous" />`
                document.querySelector('.musicPlayer_buttons').onclick = () => {
                    // 如果正在播放
                    if (!this.rhythm) {
                        this.rhythmBackground()
                        this.rhythm = true
                    }
                }
            } else {
                this.loading = false;
                ElMessage.error(`音乐获取失败！错误码：${songURL.status}`)
                return;
            }
            if (lyric.status === 200) {
                this.lyric = lyric.body.lrc.lyric;
                this.parsedLyric = this.parseLyric;
                // 解决Safari下注音不贴字的问题
                if (navigator.vendor === "Apple Computer, Inc.") {
                    // 是Apple系
                    document.querySelector('.lyricList').classList.add('safariLyricList')
                }
            } else {
                this.loading = false;
                ElMessage.error(`歌词获取失败！错误码：${lyric.status}`);
                return;
            }
            //专辑封面处理start
            let albumCover = row.albumCover;
            this.mp_song.cover = albumCover
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
                        let element = document.querySelector('.colorBackground')
                        element.style.display = 'auto';
                        setTimeout(() => {
                            element.style.opacity = 1;
                        }, 0)
                    }
                }
            }
            const background = async url => {
                let element = document.querySelector('.colorBackground')
                element.style.opacity = 0;
                new SplitImage({
                    row: 2,
                    col: 2,
                    base64: url
                })
            }
            this.oldColorBackgroundVisible = (`${this.colorBackgroundVisible}` === 'true')
            this.colorBackgroundVisible = false
            background(albumCover)
            // 专辑封面处理end
            document.querySelector('title').innerText = `${row.name} - 字幕`
            this.play = true;
            let element = document.querySelector('.play')
            let element1 = document.querySelector('.search')
            element.style.display = 'flex';
            setTimeout(() => {
                element.style.opacity = 1;
                element1.style.display = 'none';
            })
            history.pushState('', '', `${window.location.origin}/?play=${row.id}`);
            this.loading = false;
        },
        isThisLyric(index) {
            const lyricTime = this.parsedLyric[index].time
            const musicTime = this.musicTime + this.lyricOffset
            const thisLyricDom = document.getElementById(`lyricDom-${index}`)
            const showThisLyric = () => {
                thisLyricDom.style.transform = 'translateY(50%) scale(1)'
                thisLyricDom.style.bottom = '50%'
                thisLyricDom.style.color = '#fff'
                thisLyricDom.style.opacity = '1'
                thisLyricDom.style.display = 'inline'
            }
            // 是最后一句歌词
            if (musicTime >= lyricTime && index === this.parsedLyric.length - 1 && thisLyricDom !== null) {
                setTimeout(() => {
                    showThisLyric()
                }, 0)
                return true;
            }
            const nextLyricDom = document.getElementById(`lyricDom-${index + 1}`)
            // 到达当前歌词且当前歌词不是最后一句
            if (musicTime >= lyricTime && musicTime < this.parsedLyric[index + 1].time && thisLyricDom !== null && nextLyricDom !== null) {
                setTimeout(() => {
                    showThisLyric()

                    nextLyricDom.style.bottom = '130px'
                    nextLyricDom.style.transform = 'scale(.3)'
                    nextLyricDom.style.color = '#b1b1b1'
                    nextLyricDom.style.opacity = this.showNextLyric ? '1' : '0'
                }, 0)
                const thirdLyricObj = this.parsedLyric[index + 2]
                const fourthLyricObj = this.parsedLyric[index + 3]
                let preloadLyricTemp = ''
                if (thirdLyricObj !== undefined) {
                    preloadLyricTemp += thirdLyricObj.lyric
                }
                if (fourthLyricObj !== undefined) {
                    preloadLyricTemp += fourthLyricObj.lyric
                }
                if (preloadLyricTemp !== this.preloadLyric) {
                    this.preloadLyric = preloadLyricTemp
                }
                return true;
            }
            // 还没到当前歌词
            if (musicTime < lyricTime && thisLyricDom !== null && nextLyricDom !== null) {
                thisLyricDom.style.transform = 'scale(.3)'
                thisLyricDom.style.color = '#b1b1b1'
                nextLyricDom.style.bottom = '-30vw'
                return false;
            }
            if (thisLyricDom !== null && nextLyricDom !== null) {
                setTimeout(() => {
                    thisLyricDom.style.transform = 'translateY(-50%) scale(1)'
                    thisLyricDom.style.bottom = '100vh'
                    thisLyricDom.style.color = '#fff'
                    thisLyricDom.style.opacity = '0'

                    nextLyricDom.style.bottom = '-30vw'
                }, 0)
            }
            return false;
        },
        back() {
            document.getElementById('music').pause();
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
            this.play = false;
            this.rhythm = false
            let element = document.getElementsByClassName('play')[0]
            let element1 = document.getElementsByClassName('search')[0]
            element1.style.display = 'block';
            element.style.opacity = 0;
            setTimeout(() => {
                element.style.display = 'none';
            }, 500)
            history.pushState('', '', window.location.origin)
            document.querySelector('title').innerText = '字幕'
        },
        async pinyinChange(val) {
            if (JSON.stringify(this.pinyinLyric[val]) == '[]' && val !== 'none') {
                const data = await api(`pinyin/${val}`, { lyric: this.parsedLyric })
                this.pinyinLyric[val] = data
            }
        },
        tableRowClassName({ row }) {
            if ((row.fee === 0 || row.fee === 8) && row.noCopyrightRcmd === 1) {
                return 'freeMusic'
            } else {
                return 'vipMusic'
            }
        },
        backgroundChange(val) {
            let element = document.querySelector('.colorBackground')
            val = !val
            this.colorBackgroundVisible = val
            if (val) {
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.opacity = 1;
                })
            } else {
                element.style.opacity = 0;
                setTimeout(() => {
                    element.style.display = 'none';
                }, 500);
            }
        },
        async clipLink() {
            if (this.shareLink === '') {
                await fetch('https://ceek.fun/create', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: window.location.href
                    })
                }).then(response => response.json()).then(data => {
                    if (data.code) {
                        this.shareLink = `https://ceek.fun/${data.url}`
                    } else {
                        ElMessage({
                            message: `复制失败：请求短网址API错误！错误信息：${data.msg}`,
                            type: 'error',
                            duration: 0,
                            showClose: true
                        })
                    }
                });
            }
            copy(this.shareLink)
            ElMessage({
                message: '复制成功！',
                type: 'success'
            })
        },
        loopChange() {
            this.loop = !this.loop
            document.getElementById('music').loop = this.loop
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
                let result = line.match(lyricExp);
                if (result !== null) {
                    return {
                        //转换时间以秒计
                        time: +result[1] * 60 + +result[2] + +result[3] / 1000,
                        lyric: result[4].trim()
                    }
                } else {
                    return {
                        time: 0,
                        lyric: line
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
            lrcObj.sort((a, b) => {
                return a.time - b.time
            })
            return lrcObj;
        },
    },
    created() {
        const getQueryVariable = variable => {
            let query = window.location.search.substring(1);
            let vars = query.split("&");
            for (let i = 0; i < vars.length; i++) {
                let pair = vars[i].split("=");
                if (pair[0] == variable) { return pair[1]; }
            }
            return false;
        }
        let that = this
        const change = () => {
            that.screenWidth = document.body.clientWidth;
            that.screenHeight = document.body.clientHeight;
            that.colorImageSize[0] = Math.max(that.screenHeight, that.screenWidth) / 2
            that.colorImageSize[1] = that.colorImageSize[0] * Math.sqrt(2)
            const margin = -((that.colorImageSize[1] - that.colorImageSize[0]) / 2);
            that.colorBackgroundImage = []
            for (let i = 0; i < 4; i++) {
                const space = i.toString(2).length === 1 ? 0 + i.toString(2) : i.toString(2)
                that.colorBackgroundImage.push({
                    top: margin + (+space[0]) * that.colorImageSize[0],
                    left: margin + (+space[1]) * that.colorImageSize[0]
                })
            }
        }
        change()
        window.onresize = () => {
            return change()
        };
        if (getQueryVariable('play')) {
            this.subtitle(0, getQueryVariable('play'), 1)
        }
    }
}
</script>
<template>
    <el-dialog v-model="zishaDialogVisible" width="30%">
        <h1>
            你并不孤单<br />
            我们在你身后
        </h1>
        <p>
            如果需要帮助，请拨打全国24小时免费心理咨询热线。
        </p>
        <p>
            全国24小时免费心理咨询<br />
            010-82951332
        </p>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="zishaDialogVisible = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
    <div class="search">
        <div>
            <img src="/icon/icon.svg" alt="图标" class="searchIcon">
        </div>
        <div class="searchInputGroup">
            <el-input class="searchInput" size="large" v-model="searchInput" placeholder="请输入歌名" clearable
                @keyup.enter.native="search(false)" />
            <el-button size="large" @click="search(false)">搜索</el-button>
        </div>
        <div class="searchData" v-if="searchTableShow">
            <el-table v-loading="loading" class="searchDataTable" :data="searchData" @row-click="subtitle"
                empty-text="无歌曲" stripe :row-class-name="tableRowClassName">
                <el-table-column prop="name" label="歌名" />
                <el-table-column label="歌手">
                    <template #default="scope">
                        {{ singers[scope.$index] }}
                    </template>
                </el-table-column>
                <el-table-column prop="album.name" label="专辑" />
            </el-table>
            <div class="pagination">
                <el-button type="primary" :disabled="pageNum <= 1" @click="this.search('last')">上一页</el-button>
                <el-button type="primary" :disabled="!hasMoreSongs" @click="this.search('next')">下一页</el-button>
            </div>
        </div>
        <footer>
            <p class="footerP">高晟捷，版权所有。以MIT协议开源 <el-link href="https://github.com/huangguacucumber/subtitle"
                    target="_blank">GitHub</el-link></p>
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
            <p class="footerP" style="display:flex;align-items:center;justify-content: center;">
                <span class="noto-serif-sc">字体使用：</span>
            <ul style="text-align:left;">
                <li>
                    <el-link href="https://fonts.google.com/noto/specimen/Noto+Serif+SC" target="_blank"
                        class="noto-serif-sc">Noto Serif Simplified Chinese</el-link>
                </li>
                <li>
                    <el-link href="https://fonts.google.com/noto/specimen/Noto+Serif+KR" target="_blank"
                        class="noto-serif-kr">Noto Serif Korean</el-link>
                </li>
            </ul>
            </p>
            <p class="footerP">
                来自青岛，用<span style="color:red;">♥</span>制作
            </p>
        </footer>
    </div>
    <div class="play">
        <div class="blackBackground background">
        </div>
        <div class="colorBackground background">
            <div class="colorBackgroundContainer">
                <canvas class="colorBackgroundImage" v-for="(e, i) in [0, 1, 2, 3]" :id="`colorBackgroundImage${i}`"
                    :style="`
                    width:${colorImageSize[1]}px;
                    height:${colorImageSize[1]}px;
                    left:${colorBackgroundImage[i].left}px;
                    top:${colorBackgroundImage[i].top}px;
                    animation-play-state:${animationPlayState ? 'running' : 'paused'}
                    `"></canvas>
            </div>
        </div>

        <div class="lyricList">
            <span :class="isThisLyric(index) ? 'lyric' : 'lyric'"
                v-for="(item, index) in pinyin === 'none' ? parsedLyric : pinyinLyric[pinyin]" v-html="item.lyric"
                :id="`lyricDom-${index}`"
                :style="`transition: ${lyricAnimation ? 'all .4s ease-in-out' : 'none'};`"></span><br />
        </div>
        <span class="preloadLyric" v-html="preloadLyric"></span>

        <div class="playFooter">
            <!-- <div id="musicPlayerContainer"></div> -->
            <musicPlayer :song="mp_song">
                <!-- 返回 -->
                <div class="settings" @click="back">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;">
                        <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path>
                        <path fill="currentColor"
                            d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z">
                        </path>
                    </svg>
                </div>
                <!-- 循环 -->
                <div class="settings" @click="loopChange">
                    <!-- 循环 -->
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" v-show="!loop"
                        style="width:20px;height:20px;">
                        <path fill="currentColor"
                            d="M286.95 286.95h450.1v134.61l178.78-178.78L737.05 64v134.61H198.61v269.22h88.34V286.95z m450.1 450.1h-450.1V602.44L108.17 781.22 286.95 960V825.39h538.44V556.17h-88.34v180.88z">
                        </path>
                    </svg>
                    <!-- 不循环 -->
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" v-show="loop"
                        style="width:20px;height:20px;">
                        <path fill="currentColor"
                            d="M759.14 198.61V64l178.78 178.78-178.78 178.78V286.95H391.06l-90.44-88.34h458.52z m0 357.56h88.34v189.3l-88.34-90.44v-98.86zM86.09 209.13l56.79-56.79 750.87 750.87L836.96 960 702.35 825.39H309.03V960L130.25 781.22l178.78-178.78v134.61H611.9L309.03 434.18v33.65H220.7V343.74L86.09 209.13z">
                        </path>
                    </svg>
                </div>
                <el-dropdown placement="top" trigger="click" class="settings">
                    <span class="el-dropdown-link">
                        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                            style="color:rgb(84 84 84);width:20px;height:20px">
                            <path fill="currentColor"
                                d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z">
                            </path>
                        </svg>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>
                                <span>歌词提前显示</span>
                                <div style="width:20px"></div>
                                <el-slider v-model="lyricOffset" :min="-3" :max="3" :step="0.1"
                                    :format-tooltip="v => v + ' 秒'" />
                            </el-dropdown-item>
                            <el-dropdown-item style="display:flex;gap:10px">
                                <el-switch v-model="karaoke" size="large" @change="karaokeSwitch" active-text="消除人声" />
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-switch :value="!colorBackgroundVisible" size="large" active-text="高对比度"
                                    style="width:100%" @change="backgroundChange" />
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-switch v-model="lyricAnimation" size="large" active-text="歌词动画"
                                    style="width:100%" />
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-switch v-model="showNextLyric" size="large" active-text="次句提醒" style="width:100%" />
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-select v-model="pinyin" class="m-2" placeholder="注音" size="large"
                                    @change="pinyinChange">
                                    <el-option v-for="item in pinyinOptions" :key="item.value" :label="item.label"
                                        :value="item.value" :disabled="item.disabled" />
                                </el-select>
                            </el-dropdown-item>
                            <el-dropdown-item>
                                <el-button id="copyLinkButton" type="primary" @click="clipLink">复制链接</el-button>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </musicPlayer>
        </div>
    </div>
</template>
<style>
.noto-serif-sc {
    font-family: 'Noto Serif SC';
}

.noto-serif-kr {
    font-family: 'Noto Serif KR';
}

#musicPlayerContainer {
    align-items: center;
    border-radius: 40px;
}

.f16 {
    font-size: 16px;
}

.gonganFooterP {
    display: flex;
    justify-content: center;
}

.gongan {
    display: flex;
    align-items: center;
}

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
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: 1px solid black;
}

footer {
    margin-top: 1vw;
}

.footerP {
    margin: 0;
    color: var(--el-text-color-regular);
}

.footerP>.el-link {
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

.lyricList,
.preloadLyric {
    padding: 2vw;
    font-family: 'Noto Serif SC', 'Noto Serif KR', serif;
    font-weight: 900;
    color: white;
    z-index: 20;
    -moz-osx-font-smoothing: antialiased;
    -webkit-font-smoothing: antialiased;
    white-space: pre-wrap;
}

.lyric {
    font-size: 8vw;
    line-height: 13vw;
    position: absolute;
    left: 0;
    width: calc(100vw - 40px);
    padding: 20px;
    text-align: center;
    transform-origin: bottom;
    bottom: -30vw;
    transition: all .4s ease-in-out;
    transform: scale(.3);
    color: #b1b1b1;
}

/* Safari注音不贴字问题 */
.safariLyricList>span>ruby>rt {
    transform: translateY(2vw);
}

.preloadLyric {
    font-size: 1px;
    color: rgba(0, 0, 0, 0);
    position: absolute;
    bottom: 0;
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

    filter: blur(90px) brightness(85%) saturate(130%);
    -webkit-filter: blur(90px) brightness(85%) saturate(130%);
    -moz-filter: blur(90px) brightness(85%) saturate(130%);
    -ms-filter: blur(90px) brightness(85%) saturate(130%);
    -o-filter: blur(90px) brightness(85%) saturate(130%);

    transform: scale(1.2);
    transition: all 0.3s ease;
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
    transition: opacity .5s ease;
    opacity: 0;
    z-index: 20;
    overflow: hidden;
}

.searchDataTable {
    width: 100%;
    margin-top: 1vw;
}

.pagination {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
}

.searchIcon {
    height: 13vw;
    min-height: 90px;
    width: 13vw;
    min-width: 90px;
}

.searchInputGroup {
    display: flex;
    justify-content: center;
    width: 100%;
}

.searchInput {
    width: 40vw;
}

.search {
    z-index: 1;
    height: 100%;
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
    -ms-overflow-style: none;
}

body::-webkit-scrollbar {
    display: none;
}
</style>