function formatDate(date) {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const MI = String(date.getMinutes()).padStart(2, '0');
  return { YYYY, MM, DD, HH, MI };
}

function generateImageUrls() {
  const urls = [];
  const now = new Date();
  now.setHours(now.getHours() - 20); // 20時間前から開始
  now.setMinutes(0, 0, 0); // 分と秒をリセット

  for (let i = 20; i >= 10; i--) { // 20時間前から現在までの1時間ごと
    const { YYYY, MM, DD, HH, MI } = formatDate(now);
    const url = `https://jsoc1.stanford.edu/data/hmi/images/${YYYY}/${MM}/${DD}/${YYYY}${MM}${DD}_${HH}${MI}00_M_1k.jpg`;
    urls.push(url);
    now.setHours(now.getHours() + 1); // 1時間進める
  }

  return urls;
}

function displayAnimatedHMI() {
  const urls = generateImageUrls();
  let currentIndex = 0;

  function updateImage() {
    const imageElement = document.getElementById("hmi-image");
    const timeElement = document.getElementById("hmi-time");

    if (currentIndex >= urls.length) {
      currentIndex = 0; // ループする
    }

    const now = new Date();
    now.setHours(now.getHours() - 20 + currentIndex); // 時間を計算
    now.setMinutes(0, 0, 0); // 分をリセット

    imageElement.src = urls[currentIndex];
    timeElement.textContent = `取得時刻：${now.toLocaleString()}`;
    currentIndex++;
  }

  updateImage(); // 初回表示
  setInterval(updateImage, 1000); // 1秒ごとに画像を切り替え
}

displayAnimatedHMI();
