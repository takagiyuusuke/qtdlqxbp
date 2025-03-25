async function getFITSUrlAndTime() {
  const now = new Date();
  now.setHours(now.getHours() - 10);
  now.setMinutes(0, 0, 0);

  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');

  const url = `https://jsoc1.stanford.edu/data/aia/synoptic/${YYYY}/${MM}/${DD}/H${HH}00/AIA${YYYY}${MM}${DD}_${HH}00_0094.fits`;

  return { url, truncatedTime: now };
}

async function loadAndRenderFITS() {
  const { url, truncatedTime } = await getFITSUrlAndTime();

  document.getElementById("timestamp").textContent =
    `画像取得時刻（10時間前に切り下げ）：${truncatedTime.toLocaleString()}`;

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const fits = new astro.FITS(arrayBuffer);
    const hdu = fits.getHDU();
    const image = hdu.data;

    const width = image.width;
    const height = image.height;
    const data = image.data;

    const canvas = document.getElementById("fitsCanvas");
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(width, height);

    // データをグレースケールに変換して描画
    const min = Math.min(...data);
    const max = Math.max(...data);

    for (let i = 0; i < data.length; i++) {
      const norm = (data[i] - min) / (max - min);
      const value = Math.floor(norm * 255);
      imgData.data[i * 4 + 0] = value; // R
      imgData.data[i * 4 + 1] = value; // G
      imgData.data[i * 4 + 2] = value; // B
      imgData.data[i * 4 + 3] = 255;   // A
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.error("FITS読み込み失敗", err);
    document.getElementById("timestamp").textContent += "（取得失敗）";
  }
}

loadAndRenderFITS();
