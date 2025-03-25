function getFlareImageURL() {
  const now = new Date();

  // 1時間単位に切り下げ
  now.setMinutes(0, 0, 0);

  const YYYY = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const HH = String(now.getHours()).padStart(2, '0');

  const folderPath = `${YYYY}/${MM}/${DD}`;
  const filename = `${YYYY}${MM}${DD}_${HH}0000_M_1k.jpg`;

  return `http://jsoc1.stanford.edu/data/hmi/images/${folderPath}/${filename}`;
}

function displayFlareImage() {
  const url = getFlareImageURL();
  const img = document.getElementById("flareImage");
  img.src = url;

  const timestamp = document.getElementById("timestamp");
  timestamp.textContent = `画像取得時刻（切り下げ）：${new Date().toLocaleString()}`;
}

// 読み込み時に表示
displayFlareImage();
