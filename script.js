function formatDate(date) {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  return { YYYY, MM, DD, HH };
}

function displayHMI() {
  const now = new Date();
  now.setHours(now.getHours() - 12); // 12時間前
  now.setMinutes(0, 0, 0); // 切り下げ

  const { YYYY, MM, DD, HH } = formatDate(now);
  const url = `https://jsoc1.stanford.edu/data/hmi/images/${YYYY}/${MM}/${DD}/${YYYY}${MM}${DD}_${HH}0000_M_1k.jpg`;

  document.getElementById("hmi-image").src = url;
  document.getElementById("hmi-time").textContent = `取得時刻（12時間前に切り下げ）：${now.toLocaleString()}`;
}

displayHMI();
