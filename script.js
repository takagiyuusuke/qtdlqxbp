function getFlareImageInfo() {
  const now = new Date();

  // 切り下げる用にコピーを作成
  const truncated = new Date(now);
  truncated.setMinutes(0, 0, 0);

  const YYYY = truncated.getFullYear();
  const MM = String(truncated.getMonth() + 1).padStart(2, '0');
  const DD = String(truncated.getDate()).padStart(2, '0');
  const HH = String(truncated.getHours()).padStart(2, '0');

  const folderPath = `${YYYY}/${MM}/${DD}`;
  const filename = `${YYYY}${MM}${DD}_${HH}0000_M_1k.jpg`;
  const url = `http://jsoc1.stanford.edu/data/hmi/images/2025/03/24/20250325_100000_M_1k.jpg`;

  return {
    url,
    truncatedTime: truncated
  };
}

function displayFlareImage() {
  const { url, truncatedTime } = getFlareImageInfo();

  const img = document.getElementById("flareImage");
  img.src = url;

  const timestamp = document.getElementById("timestamp");
  timestamp.textContent = `画像取得時刻（切り下げ）：${truncatedTime.toLocaleString()}`;
}

displayFlareImage();
