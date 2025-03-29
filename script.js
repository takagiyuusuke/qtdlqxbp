// ========== 定数定義 ==========
const wavelengths = ['0094', '0131', '0171', '0193', '0211', '0304', '0335', '1600', '4500'];
const aiaBaseURL = 'https://hobbies-da-cathedral-collections.trycloudflare.com/get_aia?demo=true&url=';
const hmiBaseURL = 'https://hobbies-da-cathedral-collections.trycloudflare.com/get_hmi?demo=true&url=';

// ========== 初期化処理 ==========
window.addEventListener('DOMContentLoaded', () => {
  populateTimeSelectors();
  loadImagesFromSelectedTime();

  document.getElementById('load-button').addEventListener('click', () => {
    loadImagesFromSelectedTime();
  });
});

// ========== セレクタの中身を生成 ==========
function populateTimeSelectors() {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  const maxHour = now.getUTCHours() - ((now.getUTCMinutes() >= 30) ? 0 : 1);

  // 年
  const yearSelect = document.getElementById('year');
  for (let y = 2020; y <= now.getUTCFullYear(); y++) {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  }
  yearSelect.value = now.getUTCFullYear();

  // 月
  const monthSelect = document.getElementById('month');
  for (let m = 1; m <= 12; m++) {
    monthSelect.innerHTML += `<option value="${m}">${m}</option>`;
  }
  monthSelect.value = now.getUTCMonth() + 1;

  // 日
  updateDaySelector();
  const daySelect = document.getElementById('day');
  daySelect.value = now.getUTCDate(); // 現在の日付を設定
  
  document.getElementById('year').addEventListener('change', updateDaySelector);
  document.getElementById('month').addEventListener('change', updateDaySelector);

  // 時間
  const hourSelect = document.getElementById('hour');
  for (let h = 0; h <= 23; h++) {
    const disabled = (h > maxHour && isTodaySelected(now)) ? 'disabled' : '';
    hourSelect.innerHTML += `<option value="${h}" ${disabled}>${h}</option>`;
  }
  hourSelect.value = Math.max(0, maxHour);
}

function updateDaySelector() {
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const daySelect = document.getElementById('day');

  const daysInMonth = new Date(year, month, 0).getDate();
  const prevDay = parseInt(daySelect.value) || 1;
  daySelect.innerHTML = '';
  for (let d = 1; d <= daysInMonth; d++) {
    daySelect.innerHTML += `<option value="${d}">${d}</option>`;
  }
  daySelect.value = Math.min(prevDay, daysInMonth);
}

function isTodaySelected(now) {
  return parseInt(document.getElementById('year').value) === now.getUTCFullYear() &&
         parseInt(document.getElementById('month').value) === now.getUTCMonth() + 1 &&
         parseInt(document.getElementById('day').value) === now.getUTCDate();
}

// ========== ロジック本体 ==========
let preloadedImages = {};  // 全画像キャッシュ
let timestamps = [];
let imageElements = {};  // 各波長のimgタグ
let frameIndex = 0;
let animationTimer = null;

function loadImagesFromSelectedTime() {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }

  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const day = parseInt(document.getElementById('day').value);
  const hour = parseInt(document.getElementById('hour').value);

  const baseTime = new Date(Date.UTC(year, month - 1, day, hour));

  // 1時間ごと11枚生成（-22h 〜 -2h）
  timestamps = [];
  for (let h = 22; h >= 2; h -= 2) {
    const t = new Date(baseTime.getTime() - h * 3600 * 1000);
    timestamps.push(t);
  }

  // URL生成
  const aiaUrls = {};
  const hmiUrls = [];
  wavelengths.forEach(wl => {
    aiaUrls[wl] = timestamps.map(d => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const h = String(d.getUTCHours()).padStart(2, '0');
      const ymd = `${y}${m}${day}`;
      return `${aiaBaseURL}${encodeURIComponent(`https://sdo5.nascom.nasa.gov/data/aia/synoptic/${y}/${m}/${day}/H${h}00/AIA${ymd}_${h}0000_${wl}.fits`)}`;
    });
  });
  hmiUrls.push(...timestamps.map(d => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    return `${hmiBaseURL}${encodeURIComponent(`http://jsoc1.stanford.edu/data/hmi/images/${y}/${m}/${day}/${y}${m}${day}_${h}0000_M_1k.jpg`)}`;
  }));

  // 画像キャッシュ初期化
  preloadedImages = {};

  const transparentURL = createTransparentImageURL();

  wavelengths.forEach(wl => {
    aiaUrls[wl].forEach((url, i) => {
      const key = `${wl}-${i}`;
      const img = new Image();
      img.onload = () => { preloadedImages[key] = img; };
      img.onerror = () => {
        const fallback = new Image();
        fallback.src = transparentURL;
        preloadedImages[key] = fallback;
        console.warn(`❌ AIA image failed to load: ${url}`);
      };
      img.src = url;
    });
  });

  hmiUrls.forEach((url, i) => {
    const key = `HMI-${i}`;
    const img = new Image();
    img.onload = () => { preloadedImages[key] = img; };
    img.onerror = () => {
      const fallback = new Image();
      fallback.src = transparentURL;
      preloadedImages[key] = fallback;
      console.warn(`❌ HMI image failed to load: ${url}`);
    };
    img.src = url;
  });

  renderImages();
}

function createTransparentImageURL(width = 200, height = 200) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("No data", width / 2, height / 2);
  return canvas.toDataURL('image/png');
}

function renderImages() {
  const grid = document.getElementById('aia-grid');
  grid.innerHTML = ''; // 既存をクリア
  imageElements = {};

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

  frameIndex = 0;
  const timestampLabel = document.getElementById('timestamp');
  animationTimer = setInterval(() => {
    wavelengths.forEach(wl => {
      const key = `${wl}-${frameIndex % timestamps.length}`;
      if (preloadedImages[key]) imageElements[wl].src = preloadedImages[key].src;
    });

    const hmiKey = `HMI-${frameIndex % timestamps.length}`;
    if (preloadedImages[hmiKey]) imageElements['HMI'].src = preloadedImages[hmiKey].src;

    const t = timestamps[frameIndex % timestamps.length];
    const timeStr = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')} ${String(t.getUTCHours()).padStart(2, '0')}:00 UTC`;
    timestampLabel.textContent = `現在表示中の時刻: ${timeStr}`;

    frameIndex++;
  }, 500);
}
