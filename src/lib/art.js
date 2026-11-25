import { esc } from './utils.js';

function svgImage(kategori, seed){
  const pal = {
    Fisika:['#38bdf8','#2563eb'], Kimia:['#34d399','#059669'],
    Biologi:['#a3e635','#65a30d'], Astronomi:['#c084fc','#7c3aed']
  }[kategori] || ['#38bdf8','#2563eb'];
  const art = {
    Fisika:`<g fill="none" stroke="${pal[0]}" stroke-width="3" opacity=".85"><ellipse cx="210" cy="120" rx="130" ry="52" transform="rotate(-24 210 120)"/><ellipse cx="210" cy="120" rx="130" ry="52" transform="rotate(24 210 120)"/></g><circle cx="210" cy="120" r="26" fill="${pal[1]}"/><circle cx="325" cy="70" r="11" fill="#fbbf24"/><path d="M60 205h300" stroke="${pal[0]}" stroke-width="3" opacity=".5"/><path d="M120 190v-46m-7 8 7-9 7 9" stroke="#e8f0ff" stroke-width="3" fill="none"/>`,
    Kimia:`<g stroke="${pal[0]}" stroke-width="4" fill="none"><path d="M178 52h64v42l52 92a28 28 0 0 1-25 42h-118a28 28 0 0 1-25-42l52-92z"/><path d="M170 158h100"/></g><g fill="${pal[0]}" opacity=".85"><circle cx="200" cy="186" r="9"/><circle cx="232" cy="174" r="6"/><circle cx="218" cy="200" r="5"/><circle cx="246" cy="196" r="7"/></g><g stroke="${pal[1]}" stroke-width="2" fill="none" opacity=".7"><ellipse cx="90" cy="90" rx="34" ry="14"/><ellipse cx="90" cy="90" rx="34" ry="14" transform="rotate(60 90 90)"/><ellipse cx="90" cy="90" rx="34" ry="14" transform="rotate(120 90 90)"/></g><circle cx="90" cy="90" r="6" fill="#fbbf24"/>`,
    Biologi:`<circle cx="210" cy="120" r="88" fill="${pal[1]}" opacity=".35" stroke="${pal[0]}" stroke-width="4"/><circle cx="210" cy="120" r="34" fill="${pal[0]}" opacity=".8"/><circle cx="198" cy="110" r="11" fill="#fff" opacity=".6"/><g fill="${pal[0]}" opacity=".9"><circle cx="165" cy="80" r="8"/><circle cx="258" cy="88" r="10"/><circle cx="266" cy="158" r="7"/><circle cx="160" cy="160" r="9"/></g><path d="M58 200c40-34 65-34 92 0" stroke="${pal[0]}" stroke-width="3" fill="none" opacity=".6"/><path d="M300 200c25-30 48-30 70 0" stroke="${pal[0]}" stroke-width="3" fill="none" opacity=".6"/>`,
    Astronomi:`<circle cx="215" cy="120" r="62" fill="${pal[1]}"/><circle cx="195" cy="100" r="12" fill="#fff" opacity=".2"/><circle cx="240" cy="140" r="18" fill="#fff" opacity=".12"/><ellipse cx="215" cy="120" rx="110" ry="30" transform="rotate(-18 215 120)" fill="none" stroke="${pal[0]}" stroke-width="9" opacity=".85"/><circle cx="60" cy="50" r="3" fill="#fff"/><circle cx="350" cy="64" r="2" fill="#fff"/><circle cx="330" cy="190" r="3" fill="#fff"/><circle cx="96" cy="186" r="2" fill="#fff"/>`
  }[kategori];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="240" viewBox="0 0 420 240"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0d1730"/><stop offset="1" stop-color="#070c1a"/></linearGradient></defs><rect width="420" height="240" rx="18" fill="url(#b)"/><g opacity=".16" stroke="#93c5fd">${Array.from({length:9},(_,i)=>`<path d="M${i*52} 0v240"/>`).join('')}${Array.from({length:5},(_,i)=>`<path d="M0 ${i*60}h420"/>`).join('')}</g>${art}<text x="20" y="224" fill="${pal[0]}" font-family="sans-serif" font-size="13" font-weight="700" opacity=".9">${esc(kategori)} · ${esc(seed)}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export { svgImage };
