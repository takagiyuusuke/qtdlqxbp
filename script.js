function getFlareImageInfo() {
  const now = new Date();

  // 🔽 10時間前にする！
  now.setHours(now.getHours() - 10);

  // 切り下げる用にコピーを作成
  const truncated = new Date(now);
  truncated.setMinutes(0, 0, 0); // 分・秒・ミリ秒を0に

  const YYYY = truncated.getFullYear();
  const MM = String(truncated.getMonth() + 1).padStart(2, '0');
  const DD = String(truncated.getDate()).padStart(2, '0');
  const HH = String(truncated.getHours()).padStart(2, '0');

  const folderPath = `${YYYY}/${MM}/${DD}`;
  const filename = `${YYYY}${MM}${DD}_${HH}0000_M_512.jpg`;
  const url = `https://jsoc1.stanford.edu/data/hmi/images/${folderPath}/${filename}`;

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
  timestamp.textContent = `画像取得時刻（10時間前に切り下げ）：${truncatedTime.toLocaleString()}`;
}

displayFlareImage();
