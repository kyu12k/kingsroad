// convert_kjv.js
// KJV Revelation 데이터를 bibleDataEn 형태로 변환하는 일회성 스크립트
// 실행: node convert_kjv.js
// 출력: bible_en.js

const https = require('https');
const fs = require('fs');

const KJV_URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json';

function phraseChunk(text) {
  // 1차: 구두점(, ; : .) 기준으로 분리
  // 패턴: 구두점 뒤에 공백이 오거나 문자열 끝인 경우를 기준으로 split
  const raw = text
    .split(/(?<=[,;:.])(?=\s|$)/)
    .map(s => s.trim())
    .filter(Boolean);

  const chunks = [];
  for (const seg of raw) {
    const words = seg.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    // 1단어 조각 → 앞 chunk에 합치기
    if (words.length === 1 && chunks.length > 0) {
      chunks[chunks.length - 1] = chunks[chunks.length - 1] + ' ' + seg;
      continue;
    }

    // 7단어 초과 → 절반으로 분리
    if (words.length > 7) {
      const mid = Math.ceil(words.length / 2);
      chunks.push(words.slice(0, mid).join(' '));
      chunks.push(words.slice(mid).join(' '));
      continue;
    }

    chunks.push(seg);
  }

  // 최종 정리: 빈 문자열 제거, 앞뒤 공백 trim
  return chunks.map(c => c.trim()).filter(Boolean);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // BOM 제거 후 파싱
          const clean = data.replace(/^\uFEFF/, '');
          resolve(JSON.parse(clean));
        }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('KJV 데이터 다운로드 중...');
  const bible = await fetchJson(KJV_URL);

  // en_kjv.json 구조: 배열, 각 원소가 책(book)
  // Revelation = index 65 (0-based), 책 이름 확인
  const revelation = bible[65];
  if (!revelation) {
    console.error('Revelation(index 65) 데이터를 찾을 수 없습니다.');
    process.exit(1);
  }
  console.log(`책 이름: ${revelation.name} (${revelation.chapters.length}장)`);

  const bibleDataEn = {};
  let totalVerses = 0;

  for (let chIdx = 0; chIdx < revelation.chapters.length; chIdx++) {
    const chNum = chIdx + 1;
    const chapter = revelation.chapters[chIdx];
    bibleDataEn[chNum] = [];

    for (const verseText of chapter) {
      // KJV 이탤릭 표시자 제거: {it}, {were} 등
      const text = verseText.trim()
        .replace(/\{[^}]*\}/g, '')   // 이탤릭 표시자 제거
        .replace(/\s+([,;:.])/g, '$1') // 구두점 앞 공백 제거
        .replace(/\s{2,}/g, ' ')       // 연속 공백 정리
        .trim();
      const chunks = phraseChunk(text);
      bibleDataEn[chNum].push({ text, chunks });
      totalVerses++;
    }
  }

  console.log(`총 ${totalVerses}절 변환 완료`);

  // 샘플 출력 (1장 1절)
  console.log('\n[샘플] Rev 1:1');
  console.log('text:', bibleDataEn[1][0].text);
  console.log('chunks:', bibleDataEn[1][0].chunks);

  // bible_en.js 파일 생성
  const output = `// bible_en.js — KJV Revelation (자동 생성, convert_kjv.js로 재생성 가능)
// 출처: public domain KJV
const bibleDataEn = ${JSON.stringify(bibleDataEn, null, 2)};
`;

  fs.writeFileSync('bible_en.js', output, 'utf8');
  console.log('\nbible_en.js 생성 완료!');

  // 장별 절 수 확인
  console.log('\n=== 장별 절 수 ===');
  for (const ch of Object.keys(bibleDataEn)) {
    console.log(`${ch}장: ${bibleDataEn[ch].length}절`);
  }
}

main().catch(console.error);
