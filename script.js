// ========== 定数定義 ==========
const wavelengths = ['0094', '0131', '0171', '0193', '0211', '0304', '0335', '1600', '4500'];
const aiaBaseURL = 'https://hobbies-da-cathedral-collections.trycloudflare.com/get_aia?demo=true&url=';
const hmiBaseURL = 'https://hobbies-da-cathedral-collections.trycloudflare.com/get_hmi?demo=true&url=';
const flareBaseURL = 'https://hobbies-da-cathedral-collections.trycloudflare.com/get_flare_class?url=';

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

  const yearSelect = document.getElementById('year');
  for (let y = 2011; y <= now.getUTCFullYear(); y++) {
    yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
  }
  yearSelect.value = now.getUTCFullYear();

  const monthSelect = document.getElementById('month');
  for (let m = 1; m <= 12; m++) {
    monthSelect.innerHTML += `<option value="${m}">${m}</option>`;
  }
  monthSelect.value = now.getUTCMonth() + 1;

  updateDaySelector();
  const daySelect = document.getElementById('day');
  daySelect.value = now.getUTCDate();
  document.getElementById('year').addEventListener('change', () => {
    updateDaySelector();
    updateHourSelector();
  });
  document.getElementById('month').addEventListener('change', () => {
    updateDaySelector();
    updateHourSelector();
  });
  document.getElementById('day').addEventListener('change', updateHourSelector);

  updateHourSelector();
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

function updateHourSelector() {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  const maxHour = now.getUTCHours() - ((now.getUTCMinutes() >= 30) ? 0 : 1);

  const selectedYear = parseInt(document.getElementById('year').value);
  const selectedMonth = parseInt(document.getElementById('month').value);
  const selectedDay = parseInt(document.getElementById('day').value);

  const isToday = selectedYear === now.getUTCFullYear() &&
                  selectedMonth === now.getUTCMonth() + 1 &&
                  selectedDay === now.getUTCDate();

  const hourSelect = document.getElementById('hour');
  const currentValue = parseInt(hourSelect.value) || 0;
  hourSelect.innerHTML = '';

  for (let h = 0; h <= 23; h++) {
    const disabled = (isToday && h > maxHour) ? 'disabled' : '';
    hourSelect.innerHTML += `<option value="${h}" ${disabled}>${h}</option>`;
  }
  hourSelect.value = Math.min(currentValue, 23);
}

let preloadedImages = {};
let preloadedFlareClasses = [];
let timestamps = [];
let imageElements = {};
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

  timestamps = [];
  for (let h = 22; h >= 0; h -= 2) {
    const t = new Date(baseTime.getTime() - h * 3600 * 1000);
    timestamps.push(t);
  }

  const aiaUrls = {};
  const hmiUrls = [];
  wavelengths.forEach(wl => {
    aiaUrls[wl] = timestamps.map(d => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const h = String(d.getUTCHours()).padStart(2, '0');
      const ymd = `${y}${m}${day}`;
      if (y >= 2023)
        return `${aiaBaseURL}${encodeURIComponent(`https://sdo5.nascom.nasa.gov/data/aia/synoptic/${y}/${m}/${day}/H${h}00/AIA${ymd}_${h}0000_${wl}.fits`)}`;
      else
        return `${aiaBaseURL}${encodeURIComponent(`https://jsoc1.stanford.edu/data/aia/synoptic/${y}/${m}/${day}/H${h}00/AIA${ymd}_${h}00_${wl}.fits`)}`;
    });
  });
  hmiUrls.push(...timestamps.map(d => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    return `${hmiBaseURL}${encodeURIComponent(`http://jsoc1.stanford.edu/data/hmi/images/${y}/${m}/${day}/${y}${m}${day}_${h}0000_M_1k.jpg`)}`;
  }));

  preloadedImages = {};
  preloadedFlareClasses = [];

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

  // フレア強度データプリロード
  Promise.all(
    timestamps.map(t => {
      const y = t.getUTCFullYear();
      const m = String(t.getUTCMonth() + 1).padStart(2, '0');
      const d = String(t.getUTCDate()).padStart(2, '0');
      const url = `${flareBaseURL}${encodeURIComponent(`https://data.ngdc.noaa.gov/platforms/solar-space-observing-satellites/goes/goes16/l2/data/xrsf-l2-avg1m_science/${y}/${m}/sci_xrsf-l2-avg1m_g16_d${y}${m}${d}_v2-2-0.nc`)}`;
      return fetch(url)
        .then(res => res.ok ? res.json() : { flare_class: "?" })
        .then(json => json.flare_class || "?")
        .catch(() => "?");
    })
  ).then(results => {
    preloadedFlareClasses = results;
    renderImages();
  });
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
  grid.innerHTML = '';
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

  const timestampLabel = document.getElementById('timestamp');
  let flareLabel = document.getElementById('flare-class');
  if (!flareLabel) {
    flareLabel = document.createElement('h2');
    flareLabel.id = 'flare-class';
    document.body.insertBefore(flareLabel, grid);
  }

  frameIndex = 0;
  animationTimer = setInterval(() => {
    const idx = frameIndex % timestamps.length;
    wavelengths.forEach(wl => {
      const key = `${wl}-${idx}`;
      if (preloadedImages[key]) imageElements[wl].src = preloadedImages[key].src;
    });

    const hmiKey = `HMI-${idx}`;
    if (preloadedImages[hmiKey]) imageElements['HMI'].src = preloadedImages[hmiKey].src;

    const t = timestamps[idx];
    const timeStr = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')} ${String(t.getUTCHours()).padStart(2, '0')}:00 UTC`;
    timestampLabel.textContent = `現在表示中の時刻: ${timeStr}`;

    const flareStr = preloadedFlareClasses[idx] || "?";
    flareLabel.textContent = `フレアクラス: ${flareStr}`;

    frameIndex++;
  }, 500);
}
