# 字幕

## 功能

### 显示歌曲歌词
![显示歌曲歌词](https://i.postimg.cc/Vshqt0nm/image.png)
> 海のまにまに——YOASOBI

### 为歌词注音
![为歌词注音](https://i.postimg.cc/T3bvxbqw/image.png?v=1)
> 喜欢你——邓紫棋

### 黑色背景（高对比度）
![黑色背景（高对比度）](https://i.postimg.cc/LXYbkKCs/image.png)
> 群青——YOASOBI

### 音频播放器
![音频播放器](https://i.postimg.cc/LsqcD1hR/image.png)
> 群青——YOASOBI

### 彩色背景
![彩色背景](https://i.postimg.cc/Vshqt0nm/image.png)
> 海のまにまに——YOASOBI
- 颜色会使用专辑封面的颜色！并不断变换（原理是将封面裁剪成四小块分布在屏幕四角然后旋转）
- 背景会随着歌曲节奏律动！参考[《基于 Web Audio API 实现音频可视化效果》](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)

### 消除人声
![消除人声](https://i.postimg.cc/4N9gTSTV/K.png)
- 这个确实没法放到文档里了，自己去[体验](https://subtitle.gaoshengjie.com)一下吧！

### 次句提醒
![次句提醒](https://i.postimg.cc/1XLng6gt/image.png)
> あの夢をなぞって——YOASOBI

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
- [karaoke](https://github.com/JMPerez/karaoke)

### 后端

- [Node.js](https://nodejs.org)
- [Express.js](https://github.com/expressjs/express)
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- 日语注音:[kuroshiro](https://github.com/hexenq/kuroshiro)
- 粤语注音:[to-jyutping](https://github.com/CanCLID/to-jyutping)
- 普通话注音:[pinyin-pro](https://github.com/zh-lx/pinyin-pro)
- 韩语注音:[kpop](https://github.com/AaronO/kpop)

### 字体
- [Noto Serif Simplified Chinese](https://fonts.google.com/noto/specimen/Noto+Serif+SC)
- [Noto Serif Korean](https://fonts.google.com/noto/specimen/Noto+Serif+KR)



总体上就是请求网易云音乐的api 获取歌词、歌曲url 进行展示

## 实例

[https://subtitle.gaoshengjie.com](https://subtitle.gaoshengjie.com)
