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
function initWheel() {
  fitCanvas(); // ★ 最初に呼ぶ

  const segments = clips.map((c, i) => ({
    text: c.label,
    fillStyle: i % 2 ? '#ffec99' : '#ffe066'
  }));

  theWheel = new Winwheel({
    numSegments: segments.length,
    segments: segments,
    outerRadius: document.getElementById('canvas').width / 2 - 10,
    textMargin: 0,
    animation: {
      type: 'spinToStop',
      duration: 6,
      spins: 8,
      callbackFinished: (segment) => playClip(segment.text)
    }
  });

  document.getElementById('spin')
  .addEventListener('click', () => {
    // 1) もしアニメーション中なら停止
    theWheel.stopAnimation(false);
    // 2) ホイールの回転角度をゼロにリセット
    theWheel.rotationAngle = 0;
    // 3) 再描画（キャンバスをクリアして初期状態を描画）
    theWheel.draw();
    // 4) 改めてスピン開始
    theWheel.startAnimation();
  });
}

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