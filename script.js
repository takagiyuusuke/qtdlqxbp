const wavelengths = ['0094', '0131', '0171', '0193', '0211', '0304', '0335', '1600', '4500'];
const channels = [...wavelengths.map(wl => `AIA_${wl}`), 'HMI'];
const apiURL = "https://d393-131-113-97-134.ngrok-free.app/fetch_images"; // ← ここは適宜変更してください
const timestamps = [];

// 現在時刻をUTCで1時間切り下げ
const now = new Date();
now.setUTCMinutes(0, 0, 0);
for (let h = 32; h >= 10; h-=2) {
  const t = new Date(now.getTime() - h * 3600 * 1000);
  timestamps.push(t.toISOString());
}

// タイムスタンプ表示用
const timestampLabel = document.getElementById("timestamp");

// DOM要素準備
const grid = document.getElementById("aia-grid");
const imageElements = {};  // { channel: <img> }

channels.forEach(channel => {
  const container = document.createElement("div");
  container.className = "channel";

  const label = document.createElement("div");
  label.textContent = channel;
  const img = document.createElement("img");
  img.id = `img-${channel}`;
  container.appendChild(label);
  container.appendChild(img);
  grid.appendChild(container);

  imageElements[channel] = img;
});

// 全画像データ格納用
const imageFrames = {};  // { channel: [base64 strings] }

channels.forEach(channel => {
  imageFrames[channel] = [];
});

// POSTで画像を一括取得
fetch(apiURL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ timestamps: timestamps })
})
.then(res => res.json())
.then(data => {
  // データ構造: { images: [ { channel: "AIA_0094", time: "...", image: "base64..." }, ... ] }
  data.images.forEach(entry => {
    if (imageFrames[entry.channel]) {
      imageFrames[entry.channel].push(entry.image);
    }
  });

  // アニメーション開始
  let frameIndex = 0;
  setInterval(() => {
    const index = frameIndex % timestamps.length;

    // タイムスタンプ表示
    const t = new Date(timestamps[index]);
    const timeStr = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')} ${String(t.getUTCHours()).padStart(2, '0')}:00 UTC`;
    timestampLabel.textContent = `現在表示中の時刻: ${timeStr}`;

    // 画像更新
    channels.forEach(channel => {
      const imgEl = imageElements[channel];
      const b64 = imageFrames[channel][index];
      if (b64) {
        imgEl.src = `data:image/png;base64,${b64}`;
      }
    });

    frameIndex++;
  }, 3000);
})
.catch(err => {
  console.error("❌ 画像取得エラー:", err);
});
