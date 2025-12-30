// 播放单词发音（使用有道词典API）
export function playPronunciation(word: string, type: 1 | 2 = 2) {
  try {
    // type=1: 英式发音, type=2: 美式发音
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
    const audio = new Audio(audioUrl);
    
    // 设置音频属性
    audio.volume = 0.8;
    
    // 播放音频
    audio.play().catch((error) => {
      console.error("播放发音失败:", error);
    });
    
    return audio;
  } catch (error) {
    console.error("创建音频失败:", error);
    return null;
  }
}

