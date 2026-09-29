// 새 예루살렘 시안 v2 — 위에서 내려다본 네모반듯한 성 (계 21:12~21)
const NJ_STONES = [
  ['벽옥', '#a9dcc9'], ['남보석', '#3563d6'], ['옥수', '#a8bfd9'], ['녹보석', '#1fa56a'],
  ['홍마노', '#b5523b'], ['홍보석', '#d23b3b'], ['황옥', '#cdd24a'], ['녹옥', '#4fc1b0'],
  ['담황옥', '#f0c75e'], ['비취옥', '#6fcf7f'], ['청옥', '#6b6fd6'], ['자수정', '#9b59d0'],
];
function njDraw(cv, W, H, built) {
  const dpr = 2; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const lin = (x0, y0, x1, y1, st) => { const gr = g.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  const rad = (x, y, r, st) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); st.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  const hex = (c, a) => { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const S = Math.min(W - 70, H - 46), cx = W / 2, cy = H / 2 - 4, h = S / 2;
  const FB = 14, WW = 8;               // 기초석 띠 · 성곽 두께
  const x0 = cx - h, y0 = cy - h, x1 = cx + h, y1 = cy + h;

  // 성 밖 — 풀밭 (지도의 꽃밭 .land-bg.garden과 같은 색), 성에서 번지는 빛은 은은하게
  g.fillStyle = '#27ae60'; g.fillRect(0, 0, W, H);
  g.fillStyle = rad(W * 0.2, H * 0.3, W * 0.45, [[0, 'rgba(46,204,113,0.9)'], [1, 'rgba(46,204,113,0)']]); g.fillRect(0, 0, W, H);
  g.fillStyle = rad(W * 0.8, H * 0.75, W * 0.45, [[0, 'rgba(30,132,73,0.9)'], [1, 'rgba(30,132,73,0)']]); g.fillRect(0, 0, W, H);
  g.fillStyle = rad(cx, cy, W * 0.62, [[0, 'rgba(255,246,215,0.55)'], [0.5, 'rgba(255,240,190,0.18)'], [1, 'rgba(255,240,190,0)']]); g.fillRect(0, 0, W, H);

  // 성 밖 물줄기 — 보좌의 강이 사방으로 흘러나간다. 남쪽은 지도의 강(SVG)이 이어받는다
  const outRiver = (ax, ay, bx, by) => {
    g.lineCap = 'butt';
    g.strokeStyle = 'rgba(93,64,55,0.35)'; g.lineWidth = 34; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();   // 강둑
    g.strokeStyle = 'rgba(0,188,212,0.88)'; g.lineWidth = 22; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    g.strokeStyle = 'rgba(210,248,255,0.55)'; g.lineWidth = 1.6; g.setLineDash([14, 12]);
    [-5, 4].forEach(o => { const vx = ax === bx; g.beginPath(); g.moveTo(ax + (vx ? o : 0), ay + (vx ? 0 : o)); g.lineTo(bx + (vx ? o : 0), by + (vx ? 0 : o)); g.stroke(); });
    g.setLineDash([]);
  };
  outRiver(cx, y0, cx, 0);      // 북
  outRiver(x1, cy, W, cy);      // 동
  outRiver(x0, cy, 0, cy);      // 서

  // 기초석 열두 조각 — 네 면을 셋씩, 12시(북쪽 가운데)부터 시계 방향. 조각마다 문이 하나 올라앉는다
  // 각 조각: [면, 몇째(0~2)]
  const seq = [['N', 1], ['N', 2], ['E', 0], ['E', 1], ['E', 2], ['S', 2], ['S', 1], ['S', 0], ['W', 2], ['W', 1], ['W', 0], ['N', 0]];
  const L = S / 3;
  const segRect = (side, i) => {   // 기초석 띠 위의 직사각형 (바깥 테두리 쪽)
    if (side === 'N') return [x0 + i * L, y0, L, FB];
    if (side === 'S') return [x0 + i * L, y1 - FB, L, FB];
    if (side === 'W') return [x0, y0 + i * L, FB, L];
    return [x1 - FB, y0 + i * L, FB, L];
  };
  seq.forEach(([side, i], k) => {
    const [rx, ry, rw, rh] = segRect(side, i), on = k < built, col = NJ_STONES[k][1];
    const horiz = side === 'N' || side === 'S';
    const n = 4, step = (horiz ? rw : rh) / n;   // 조각 하나 = 큰 돌 넷
    for (let j = 0; j < n; j++) {
      const bx = horiz ? rx + j * step : rx, by = horiz ? ry : ry + j * step, bw = horiz ? step - 1 : rw, bh = horiz ? rh : step - 1;
      if (on) {
        g.fillStyle = lin(bx, by, bx + bw, by + bh, [[0, hex(col, 1)], [1, hex(col, 0.75)]]); g.fillRect(bx, by, bw, bh);
        g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(bx + 1.5, by + 1.5, Math.min(5, bw - 3), 1.3);   // 반짝임
      } else {
        g.fillStyle = lin(bx, by, bx + bw, by + bh, [[0, '#bdb29c'], [1, '#a0957f']]); g.fillRect(bx, by, bw, bh);
      }
    }
  });

  // 벽옥 성곽 (21:18) — 기초석 안쪽
  const wx0 = x0 + FB, wy0 = y0 + FB, wx1 = x1 - FB, wy1 = y1 - FB;
  g.fillStyle = 'rgba(200,238,224,0.97)';
  g.fillRect(wx0, wy0, wx1 - wx0, WW); g.fillRect(wx0, wy1 - WW, wx1 - wx0, WW);
  g.fillRect(wx0, wy0, WW, wy1 - wy0); g.fillRect(wx1 - WW, wy0, WW, wy1 - wy0);
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 0.8; g.strokeRect(wx0 + 0.4, wy0 + 0.4, wx1 - wx0 - 0.8, wy1 - wy0 - 0.8);

  // 성 안 — 맑은 유리 같은 정금 (21:18), 길도 정금 (21:21)
  const ix0 = wx0 + WW, iy0 = wy0 + WW, ix1 = wx1 - WW, iy1 = wy1 - WW;
  g.fillStyle = lin(ix0, iy0, ix1, iy1, [[0, 'rgba(255,226,140,0.95)'], [0.5, 'rgba(255,240,190,0.95)'], [1, 'rgba(245,205,110,0.95)']]); g.fillRect(ix0, iy0, ix1 - ix0, iy1 - iy0);
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 3;   // 문과 문을 잇는 길
  [1, 2].forEach(t => { const a = ix0 + (ix1 - ix0) * t / 3, b = iy0 + (iy1 - iy0) * t / 3;
    g.beginPath(); g.moveTo(a, iy0); g.lineTo(a, iy1); g.stroke(); g.beginPath(); g.moveTo(ix0, b); g.lineTo(ix1, b); g.stroke(); });
  // 보좌의 빛 (22:1, 21:23)
  g.fillStyle = rad(cx, cy, S * 0.42, [[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,252,235,0.95)'], [0.5, 'rgba(255,240,190,0.4)'], [1, 'rgba(255,240,190,0)']]); g.fillRect(ix0, iy0, ix1 - ix0, iy1 - iy0);

  // 생명수의 강 — 보좌에서 나와 길 가운데로 흘러 남쪽 가운데 문으로 (22:1)
  const rw = 18;
  [[cx, y1], [cx, y0], [x1, cy], [x0, cy]].forEach(([tx, ty]) => {   // 남·북·동·서 가운데 문으로
    const vx = tx === cx, a = rw * 0.3, b = rw / 2;
    g.fillStyle = lin(cx, cy, tx, ty, [[0, 'rgba(160,240,255,0.95)'], [1, 'rgba(0,188,212,0.95)']]);
    g.beginPath();
    if (vx) { g.moveTo(cx - a, cy); g.lineTo(cx + a, cy); g.lineTo(tx + b, ty); g.lineTo(tx - b, ty); }
    else { g.moveTo(cx, cy - a); g.lineTo(cx, cy + a); g.lineTo(tx, ty + b); g.lineTo(tx, ty - b); }
    g.closePath(); g.fill();
  });
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill();   // 보좌

  // 진주 문 열둘 (21:12~13, 21) — 네 면에 셋씩, 성곽 위에 진주 하나
  const gates = [];
  ['N', 'E', 'S', 'W'].forEach(side => [0, 1, 2].forEach(i => {
    const t = (i + 0.5) / 3;
    const p = side === 'N' ? [x0 + S * t, wy0 + WW / 2] : side === 'S' ? [x0 + S * t, wy1 - WW / 2] : side === 'W' ? [wx0 + WW / 2, y0 + S * t] : [wx1 - WW / 2, y0 + S * t];
    gates.push(p);
  }));
  // 문 = 성곽과 기초석을 가로지르는 통로 + 그 자리를 두른 진주 고리 (드나드는 문으로 보이게)
  const sides = ['N', 'N', 'N', 'E', 'E', 'E', 'S', 'S', 'S', 'W', 'W', 'W'];
  gates.forEach(([gx, gy], gi) => {
    const side = sides[gi], pw = 9;
    const isRiver = gi % 3 === 1;   // 네 면의 가운데 문으로 강이 나간다
    g.fillStyle = isRiver ? 'rgba(0,188,212,0.95)' : 'rgba(255,238,185,0.98)';
    if (side === 'N') g.fillRect(gx - pw / 2, y0, pw, wy0 + WW - y0);
    if (side === 'S') g.fillRect(gx - pw / 2, wy1 - WW, pw, y1 - (wy1 - WW));
    if (side === 'W') g.fillRect(x0, gy - pw / 2, wx0 + WW - x0, pw);
    if (side === 'E') g.fillRect(wx1 - WW, gy - pw / 2, x1 - (wx1 - WW), pw);
    g.strokeStyle = 'rgba(255,255,255,0.97)'; g.lineWidth = 3.6;          // 진주 고리
    g.beginPath(); g.arc(gx, gy, 8.5, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(190,178,225,0.9)'; g.lineWidth = 0.9;
    g.beginPath(); g.arc(gx, gy, 10.4, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,1)'; g.beginPath(); g.arc(gx - 5, gy - 5, 1.6, 0, Math.PI * 2); g.fill();   // 광택
  });
  // 남쪽 가운데 문 아래로 강이 빠져나간다
  return { gateX: cx, gateY: y1 };
}
