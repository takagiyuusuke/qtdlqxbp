const wavelengths = ['0094', '0131', '0171', '0193', '0211', '0304', '0335', '1600', '4500'];
const aiaBaseURL = 'https://d393-131-113-97-134.ngrok-free.app/fits2png?url=';

// 現在のUTC時刻を1時間切り下げ
const now = new Date();
now.setUTCMinutes(0, 0, 0);

// 10時間前〜32時間前の12枚分
const timestamps = [];
for (let h = 32; h >= 10; h -= 2) {
  const t = new Date(now.getTime() - h * 3600 * 1000);
  timestamps.push(t);
}

// AIA URL生成
const aiaUrls = {};
wavelengths.forEach(wl => {
  aiaUrls[wl] = timestamps.map(d => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hour = String(d.getUTCHours()).padStart(2, '0');
    const ymd = `${year}${month}${day}`;
    return `${aiaBaseURL}${encodeURIComponent(`https://sdo5.nascom.nasa.gov/data/aia/synoptic/${year}/${month}/${day}/H${hour}00/AIA${ymd}_${hour}0000_${wl}.fits`)}`;
  });
});

// HMI URL生成
const hmiUrls = timestamps.map(d => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hour = String(d.getUTCHours()).padStart(2, '0');
  return `http://jsoc1.stanford.edu/data/hmi/images/${year}/${month}/${day}/${year}${month}${day}_${hour}0000_M_1k.jpg`;
});

// 画像プリロード
const preloadedImages = {};  // { "0094-0": Image, ..., "HMI-0": Image }
wavelengths.forEach(wl => {
  aiaUrls[wl].forEach((url, i) => {
    const key = `${wl}-${i}`;
    const img = new Image();
    img.src = url;
    preloadedImages[key] = img;
  });
});
hmiUrls.forEach((url, i) => {
  const key = `HMI-${i}`;
  const img = new Image();
  img.src = url;
  preloadedImages[key] = img;
});

// HTMLに表示エリア追加
const grid = document.getElementById('aia-grid');
const timestampLabel = document.getElementById('timestamp');

const imageElements = {};  // { "0094": <img>, ..., "HMI": <img> }

// AIA + HMI まとめて描画要素を作る
[...wavelengths, 'HMI'].forEach(type => {
  const container = document.createElement('div');
  container.className = 'channel';

  const label = document.createElement('div');
  label.textContent = type === 'HMI' ? 'HMI' : `AIA ${type}`;
  const img = document.createElement('img');
  img.id = `img-${type}`;
  container.appendChild(label);
  container.appendChild(img);
  grid.appendChild(container);

  imageElements[type] = img;
});

// アニメーション制御
let frameIndex = 0;
setInterval(() => {
  // 表示画像更新
  wavelengths.forEach(wl => {
    const key = `${wl}-${frameIndex % timestamps.length}`;
    imageElements[wl].src = preloadedImages[key].src;
  });

  const hmiKey = `HMI-${frameIndex % timestamps.length}`;
  imageElements['HMI'].src = preloadedImages[hmiKey].src;

  // タイムスタンプ表示更新
  const t = timestamps[frameIndex % timestamps.length];
  const timeStr = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')} ${String(t.getUTCHours()).padStart(2, '0')}:00 UTC`;
  timestampLabel.textContent = `現在表示中の時刻: ${timeStr}`;

  frameIndex++;
}, 500);
