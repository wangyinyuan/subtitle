# 字幕

## 功能

### 显示歌曲歌词
![显示歌曲歌词](https://i.postimg.cc/G3HfgxvM/7e72c7e6e86e5db62a8f2cd834ff3a8.png)
> 海のまにまに——YOASOBI

### 为歌词注音
![为歌词注音](https://i.postimg.cc/8Cpvsst3/d51b36fe87a42cbe1ec7ed6fd505045.png)
> 喜欢你——邓紫棋

### 黑色背景（高对比度）
![黑色背景（高对比度）](https://i.postimg.cc/jjM8ZD20/d7375f667283f6183ad5561a8b7c703.png)
> 群青——YOASOBI

### 音频播放器
![音频播放器](https://i.postimg.cc/65dxzhNk/954e3caeaa6215a2ff9aee60c5a76d5.png)
> 群青——YOASOBI

## 灵感

> 一生之中兜兜转转 哪会看清楚 ——李克勤《红日》

去年元旦晚会的时候我们班是电脑上找歌曲mv播放 歌词只有下面一小行 又小又艺术根本看不清楚

然后看到了这个：

![效果图](https://i.postimg.cc/VkSTCX5J/3e8998e1e211b553d5ff0d7b59a455d.jpg)

> 【[U-87]浮誇-陳奕迅（伴奏）-哔哩哔哩】 https://b23.tv/onRZoc9

![效果图](https://i.postimg.cc/FRvn8qpS/98c22c06dce8ff2744da2d4e848e11a.jpg)

> 【居然有人站在讲台上翻唱《浮夸》？！-哔哩哔哩】 https://b23.tv/E5EWfNC

所以就有了灵感 做一个显示字幕的工具

## 技术栈

### 前端

- [Vue.js](https://cn.vuejs.org/)
- [Element Plus](https://element-plus.gitee.io/zh-CN/)

### 后端

- [Node.js](https://nodejs.org)
- [Express.js](https://github.com/expressjs/express)
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- 日语注音:[kuroshiro](https://github.com/hexenq/kuroshiro)
- 粤语注音:[to-jyutping](https://github.com/CanCLID/to-jyutping)
- 普通话注音:[pinyin-pro](https://github.com/zh-lx/pinyin-pro)

### 字体
[思源宋体 CN Heavy](https://source.typekit.com/source-han-serif/cn/)



总体上就是请求网易云音乐的api 获取歌词、歌曲url 进行展示

## 实例

[https://subtitle.gaoshengjie.com](https://subtitle.gaoshengjie.com)