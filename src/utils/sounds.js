/**
 * SƠ ĐỒ ÂM THANH (AUDIO SYSTEM)
 * Sử dụng Audio API mặc định để tối ưu hiệu năng và không cần thư viện ngoài.
 */

const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  select: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
};

// Cache các đối tượng Audio để giảm độ trễ (latency) khi chơi lại nhiều lần
const audioCache = {};

export const playSound = (name, volume = 0.4) => {
  try {
    const url = SOUND_URLS[name];
    if (!url) return;

    // Khởi tạo audio nếu chưa có trong cache
    if (!audioCache[name]) {
      audioCache[name] = new Audio(url);
    }

    const audio = audioCache[name];
    audio.currentTime = 0; // Reset về đầu để có thể push nhanh liên tục
    audio.volume = volume;
    
    // Play with catch to avoid "Autoplay" browser policy errors
    audio.play().catch(err => {
      // Thường là do trình duyệt chặn autoplay khi chưa có tương tác người dùng
      console.warn("Audio playback blocked by browser:", err.message);
    });
  } catch (err) {
    console.error("Critical Audio Error:", err);
  }
};
