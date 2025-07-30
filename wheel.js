// ① クリップを読み込む
let clips = [];
let theWheel;

/* ★ 端末サイズに合わせてキャンバスを設定する関数 */
function fitCanvas() {
  const canvas = document.getElementById('canvas');
  const size   = canvas.getBoundingClientRect().width;
  canvas.width  = size;
  canvas.height = size;

  if (theWheel) {
    theWheel.outerRadius = size / 2 - 10;
    theWheel.draw();
  }
}

function randomPastelColor() {
  const hue        = Math.floor(Math.random() * 360);  // 0–359°
  const saturation = 70;                               // 彩度 70%
  const lightness  = 85;                               // 明度 85% → パステル
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function initWheel() {
  fitCanvas();

  // ランダムパステルでセグメント配列を再作成
  const segments = clips.map(c => ({
    text:           c.label,
    fillStyle:      randomPastelColor(),
    textFillStyle:  '#333'
  }));

  // キャンバスをクリア
  const canvas = document.getElementById('canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  // 新しい Winwheel インスタンス
  theWheel = new Winwheel({
    canvasId:    'canvas',
    numSegments: segments.length,
    segments:    segments,
    outerRadius: canvas.width / 2 - 10,
    textMargin:  0,
    animation: {
      type:             'spinToStop',
      duration:         6,
      spins:            8,
      callbackFinished: seg => playClip(seg.text)
    }
  });

  // 最初に一度描画
  theWheel.draw();

  // スピンボタン
  document.getElementById('spin').addEventListener('click', () => {
    theWheel.stopAnimation(true);
    theWheel.draw();
    theWheel.startAnimation();
  });
}

/* ★ リサイズ時に再フィット */
window.addEventListener('resize', fitCanvas);

/* ▼ クリップ読み込み ▼ */
fetch('clips.json')
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    clips = data;
    initWheel();
  })
  .catch(err => console.error('‼ clips.json 読み込み失敗:', err));

/* ▼ クリップ再生関数 ▼ */
function playClip(label) {
  const clipObj = clips.find(c => c.label === label);
  if (!clipObj) return;

  const playerDiv = document.getElementById('twitch-player');
  playerDiv.innerHTML = '';

  const parent = location.hostname;
  const url    = `https://clips.twitch.tv/embed?clip=${clipObj.clip}` +
                 `&autoplay=true&muted=false&parent=${parent}`;

  const iframe = document.createElement('iframe');
  iframe.src           = url;
  iframe.allowFullscreen = true;
  playerDiv.appendChild(iframe);
}