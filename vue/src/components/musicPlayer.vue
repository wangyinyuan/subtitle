<script>

export default {
    props: {
        song: {
            type: Object,
            default: () => ({
                name: '海阔天空',
                cover: 'https://sdfsdf.dev/300x300.png',
                src: ''// url
            })
        },
        width: {
            type: Number,
            default: () => 400
        },
        height: {
            type: Number,
            default: () => 100
        }
    },
    data: () => {
        return {
            sound: 100,
            progress: 0,
            play: false,
            oldEle: 0
        }
    },
    methods: {
        audioPlay() {
            let dom = document.getElementById('music')
            if (!this.play) {
                dom.play()
                dom.onplay = () => {
                    this.play = true
                    this.$parent.animationPlayState = true
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
                    this.play = false
                    this.$parent.animationPlayState = false
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
                dom.ontimeupdate = () => {
                    this.changeAudioTime()
                    this.progress = parseInt(dom.currentTime / dom.duration * 100)
                    this.$parent.setMusicTime()
                }
            } else {
                dom.pause()
            }
        },
        parseNumber(number) {
            const num = `${number}`
            if (num.length >= 2) return num;
            if (num.length < 2) {
                return `0${num}`
            }
        },
        newtime(time) {
            return `${this.parseNumber(parseInt(time / 60))}:${this.parseNumber(time - parseInt(time / 60) * 60)}`
        },
        async changeAudioTime() {
            let dom = document.getElementById('music')
            if (dom !== this.oldEle) {
                this.progress = 0;
                this.play = false;
                this.oldEle = dom
            }
            const time = `${this.newtime(parseInt(dom.currentTime))}`
            document.getElementById('musicPlayer_time').innerText = time
        },
        async changeTime() {
            let dom = document.getElementById('music')
            dom.currentTime = this.progress / 100 * dom.duration
        },
        changeVolume() {
            let dom = document.getElementById('music')
            dom.volume = this.sound / 100
        },
        mute() {
            this.sound = this.sound ? 0 : 100
            this.changeVolume()
        },
    },
    created() {
        document.documentElement.style.setProperty('--musicPlayer-width', this.width + 'px')
        document.documentElement.style.setProperty('--musicPlayer-height', this.height + 'px')
    }
}
</script>
<template>
    <div class="musicPlayer_container">
        <img class="musicPlayer_cover" :src="this.song.cover" :alt="song.name" />
        <div class="musicPlayer_controller">
            <div class="musicPlayer_nameandSound">
                <span class="musicPlayer_songName">{{ song.name }}</span>
                <div class="musicPlayer_soundIcon" @click="mute">
                    <svg v-show="sound" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="4248" width="20" height="20">
                        <path
                            d="M128 420.576v200.864h149.12l175.456 140.064V284.288l-169.792 136.288H128z m132.256-64l204.288-163.968a32 32 0 0 1 52.032 24.96v610.432a32 32 0 0 1-51.968 24.992l-209.92-167.552H96a32 32 0 0 1-32-32v-264.864a32 32 0 0 1 32-32h164.256zM670.784 720.128a32 32 0 0 1-44.832-45.664 214.08 214.08 0 0 0 64.32-153.312 213.92 213.92 0 0 0-55.776-144.448 32 32 0 1 1 47.36-43.04 277.92 277.92 0 0 1 72.416 187.488 278.08 278.08 0 0 1-83.488 198.976zM822.912 858.88a32 32 0 1 1-45.888-44.608A419.008 419.008 0 0 0 896 521.152c0-108.704-41.376-210.848-114.432-288.384a32 32 0 0 1 46.592-43.872c84.16 89.28 131.84 207.04 131.84 332.256 0 127.84-49.76 247.904-137.088 337.728z"
                            fill="#000000" p-id="4249"></path>
                    </svg>
                    <svg v-show="!sound" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        p-id="4392" width="20" height="20">
                        <path
                            d="M128 420.576v200.864h149.12l175.456 140.064V284.288l-169.792 136.288H128z m132.256-64l204.288-163.968a32 32 0 0 1 52.032 24.96v610.432a32 32 0 0 1-51.968 24.992l-209.92-167.552H96a32 32 0 0 1-32-32v-264.864a32 32 0 0 1 32-32h164.256zM752 458.656L870.4 300.8a32 32 0 1 1 51.2 38.4L792 512l129.6 172.8a32 32 0 0 1-51.2 38.4l-118.4-157.856-118.4 157.856a32 32 0 0 1-51.2-38.4l129.6-172.8-129.6-172.8a32 32 0 0 1 51.2-38.4l118.4 157.856z"
                            fill="#000000" p-id="4393"></path>
                    </svg>
                </div>
                <el-slider class="musicPlayer_soundSlider" v-model="sound" @input="changeVolume" />
            </div>
            <div class="musicPlayer_play">
                <div class="musicPlayer_buttons" @click="audioPlay">
                    <svg class="musicPlayer_button" v-show="!play" viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor"
                            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768zm-48-247.616L668.608 512 464 375.616v272.768zm10.624-342.656 249.472 166.336a48 48 0 0 1 0 79.872L474.624 718.272A48 48 0 0 1 400 678.336V345.6a48 48 0 0 1 74.624-39.936z">
                        </path>
                    </svg>
                    <svg class="musicPlayer_button" v-show="play" viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor"
                            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768zm-96-544q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32zm192 0q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32z">
                        </path>
                    </svg>
                </div>
                <div class="musicPlayer_progress">
                    <el-slider class="musicPlayer_progressSlider" v-model="progress" :show-tooltip="false"
                        @input="changeTime" />
                    <div class="musicPlayer_progressNumber">
                        <span id="musicPlayer_time">0:00</span>
                        <div class="musicPlayer_settings">
                            <slot></slot>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div id="musicPlayerContainer">
            <audio id="music" :src="song.src" preload="auto" @canplay="changeAudioTime"></audio>
        </div>
    </div>
</template>
<style>
:root {
    --musicPlayer-width: 400px;
    --musicPlayer-height: 100px;
}

.musicPlayer_container {
    width: var(--musicPlayer-width);
    height: var(--musicPlayer-height);
    border-radius: 15px;
    background-color: rgba(255, 255, 255, 1);
    position: relative;
    border: 1px solid var(--el-color-primary);
    color: black;
}

.musicPlayer_cover {
    position: absolute;
    width: var(--musicPlayer-height);
    height: var(--musicPlayer-height);
    border-radius: 15px;
    left: calc(var(--musicPlayer-width) / 21);
    bottom: calc(var(--musicPlayer-height) / 6);
    box-shadow: calc(var(--musicPlayer-height) / 10) calc(var(--musicPlayer-height) / 10) calc(var(--musicPlayer-height) / 5) #969696;
}

.musicPlayer_controller {
    width: calc(var(--musicPlayer-width) / 20 * 18 - var(--musicPlayer-height) - 10px - 10px);
    height: 100%;
    margin-top: 5px;
    margin-left: calc(var(--musicPlayer-height) + var(--musicPlayer-width) / 15 + 5px);
    display: flex;
    flex-direction: column;
}

.musicPlayer_nameandSound {
    width: 100%;
    display: flex;
    gap: 10px;
    height: 32px;
}

.musicPlayer_songName {
    min-width: 50%;
    font-family: 微软雅黑;
    font-weight: bold;
    line-height: 32px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.musicPlayer_soundSlider {
    max-width: 50%;
}

.musicPlayer_soundIcon {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.musicPlayer_play {
    width: 100%;
    height: calc(100% - 32px - 5px);
    display: flex;
    gap: 20px;
}

.musicPlayer_progress {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.musicPlayer_buttons {
    width: 30px;
    height: 30px;
    position: relative;
    display: flex;
}

.musicPlayer_button {
    position: absolute;
    left: 0;
    width: 30px;
    cursor: pointer;
    color: rgb(80, 80, 80);
}

.musicPlayer_progressSlider {
    width: 100%;
    margin-top: -2px
}

.musicPlayer_progressNumber {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: normal;
    color: rgb(128, 128, 128);
    margin-top: -10px;
}

#musicPlayer_time {
    color: #4a4a4a;
}

.musicPlayer_settings {
    display:flex;
    gap:5px;
}
</style>