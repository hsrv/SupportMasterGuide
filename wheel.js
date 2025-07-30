// ① クリップを読み込む
let clips = [];
let theWheel;

/* ★ 端末サイズに合わせてキャンバスを設定する関数 */
 function fitCanvas() {
   const canvas = document.getElementById('canvas');
   const size = canvas.getBoundingClientRect().width;

   // Canvas の内部解像度も同じ値に
   canvas.width  = size;
   canvas.height = size;

   if (theWheel) {
     theWheel.outerRadius = size / 2 - 10;
     theWheel.draw();
   }
 }
function randomPastelColor() {
  const hue = Math.floor(Math.random() * 360);     // 0–359°
  const saturation = 70;                           // 彩度 70%
  const lightness  = 85;                           // 明度 85% → パステル
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
function initWheel() {
  fitCanvas();

  // 新しい色でセグメント配列を作り直し
  const segments = clips.map(c => ({
    text: c.label,
    fillStyle: randomPastelColor(),
    textFillStyle: '#333'    // コントラスト用に文字色もお好みで
  }));

  // もし以前のホイールがあればキャンバスごとクリア
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 毎回 fresh なインスタンスを作る
  theWheel = new Winwheel({
    canvasId:    'canvas',
    numSegments: segments.length,
    segments:    segments,
    outerRadius: canvas.width/2 - 10,
    textMargin:  0,
    animation: {
      type:       'spinToStop',
      duration:   6,
      spins:      8,
      callbackFinished: seg => playClip(seg.text)
    }
  });

  // ボタンのリスナは一度だけ
  document.getElementById('spin').onclick = () => theWheel.startAnimation();

/* ★ リサイズ時に再フィット */
window.addEventListener('resize', fitCanvas);

/* ▼ 以下は元のまま ▼ */
fetch('clips.json')
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => { clips = data; initWheel(); })
  .catch(err => console.error('‼ clips.json 読み込み失敗:', err));

function playClip(label) {
  const clipObj = clips.find(c => c.label === label);
  if (!clipObj) return;

  const playerDiv = document.getElementById('twitch-player');
  playerDiv.innerHTML = '';

  const parent = location.hostname;
  const url = `https://clips.twitch.tv/embed?clip=${clipObj.clip}&autoplay=true&muted=false&parent=${parent}`;

  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.allowFullscreen = true;
  playerDiv.appendChild(iframe);
}