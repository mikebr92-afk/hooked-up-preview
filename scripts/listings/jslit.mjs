// Minimal parser for the plain JS object/array literals embedded in the bundle
// (unquoted keys, "strings", numbers, !0/!1, true/false/null). No eval.
export function parseLiteralAt(src, start) {
  let i = start;
  const ws = () => { while (i < src.length && /\s/.test(src[i])) i++; };
  function str() {
    const q = src[i++]; let out = '';
    for (;;) {
      const c = src[i++];
      if (c === q) return out;
      if (c === '\\') {
        const n = src[i++];
        if (n === 'n') out += '\n'; else if (n === 't') out += '\t'; else if (n === 'r') out += '\r';
        else if (n === 'u') { out += String.fromCharCode(parseInt(src.substr(i, 4), 16)); i += 4; }
        else if (n === 'x') { out += String.fromCharCode(parseInt(src.substr(i, 2), 16)); i += 2; }
        else out += n;
      } else if (c === undefined) throw new Error('unterminated string');
      else out += c;
    }
  }
  function val() {
    ws();
    const c = src[i];
    if (c === '{') {
      i++; const o = {};
      for (;;) {
        ws(); if (src[i] === '}') { i++; return o; }
        let k;
        if (src[i] === '"' || src[i] === "'") k = str();
        else { const m = /^[A-Za-z_$][\w$]*|^\d+/.exec(src.slice(i, i + 64)); if (!m) throw new Error('bad key at ' + i); k = m[0]; i += k.length; }
        ws(); if (src[i++] !== ':') throw new Error('expected : at ' + (i - 1));
        o[k] = val(); ws();
        if (src[i] === ',') i++; else if (src[i] === '}') { i++; return o; } else throw new Error('expected , or } at ' + i);
      }
    }
    if (c === '[') {
      i++; const a = [];
      for (;;) {
        ws(); if (src[i] === ']') { i++; return a; }
        a.push(val()); ws();
        if (src[i] === ',') i++; else if (src[i] === ']') { i++; return a; } else throw new Error('expected , or ] at ' + i);
      }
    }
    if (c === '"' || c === "'") return str();
    if (src.startsWith('!0', i)) { i += 2; return true; }
    if (src.startsWith('!1', i)) { i += 2; return false; }
    for (const [w, v] of [['true', true], ['false', false], ['null', null], ['void 0', undefined]]) if (src.startsWith(w, i)) { i += w.length; return v; }
    const m = /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i.exec(src.slice(i, i + 40));
    if (m) { i += m[0].length; return Number(m[0]); }
    throw new Error('unexpected token at ' + i + ': ' + src.slice(i, i + 30));
  }
  const v = val();
  return [v, i];
}
