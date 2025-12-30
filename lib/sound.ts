// 播放"叮"的提示音
export function playNotificationSound() {
  try {
    // 使用 Web Audio API 生成提示音
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // 连接到 gain node，再连接到输出
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 设置音调：800Hz 听起来像"叮"
    oscillator.frequency.value = 800;
    oscillator.type = "sine"; // 正弦波，声音更柔和

    // 设置音量包络：快速淡入淡出
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // 快速淡入
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // 快速淡出

    // 播放 0.15 秒
    oscillator.start(now);
    oscillator.stop(now + 0.15);

    // 清理
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    // 如果 Web Audio API 不可用，静默失败
    console.warn("无法播放提示音:", error);
  }
}

