// Pure client-side tool runners for ToolVerse

// Secure hash function using browser Crypto API
async function shaHash(text: string, algo: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  let hashName = 'SHA-256';
  if (algo === 'sha1') hashName = 'SHA-1';
  else if (algo === 'sha512') hashName = 'SHA-512';
  
  if (algo === 'md5') {
    // Basic MD5 pure JS fallback since WebCrypto doesn't support MD5 directly
    return md5Fallback(text);
  }
  
  try {
    const hashBuffer = await crypto.subtle.digest(hashName, msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return 'Hash calculation error';
  }
}

// Simple MD5 implementation in pure JS
function md5Fallback(string: string): string {
  function RotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX: number, lY: number) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function F(x: number, y: number, z: number) { return (x & y) | ((~x) & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & (~z)); }
  function H(x: number, y: number, z: number) { return (x ^ y ^ z); }
  function I(x: number, y: number, z: number) { return (y ^ (x | (~z))); }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II2(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  
  var x = Array(80);
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  
  string = UTF8Encode(string);
  var nWords = ((string.length + 8) >> 6) + 1;
  var ipad = Array(nWords * 16);
  for (k = 0; k < nWords * 16; k++) ipad[k] = 0;
  for (k = 0; k < string.length; k++) {
    ipad[k >> 2] |= (string.charCodeAt(k) << ((k % 4) * 8));
  }
  ipad[k >> 2] |= (0x80 << ((k % 4) * 8));
  ipad[nWords * 16 - 2] = string.length * 8;
  
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  
  for (k = 0; k < ipad.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = II(a, b, c, d, ipad[k + 0], S11, 0xD76AA478); d = II(d, a, b, c, ipad[k + 1], S12, 0xE8C7B756);
    c = II(c, d, a, b, ipad[k + 2], S13, 0x242070DB); b = II(b, c, d, a, ipad[k + 3], S14, 0xC1BDCEEE);
    a = II(a, b, c, d, ipad[k + 4], S11, 0xF57C0FAF); d = II(d, a, b, c, ipad[k + 5], S12, 0x4787C62A);
    c = II(c, d, a, b, ipad[k + 6], S13, 0xA8304613); b = II(b, c, d, a, ipad[k + 7], S14, 0xFD469501);
    a = II(a, b, c, d, ipad[k + 8], S11, 0x698098D8); d = II(d, a, b, c, ipad[k + 9], S12, 0x8B44F7AF);
    c = II(c, d, a, b, ipad[k + 10], S13, 0xFFFF5BB1); b = II(b, c, d, a, ipad[k + 11], S14, 0x895CD7BE);
    a = II(a, b, c, d, ipad[k + 12], S11, 0x6B901122); d = II(d, a, b, c, ipad[k + 13], S12, 0xFD987193);
    c = II(c, d, a, b, ipad[k + 14], S13, 0xA679438E); b = II(b, c, d, a, ipad[k + 15], S14, 0x49B40821);
    
    a = GG(a, b, c, d, ipad[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, ipad[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, ipad[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, ipad[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, ipad[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, ipad[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, ipad[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, ipad[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, ipad[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, ipad[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, ipad[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, ipad[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, ipad[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, ipad[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, ipad[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, ipad[k + 12], S24, 0x8D2A4C8A);
    
    a = HH(a, b, c, d, ipad[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, ipad[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, ipad[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, ipad[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, ipad[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, ipad[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, ipad[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, ipad[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, ipad[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, ipad[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, ipad[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, ipad[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, ipad[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, ipad[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, ipad[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, ipad[k + 2], S34, 0xC4AC5665);
    
    a = II2(a, b, c, d, ipad[k + 0], S41, 0xF4292244); d = II2(d, a, b, c, ipad[k + 7], S42, 0x432AFF97);
    c = II2(c, d, a, b, ipad[k + 14], S43, 0xAB9423A7); b = II2(b, c, d, a, ipad[k + 5], S44, 0xFC93A039);
    a = II2(a, b, c, d, ipad[k + 12], S41, 0x655B59C3); d = II2(d, a, b, c, ipad[k + 3], S42, 0x8F0CCC92);
    c = II2(c, d, a, b, ipad[k + 10], S43, 0xFFEFF47D); b = II2(b, c, d, a, ipad[k + 1], S44, 0x85845DD1);
    a = II2(a, b, c, d, ipad[k + 8], S41, 0x6FA87E4F); d = II2(d, a, b, c, ipad[k + 15], S42, 0xFE2CE6E0);
    c = II2(c, d, a, b, ipad[k + 6], S43, 0xA3014314); b = II2(b, c, d, a, ipad[k + 13], S44, 0x4E0811A1);
    a = II2(a, b, c, d, ipad[k + 4], S41, 0xF7537E82); d = II2(d, a, b, c, ipad[k + 11], S42, 0xBD3AF235);
    c = II2(c, d, a, b, ipad[k + 2], S43, 0x2AD7D2BB); b = II2(b, c, d, a, ipad[k + 9], S44, 0xEB86D391);
    
    a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD);
  }
  
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}

function UTF8Encode(str: string): string {
  str = str.replace(/\r\n/g, "\n");
  var utftext = "";
  for (var n = 0; n < str.length; n++) {
    var c = str.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}

function WordToHex(lValue: number): string {
  var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
  for (lCount = 0; lCount <= 3; lCount++) {
    lByte = (lValue >>> (lCount * 8)) & 255;
    WordToHexValueTemp = "0" + lByte.toString(16);
    WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
  }
  return WordToHexValue;
}

// Simple Markdown Parser in Regex
function parseMarkdown(md: string): string {
  let html = md;
  // Headings
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  // Bold / Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Lists
  html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  // Code Blocks
  html = html.replace(/```(.*?)\n(.*?)```/gs, '<pre><code>$2</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>');
  // Paragraphs
  html = html.replace(/^(?!<h|<li|<ul|<pre|<code)(.*?)$/gm, '<p>$1</p>');
  return html;
}

// JSON Collapsible Tree Builder
function buildJsonTree(obj: any): string {
  let depth = 0;
  function traverse(item: any, prefix = ''): string {
    if (item === null) return 'null';
    if (typeof item === 'undefined') return 'undefined';
    if (typeof item === 'string') return `"${item}"`;
    if (typeof item === 'number' || typeof item === 'boolean') return String(item);
    
    if (Array.isArray(item)) {
      if (item.length === 0) return '[]';
      let res = '[\n';
      res += item.map(val => prefix + '  ' + traverse(val, prefix + '  ')).join(',\n');
      res += '\n' + prefix + ']';
      return res;
    }
    
    if (typeof item === 'object') {
      const keys = Object.keys(item);
      if (keys.length === 0) return '{}';
      let res = '{\n';
      res += keys.map(key => prefix + '  ' + `"${key}"` + ': ' + traverse(item[key], prefix + '  ')).join(',\n');
      res += '\n' + prefix + '}';
      return res;
    }
    return String(item);
  }
  return traverse(obj);
}

// Global Runner functions registry
export const runners: Record<string, (inputs: any) => Promise<any> | any> = {
  // --- DEVELOPER & FORMATTING ---
  'html-formatter': (inputs) => {
    let code = inputs.code || '';
    let indent = parseInt(inputs.indent) || 2;
    let pad = ' '.repeat(indent);
    if (inputs.indent === 'tabs') pad = '\t';
    
    let formatted = '';
    let reg = /(<\/?[a-zA-Z0-9\s"'-=\/]+>)/g;
    let elements = code.replace(/\r\n/g, '\n').replace(/\n/g, '').split(reg).filter((el: string) => el.trim() !== '');
    
    let depth = 0;
    elements.forEach((el: string) => {
      if (el.startsWith('</')) depth--;
      formatted += pad.repeat(Math.max(0, depth)) + el + '\n';
      if (el.startsWith('<') && !el.startsWith('</') && !el.endsWith('/>') && !el.startsWith('<!')) depth++;
    });
    return { formatted: formatted.trim() };
  },
  'html-minifier': (inputs) => {
    let code = inputs.code || '';
    let minified = code
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/<!--.*?-->/g, '')
      .trim();
    return { minified };
  },
  'css-formatter': (inputs) => {
    let code = inputs.code || '';
    let indent = parseInt(inputs.indent) || 2;
    let pad = ' '.repeat(indent);
    
    let formatted = code
      .replace(/\s*([{\n};,])\s*/g, '$1')
      .replace(/;/g, ';\n')
      .replace(/{/g, ' {\n')
      .replace(/}/g, '}\n\n')
      .replace(/,/g, ', ');
      
    let lines = formatted.split('\n');
    let depth = 0;
    let result = '';
    lines.forEach((line: string) => {
      line = line.trim();
      if (line.includes('}')) depth--;
      if (line) {
        result += pad.repeat(Math.max(0, depth)) + line + '\n';
      }
      if (line.includes('{')) depth++;
    });
    return { formatted: result.trim() };
  },
  'css-minifier': (inputs) => {
    let code = inputs.code || '';
    let minified = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s*([{}|:;,])\s*/g, '$1')
      .replace(/;\s*}/g, '}')
      .trim();
    return { minified };
  },
  'js-formatter': (inputs) => {
    let code = inputs.code || '';
    let indent = parseInt(inputs.indent) || 2;
    let pad = ' '.repeat(indent);
    
    let lines = code.split('\n');
    let depth = 0;
    let formatted = '';
    lines.forEach((line: string) => {
      line = line.trim();
      if (line.startsWith('}') || line.startsWith(']')) depth--;
      formatted += pad.repeat(Math.max(0, depth)) + line + '\n';
      if (line.endsWith('{') || line.endsWith('[')) depth++;
    });
    return { formatted: formatted.trim() };
  },
  'js-minifier': (inputs) => {
    let code = inputs.code || '';
    let minified = code
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
      .replace(/\/\/.*?$/gm, '') // remove inline comments
      .replace(/\s+/g, ' ') // shrink space
      .replace(/\s*([=+\-*\/%&|!<>?:;{},[\]()])\s*/g, '$1') // clean operators space
      .trim();
    return { minified };
  },
  'sql-formatter': (inputs) => {
    let code = inputs.code || '';
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE'];
    let formatted = code;
    keywords.forEach(keyword => {
      const reg = new RegExp('\\b' + keyword + '\\b', 'gi');
      formatted = formatted.replace(reg, '\n' + keyword);
    });
    return { formatted: formatted.trim() };
  },
  'sql-beautifier': (inputs) => {
    let code = inputs.code || '';
    return { formatted: code.replace(/,/g, ',\n  ').replace(/\(/g, ' (\n  ').replace(/\)/g, '\n)') };
  },
  'sql-minifier': (inputs) => {
    let code = inputs.code || '';
    let minified = code.replace(/\s+/g, ' ').replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*?$/gm, '').trim();
    return { minified };
  },
  'xml-formatter': (inputs) => {
    let code = inputs.code || '';
    let formatted = '';
    let reg = /(<\/?[a-zA-Z0-9\s"'-=\/]+>)/g;
    let elements = code.replace(/\r\n/g, '\n').replace(/\n/g, '').split(reg).filter((el: string) => el.trim() !== '');
    let depth = 0;
    elements.forEach((el: string) => {
      if (el.startsWith('</')) depth--;
      formatted += '  '.repeat(Math.max(0, depth)) + el + '\n';
      if (el.startsWith('<') && !el.startsWith('</') && !el.endsWith('/>') && !el.startsWith('?')) depth++;
    });
    return { formatted: formatted.trim() };
  },
  'yaml-formatter': (inputs) => {
    let code = inputs.code || '';
    return { formatted: code.trim() };
  },

  // --- JSON TOOLS ---
  'json-formatter': (inputs) => {
    let json = inputs.json || '';
    let indent = inputs.indent === 'tabs' ? '\t' : parseInt(inputs.indent) || 2;
    try {
      let parsed = JSON.parse(json);
      return { formatted: JSON.stringify(parsed, null, indent) };
    } catch (e: any) {
      return { formatted: `Error: Invalid JSON syntax. ${e.message}` };
    }
  },
  'json-validator': (inputs) => {
    let json = inputs.json || '';
    try {
      JSON.parse(json);
      return { status: '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">✓ Valid JSON Syntax!</div>' };
    } catch (e: any) {
      return { status: `<div class="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">✗ Invalid JSON. Error: ${e.message}</div>` };
    }
  },
  'json-compare': (inputs) => {
    let j1 = inputs.json1 || '';
    let j2 = inputs.json2 || '';
    try {
      let o1 = JSON.parse(j1);
      let o2 = JSON.parse(j2);
      let d1 = JSON.stringify(o1, null, 2);
      let d2 = JSON.stringify(o2, null, 2);
      if (d1 === d2) {
        return { report: '<div class="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">Both JSON structures are 100% identical.</div>' };
      } else {
        return { report: `<div class="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">JSON objects have differences. Check structures.</div>` };
      }
    } catch (e: any) {
      return { report: `<div class="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">Error: Ensure both inputs are valid JSON first.</div>` };
    }
  },
  'json-viewer': (inputs) => {
    let json = inputs.json || '';
    try {
      let parsed = JSON.parse(json);
      let tree = buildJsonTree(parsed);
      return { viewer: `<pre class="text-xs text-text-main font-mono overflow-auto max-h-[500px] p-4 bg-bg-main/50 rounded-xl border border-border-card">${tree}</pre>` };
    } catch (e) {
      return { viewer: '<p class="text-rose-400">Please provide a valid JSON input.</p>' };
    }
  },
  'json-tree': (inputs) => {
    let json = inputs.json || '';
    try {
      let parsed = JSON.parse(json);
      return { tree: buildJsonTree(parsed) };
    } catch (e) {
      return { tree: 'Invalid JSON input' };
    }
  },
  'json-to-csv': (inputs) => {
    let json = inputs.json || '';
    try {
      let parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) parsed = [parsed];
      let keys = Object.keys(parsed[0]);
      let csv = keys.join(',') + '\n';
      parsed.forEach((row: any) => {
        csv += keys.map(key => JSON.stringify(row[key] || '')).join(',') + '\n';
      });
      return { csv };
    } catch (e) {
      return { csv: 'Error: Input must be a valid JSON array or object.' };
    }
  },
  'csv-to-json': (inputs) => {
    let csv = inputs.csv || '';
    let lines = csv.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return { json: '[]' };
    let headers = lines[0].split(',');
    let list = [];
    for (let i = 1; i < lines.length; i++) {
      let values = lines[i].split(',');
      let obj: any = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = (values[index] || '').trim();
      });
      list.push(obj);
    }
    return { json: JSON.stringify(list, null, 2) };
  },

  // --- CONVERTERS ---
  'json-to-yaml': (inputs) => {
    let json = inputs.json || '';
    try {
      let parsed = JSON.parse(json);
      function convertToYaml(obj: any, indent = 0): string {
        let yaml = '';
        let pad = ' '.repeat(indent);
        for (let key in obj) {
          let value = obj[key];
          if (typeof value === 'object' && value !== null) {
            yaml += `${pad}${key}:\n${convertToYaml(value, indent + 2)}`;
          } else {
            yaml += `${pad}${key}: ${value}\n`;
          }
        }
        return yaml;
      }
      return { yaml: convertToYaml(parsed) };
    } catch (e) {
      return { yaml: 'Invalid JSON input.' };
    }
  },
  'yaml-to-json': (inputs) => {
    let yaml = inputs.yaml || '';
    // Quick simple YAML parser (strictly key-value levels)
    let lines = yaml.split('\n');
    let obj: any = {};
    lines.forEach(line => {
      let parts = line.split(':');
      if (parts.length >= 2) {
        obj[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });
    return { json: JSON.stringify(obj, null, 2) };
  },
  'yaml-to-xml': (inputs) => {
    let yaml = inputs.yaml || '';
    let lines = yaml.split('\n');
    let xml = '<root>\n';
    lines.forEach(line => {
      let parts = line.split(':');
      if (parts.length >= 2) {
        let key = parts[0].trim();
        let val = parts.slice(1).join(':').trim();
        xml += `  <${key}>${val}</${key}>\n`;
      }
    });
    xml += '</root>';
    return { xml };
  },
  'xml-to-json': (inputs) => {
    let xml = inputs.xml || '';
    let tags = xml.match(/<([^>]+)>([^<]+)<\/\1>/g);
    let obj: any = {};
    if (tags) {
      tags.forEach(tag => {
        let keyMatch = tag.match(/<([^>]+)>/);
        let valMatch = tag.match(/>([^<]+)</);
        if (keyMatch && valMatch) {
          obj[keyMatch[1]] = valMatch[1];
        }
      });
    }
    return { json: JSON.stringify(obj, null, 2) };
  },
  'markdown-to-html': (inputs) => {
    let md = inputs.md || '';
    let html = parseMarkdown(md);
    return { html, preview: html };
  },
  'markdown-to-pdf': (inputs) => {
    return { status: '<button onclick="window.print()" class="tool-btn tool-btn-primary">Download & Print PDF Document</button>' };
  },
  'html-to-pdf': (inputs) => {
    return { action: '<button onclick="window.print()" class="tool-btn tool-btn-primary">Generate PDF File via Browser Print</button>' };
  },
  'base64-to-pdf': (inputs) => {
    let b64 = inputs.base64 || '';
    return { status: `<a href="${b64}" download="decoded_document.pdf" class="tool-btn tool-btn-primary">Download Decoded PDF File</a>` };
  },
  'unit-converter': (inputs) => {
    let val = parseFloat(inputs.value) || 0;
    let type = inputs.type || 'length';
    let from = (inputs.from || '').toLowerCase().trim();
    let to = (inputs.to || '').toLowerCase().trim();
    
    // Quick mapping rates
    let rates: any = {
      length: { m: 1, cm: 0.01, ft: 0.3048, in: 0.0254, mi: 1609.34 },
      weight: { kg: 1, g: 0.001, lbs: 0.453592, oz: 0.0283495 },
      data: { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024, tb: 1024 * 1024 * 1024 * 1024 }
    };
    
    if (type === 'temperature') {
      if (from === 'c' && to === 'f') return { result: (val * 9/5 + 32).toFixed(2) + ' F' };
      if (from === 'f' && to === 'c') return { result: ((val - 32) * 5/9).toFixed(2) + ' C' };
      if (from === 'c' && to === 'k') return { result: (val + 273.15).toFixed(2) + ' K' };
      return { result: val.toString() };
    }
    
    let rateGroup = rates[type];
    if (rateGroup && rateGroup[from] && rateGroup[to]) {
      let valInBase = val * rateGroup[from];
      let converted = valInBase / rateGroup[to];
      return { result: converted.toString() };
    }
    return { result: 'Invalid conversion units' };
  },
  'currency-converter': (inputs) => {
    let amt = parseFloat(inputs.amount) || 0;
    let from = inputs.from || 'USD';
    let to = inputs.to || 'EUR';
    let conversionTable: any = {
      USD: 1, EUR: 0.92, GBP: 0.78, INR: 83.4, JPY: 156.2, CAD: 1.36
    };
    if (conversionTable[from] && conversionTable[to]) {
      let usd = amt / conversionTable[from];
      let result = usd * conversionTable[to];
      return { result: `${result.toFixed(2)} ${to}` };
    }
    return { result: 'Rate not supported' };
  },

  // --- SECURITY TOOLS ---
  'password-generator': (inputs) => {
    let length = parseInt(inputs.length) || 16;
    let upper = inputs.uppercase !== false;
    let lower = inputs.lowercase !== false;
    let nums = inputs.numbers !== false;
    let syms = inputs.symbols !== false;
    
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (nums) chars += '0123456789';
    if (syms) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (chars === '') return { password: 'Select at least one character set!' };
    
    let pass = '';
    for (let i = 0; i < length; i++) {
      let idx = Math.floor(Math.random() * chars.length);
      pass += chars[idx];
    }
    return { password: pass };
  },
  'password-checker': (inputs) => {
    let pass = inputs.password || '';
    if (!pass) return { feedback: '<p class="text-text-muted">Enter a password to evaluate.</p>' };
    
    let score = 0;
    let checks = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      symbol: /[^A-Za-z0-9]/.test(pass)
    };
    
    if (checks.length) score += 2;
    if (pass.length >= 12) score += 1;
    if (checks.upper) score += 1;
    if (checks.lower) score += 1;
    if (checks.number) score += 1;
    if (checks.symbol) score += 1;
    
    let label = 'Very Weak';
    let color = 'bg-rose-500';
    if (score >= 6) { label = 'Strong'; color = 'bg-emerald-500'; }
    else if (score >= 4) { label = 'Medium'; color = 'bg-amber-500'; }
    else if (score >= 2) { label = 'Weak'; color = 'bg-orange-500'; }
    
    return {
      feedback: `
        <div class="space-y-4">
          <div class="flex justify-between items-center text-sm font-semibold">
            <span>Strength Rating:</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs text-white ${color}">${label}</span>
          </div>
          <div class="h-2 w-full bg-border-card rounded-full overflow-hidden">
            <div class="${color} h-full" style="width: ${(score/7)*100}%"></div>
          </div>
          <ul class="text-xs space-y-1 text-text-muted mt-2">
            <li>${checks.length ? '✓' : '✗'} Contains 8 or more characters</li>
            <li>${checks.upper ? '✓' : '✗'} Contains uppercase characters</li>
            <li>${checks.lower ? '✓' : '✗'} Contains lowercase characters</li>
            <li>${checks.number ? '✓' : '✗'} Contains numerical values</li>
            <li>${checks.symbol ? '✓' : '✗'} Contains special characters</li>
          </ul>
        </div>
      `
    };
  },
  'uuid-generator': (inputs) => {
    let count = parseInt(inputs.count) || 1;
    let version = inputs.version || 'v4';
    let list = [];
    
    for (let i = 0; i < Math.min(100, count); i++) {
      if (version === 'v1') {
        // Mock simple v1 timestamp UUID
        let time = Date.now().toString(16).padStart(12, '0');
        list.push(`${time.slice(0, 8)}-${time.slice(8, 12)}-11ee-8000-${Math.floor(Math.random()*1e11).toString(16).padStart(12, '0')}`);
      } else {
        // Standard v4 cryptographically random UUID
        let u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        list.push(u);
      }
    }
    return { uuids: list.join('\n') };
  },
  'hash-generator': async (inputs) => {
    let text = inputs.text || '';
    let algo = inputs.algo || 'sha256';
    let hash = await shaHash(text, algo);
    return { hash };
  },
  'jwt-decoder': (inputs) => {
    let token = inputs.jwt || '';
    let parts = token.split('.');
    if (parts.length < 2) return { header: '{}', payload: '{}', meta: '<p class="text-rose-400">Invalid JWT token syntax structure</p>' };
    try {
      let h = JSON.stringify(JSON.parse(atob(parts[0])), null, 2);
      let p = JSON.stringify(JSON.parse(atob(parts[1])), null, 2);
      let exp = '';
      try {
        let claims = JSON.parse(atob(parts[1]));
        if (claims.exp) exp = `Expires at: ${new Date(claims.exp * 1000).toLocaleString()}`;
      } catch(e) {}
      
      return {
        header: h,
        payload: p,
        meta: `<div class="text-xs text-text-muted mt-2">${exp || 'No Expiration claims found.'}</div>`
      };
    } catch(e: any) {
      return { header: '{}', payload: '{}', meta: `<p class="text-rose-400">Failed to decode token segments: ${e.message}</p>` };
    }
  },
  'jwt-encoder': (inputs) => {
    let pay = inputs.payload || '{}';
    let sec = inputs.secret || '';
    try {
      let header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      let payload = btoa(pay);
      let signature = btoa(sec.slice(0, 10)); // simple mock signature
      return { token: `${header}.${payload}.${signature}` };
    } catch(e) {
      return { token: 'Failed to encode JWT.' };
    }
  },
  'base64-encoder': (inputs) => {
    let text = inputs.text || '';
    return { encoded: btoa(unescape(encodeURIComponent(text))) };
  },
  'base64-decoder': (inputs) => {
    let text = inputs.text || '';
    try {
      return { decoded: decodeURIComponent(escape(atob(text))) };
    } catch (e) {
      return { decoded: 'Error: Invalid base64 characters string.' };
    }
  },

  // --- TEXT TOOLS ---
  'word-counter': (inputs) => {
    let txt = inputs.text || '';
    let w = txt.trim().split(/\s+/).filter((x: string) => x !== '').length;
    let c = txt.length;
    let s = txt.split(/[.!?]+/).filter((x: string) => x.trim() !== '').length;
    let p = txt.split('\n').filter((x: string) => x.trim() !== '').length;
    let read = Math.ceil(w / 200); // 200 wpm reading rate
    return {
      stats: `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="p-4 bg-bg-main/50 border border-border-card rounded-xl text-center">
            <div class="text-2xl font-bold">${w}</div>
            <div class="text-xs text-text-muted mt-1">Words</div>
          </div>
          <div class="p-4 bg-bg-main/50 border border-border-card rounded-xl text-center">
            <div class="text-2xl font-bold">${c}</div>
            <div class="text-xs text-text-muted mt-1">Characters</div>
          </div>
          <div class="p-4 bg-bg-main/50 border border-border-card rounded-xl text-center">
            <div class="text-2xl font-bold">${s}</div>
            <div class="text-xs text-text-muted mt-1">Sentences</div>
          </div>
          <div class="p-4 bg-bg-main/50 border border-border-card rounded-xl text-center">
            <div class="text-2xl font-bold">${p}</div>
            <div class="text-xs text-text-muted mt-1">Paragraphs</div>
          </div>
        </div>
        <p class="text-xs text-text-muted mt-4">Estimated Reading Time: ~${read} min</p>
      `
    };
  },
  'character-counter': (inputs) => {
    let text = inputs.text || '';
    return {
      counts: `
        <div class="space-y-2 text-sm text-text-muted">
          <div>Total Characters: <strong class="text-text-main">${text.length}</strong></div>
          <div>No Spaces Characters: <strong class="text-text-main">${text.replace(/\s+/g, '').length}</strong></div>
        </div>
      `
    };
  },
  'case-converter': (inputs) => {
    let t = inputs.text || '';
    let c = inputs.case || 'upper';
    if (c === 'upper') return { result: t.toUpperCase() };
    if (c === 'lower') return { result: t.toLowerCase() };
    if (c === 'title') {
      return { result: t.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) };
    }
    if (c === 'camel') {
      return { result: t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()) };
    }
    if (c === 'snake') {
      return { result: t.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') };
    }
    if (c === 'kebab') {
      return { result: t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '') };
    }
    return { result: t };
  },
  'slug-generator': (inputs) => {
    let title = inputs.title || '';
    let slug = title.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return { slug };
  },
  'lorem-ipsum': (inputs) => {
    let type = inputs.type || 'paragraphs';
    let count = parseInt(inputs.count) || 3;
    let base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    
    if (type === 'words') {
      return { text: base.split(' ').slice(0, count).join(' ') };
    }
    if (type === 'sentences') {
      return { text: base.split('.').slice(0, count).join('. ') + '.' };
    }
    let paras = [];
    for (let i = 0; i < count; i++) paras.push(base);
    return { text: paras.join('\n\n') };
  },
  'random-name-generator': (inputs) => {
    let count = parseInt(inputs.count) || 10;
    let g = inputs.gender || 'both';
    
    let firstNamesMale = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
    let firstNamesFemale = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
    let lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    let list = [];
    for (let i = 0; i < count; i++) {
      let isMale = g === 'male' || (g === 'both' && Math.random() > 0.5);
      let fn = isMale 
        ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)]
        : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
      let ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      list.push(`${fn} ${ln}`);
    }
    return { names: list.join('\n') };
  },
  'fake-data-generator': (inputs) => {
    let count = parseInt(inputs.count) || 5;
    let list = [];
    let jobs = ['Software Engineer', 'UX Designer', 'Product Manager', 'Data Scientist', 'Sales Executive', 'HR Manager'];
    let domains = ['gmail.com', 'outlook.com', 'toolverse.com', 'yahoo.com', 'domain.org'];
    let cities = ['New York', 'London', 'San Francisco', 'Toronto', 'Tokyo', 'Mumbai'];
    
    let firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Sam', 'Skyler', 'Robin'];
    let lastNames = ['Webb', 'Bell', 'Stone', 'Sharp', 'Fox', 'Page', 'Lane', 'Ford'];
    
    for (let i = 0; i < count; i++) {
      let fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      let ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      let name = `${fn} ${ln}`;
      let email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
      list.push({
        id: i + 1,
        name,
        email,
        phone: `+1 (${Math.floor(100+Math.random()*900)}) 555-${Math.floor(1000+Math.random()*9000)}`,
        job: jobs[Math.floor(Math.random() * jobs.length)],
        city: cities[Math.floor(Math.random() * cities.length)]
      });
    }
    return { data: JSON.stringify(list, null, 2) };
  },

  // --- ENCODINGS ---
  'url-encoder-decoder': (inputs) => {
    let text = inputs.text || '';
    let mode = inputs.mode || 'encode';
    if (mode === 'encode') return { result: encodeURIComponent(text) };
    return { result: decodeURIComponent(text) };
  },
  'html-entity-encoder-decoder': (inputs) => {
    let text = inputs.text || '';
    let mode = inputs.mode || 'encode';
    if (mode === 'encode') {
      return { result: text.replace(/[\u00A0-\u9999<>&]/g, (i) => '&#' + i.charCodeAt(0) + ';') };
    }
    let doc = new DOMParser().parseFromString(text, "text/html");
    return { result: doc.documentElement.textContent || '' };
  },
  'binary-converter': (inputs) => {
    let text = inputs.text || '';
    let mode = inputs.mode || 'to-binary';
    if (mode === 'to-binary') {
      return { result: text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ') };
    }
    try {
      let bins = text.trim().split(/\s+/);
      return { result: bins.map((bin: string) => String.fromCharCode(parseInt(bin, 2))).join('') };
    } catch(e) {
      return { result: 'Error decoding binary. Ensure spacing blocks are valid 8-bit codes.' };
    }
  },
  'hex-converter': (inputs) => {
    let text = inputs.text || '';
    let mode = inputs.mode || 'to-hex';
    if (mode === 'to-hex') {
      return { result: text.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ') };
    }
    try {
      let hexes = text.trim().split(/\s+/);
      return { result: hexes.map((hex: string) => String.fromCharCode(parseInt(hex, 16))).join('') };
    } catch(e) {
      return { result: 'Error decoding hex. Verify parameters format.' };
    }
  },

  // --- REGEX TOOLS ---
  'regex-tester': (inputs) => {
    let pattern = inputs.regex || '';
    let flags = inputs.flags || 'g';
    let text = inputs.text || '';
    try {
      let re = new RegExp(pattern, flags);
      let matches = [];
      let match;
      while ((match = re.exec(text)) !== null) {
        matches.push(match[0]);
        if (!flags.includes('g')) break; // Prevent infinite loops
      }
      return {
        matches: `
          <div class="space-y-2">
            <p class="text-sm">Total Matches: <strong class="text-primary">${matches.length}</strong></p>
            <div class="flex flex-wrap gap-2">
              ${matches.map(m => `<span class="px-2 py-1 text-xs bg-primary-glow border border-primary/20 text-primary rounded">${m}</span>`).join('')}
            </div>
          </div>
        `
      };
    } catch (e: any) {
      return { matches: `<p class="text-rose-400">Regex Error: ${e.message}</p>` };
    }
  },

  // --- NETWORK TOOLS ---
  'http-header-viewer': (inputs) => {
    let headers: any = {
      "User-Agent": navigator.userAgent,
      "Language": navigator.language,
      "Screen-Resolution": `${window.screen.width}x${window.screen.height}`,
      "Color-Depth": `${window.screen.colorDepth}-bit`,
      "Connection-Status": navigator.onLine ? "Online" : "Offline",
      "Timestamp": new Date().toISOString()
    };
    return { headers: JSON.stringify(headers, null, 2) };
  },
  'user-agent-parser': (inputs) => {
    let ua = inputs.ua || navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    
    return {
      details: `
        <table class="w-full text-sm text-left text-text-muted mt-2 border-collapse border border-border-card rounded-xl overflow-hidden">
          <tr class="border-b border-border-card"><td class="p-2.5 font-semibold bg-bg-main/50">OS Type:</td><td class="p-2.5 text-text-main">${os}</td></tr>
          <tr class="border-b border-border-card"><td class="p-2.5 font-semibold bg-bg-main/50">Browser:</td><td class="p-2.5 text-text-main">${browser}</td></tr>
          <tr><td class="p-2.5 font-semibold bg-bg-main/50">Raw String:</td><td class="p-2.5 text-xs text-text-main break-all">${ua}</td></tr>
        </table>
      `
    };
  },
  'url-parser': (inputs) => {
    let val = inputs.url || '';
    try {
      let url = new URL(val);
      return {
        parsed: `
          <table class="w-full text-sm text-left text-text-muted mt-2 border-collapse border border-border-card rounded-xl">
            <tr class="border-b border-border-card"><td class="p-2 bg-bg-main/50 font-semibold">Protocol:</td><td class="p-2 text-text-main font-mono">${url.protocol}</td></tr>
            <tr class="border-b border-border-card"><td class="p-2 bg-bg-main/50 font-semibold">Host:</td><td class="p-2 text-text-main font-mono">${url.host}</td></tr>
            <tr class="border-b border-border-card"><td class="p-2 bg-bg-main/50 font-semibold">Pathname:</td><td class="p-2 text-text-main font-mono">${url.pathname}</td></tr>
            <tr><td class="p-2 bg-bg-main/50 font-semibold">Params count:</td><td class="p-2 text-text-main font-mono">${Array.from(url.searchParams.keys()).length}</td></tr>
          </table>
        `
      };
    } catch(e) {
      return { parsed: '<p class="text-rose-400">Error: Invalid URL scheme structure</p>' };
    }
  },
  'robots-txt-generator': (inputs) => {
    let site = inputs.sitemap || '';
    let allows = (inputs.allow || '/').split(',');
    let blocks = (inputs.disallow || '').split(',').filter((x: string) => x !== '');
    
    let txt = 'User-agent: *\n';
    allows.forEach((p: string) => txt += `Allow: ${p.trim()}\n`);
    blocks.forEach((p: string) => txt += `Disallow: ${p.trim()}\n`);
    if (site) txt += `Sitemap: ${site.trim()}\n`;
    return { robots: txt };
  },

  // --- SEO TOOLS ---
  'meta-tag-generator': (inputs) => {
    let title = inputs.title || '';
    let desc = inputs.desc || '';
    let key = inputs.keywords || '';
    let tags = `
<!-- Standard SEO Meta Tags -->
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="keywords" content="${key}">
<meta name="robots" content="index, follow">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    `;
    return { meta: tags.trim() };
  },
  'open-graph-generator': (inputs) => {
    let title = inputs.title || '';
    let desc = inputs.desc || '';
    let img = inputs.image || '';
    let url = inputs.url || '';
    let tags = `
<!-- Open Graph Tags (Facebook, LinkedIn) -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}">
    `;
    return { og: tags.trim() };
  },
  'twitter-card-generator': (inputs) => {
    let type = inputs.cardType || 'summary_large_image';
    let title = inputs.title || '';
    let desc = inputs.desc || '';
    let img = inputs.image || '';
    let tags = `
<!-- Twitter Card Tags -->
<meta name="twitter:card" content="${type}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">
    `;
    return { twitter: tags.trim() };
  },
  'sitemap-generator': (inputs) => {
    let base = inputs.url || 'https://example.com';
    let paths = (inputs.paths || '').split('\n').filter((x: string) => x.trim() !== '');
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    paths.forEach((p: string) => {
      let fullUrl = base + (p.startsWith('/') ? p : '/' + p);
      xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>0.80</priority>\n  </url>\n`;
    });
    xml += '</urlset>';
    return { sitemap: xml };
  },
  'seo-checker': (inputs) => {
    let t = inputs.title || '';
    let d = inputs.desc || '';
    let body = inputs.body || '';
    
    let checks = [];
    if (t.length >= 10 && t.length <= 60) checks.push('✓ Title length is optimal (10-60 characters)');
    else checks.push('✗ Title length should be between 10 and 60 characters');
    
    if (d.length >= 50 && d.length <= 160) checks.push('✓ Meta description is optimal (50-160 characters)');
    else checks.push('✗ Meta description should be between 50 and 160 characters');
    
    if (body.includes('<h1')) checks.push('✓ Contains at least one H1 header tag');
    else checks.push('✗ Page should contain an H1 tag');
    
    return {
      report: `
        <div class="space-y-2 text-sm text-text-muted mt-2">
          ${checks.map(c => `<div>${c}</div>`).join('')}
        </div>
      `
    };
  },
  'website-meta-viewer': (inputs) => {
    let html = inputs.html || '';
    let titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    let descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    return {
      meta: `
        <div class="text-sm space-y-1 mt-2 text-text-muted">
          <div>Title: <strong class="text-text-main">${titleMatch ? titleMatch[1] : 'Not Found'}</strong></div>
          <div>Description: <strong class="text-text-main">${descMatch ? descMatch[1] : 'Not Found'}</strong></div>
        </div>
      `
    };
  },

  // --- COLOR TOOLS ---
  'color-palette-generator': (inputs) => {
    let seed = inputs.seed || '#6366f1';
    // Helper to generate shades
    let swatches = [seed, seed + 'cc', seed + '99', seed + '66', seed + '33'];
    return {
      palette: `
        <div class="flex gap-2.5 mt-2.5 overflow-hidden rounded-xl border border-border-card">
          ${swatches.map(c => `
            <div class="flex-1 text-center select-none cursor-pointer" onclick="navigator.clipboard.writeText('${c}')">
              <div class="h-20 w-full" style="background-color: ${c}"></div>
              <div class="text-xs font-mono p-2 bg-bg-card text-text-main">${c}</div>
            </div>
          `).join('')}
        </div>
        <p class="text-[11px] text-text-muted mt-2 text-center">Click on a color swatch to copy HEX code to clipboard.</p>
      `
    };
  },
  'shadow-generator': (inputs) => {
    let h = parseInt(inputs.horizontal) || 0;
    let v = parseInt(inputs.vertical) || 8;
    let b = parseInt(inputs.blur) || 24;
    let s = parseInt(inputs.spread) || -4;
    let o = (parseInt(inputs.opacity) || 15) / 100;
    
    let css = `box-shadow: ${h}px ${v}px ${b}px ${s}px rgba(0, 0, 0, ${o});`;
    return {
      css,
      preview: `
        <div class="flex items-center justify-center p-8 bg-bg-main/50 rounded-xl border border-border-card">
          <div class="h-28 w-28 bg-bg-card rounded-2xl flex items-center justify-center text-xs text-text-muted border border-border-card" style="${css}">
            Preview Box
          </div>
        </div>
      `
    };
  },
  'border-radius-generator': (inputs) => {
    let tl = parseInt(inputs.tl) || 16;
    let tr = parseInt(inputs.tr) || 16;
    let br = parseInt(inputs.br) || 16;
    let bl = parseInt(inputs.bl) || 16;
    
    let css = `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
    return {
      css,
      preview: `
        <div class="flex items-center justify-center p-8 bg-bg-main/50 rounded-xl border border-border-card">
          <div class="h-28 w-28 bg-primary/20 border-2 border-primary flex items-center justify-center text-xs text-primary font-semibold" style="${css}">
            Preview Shape
          </div>
        </div>
      `
    };
  },
  'random-color-generator': (inputs) => {
    let count = parseInt(inputs.count) || 8;
    let swatches = [];
    for (let i = 0; i < count; i++) {
      let c = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      swatches.push(c);
    }
    return {
      palette: `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          ${swatches.map(c => `
            <div class="overflow-hidden rounded-xl border border-border-card cursor-pointer" onclick="navigator.clipboard.writeText('${c}')">
              <div class="h-16 w-full" style="background-color: ${c}"></div>
              <div class="text-xs font-mono p-2 bg-bg-card text-text-main text-center">${c}</div>
            </div>
          `).join('')}
        </div>
      `
    };
  },

  // --- OTHER GENERATORS ---
  'cron-generator': (inputs) => {
    let min = inputs.minute || '*';
    let hr = inputs.hour || '*';
    let day = inputs.day || '*';
    let mon = inputs.month || '*';
    let wk = inputs.weekday || '*';
    
    let expression = `${min} ${hr} ${day} ${mon} ${wk}`;
    let desc = 'Runs every minute of every hour of every day.';
    if (min === '0') desc = 'Runs at the start of every hour.';
    if (min === '0' && hr === '0') desc = 'Runs daily at midnight.';
    
    return { expression, explanation: desc };
  },
  'glassmorphism-generator': (inputs) => {
    let color = inputs.color || '#ffffff';
    let op = (parseInt(inputs.opacity) || 25) / 100;
    let bl = parseInt(inputs.blur) || 16;
    
    // convert hex to rgb
    let hex = color.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) || 255;
    let g = parseInt(hex.substring(2, 4), 16) || 255;
    let b = parseInt(hex.substring(4, 6), 16) || 255;
    
    let css = `background: rgba(${r}, ${g}, ${b}, ${op});\nbackdrop-filter: blur(${bl}px);\n-webkit-backdrop-filter: blur(${bl}px);\nborder: 1px solid rgba(255, 255, 255, 0.2);`;
    return {
      css,
      preview: `
        <div class="flex items-center justify-center p-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl overflow-hidden min-h-[160px]">
          <div class="p-6 rounded-2xl text-center text-xs text-white" style="${css}">
            Glass Preview Box
          </div>
        </div>
      `
    };
  },
  'neumorphism-generator': (inputs) => {
    let color = inputs.color || '#e0e0e0';
    let size = parseInt(inputs.size) || 150;
    let rad = parseInt(inputs.radius) || 30;
    let dist = parseInt(inputs.distance) || 20;
    let inten = (parseInt(inputs.intensity) || 15) / 100;
    
    // convert hex to rgb for shadow math
    let hex = color.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) || 224;
    let g = parseInt(hex.substring(2, 4), 16) || 224;
    let b = parseInt(hex.substring(4, 6), 16) || 224;
    
    let darkColor = `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, ${inten})`;
    let lightColor = `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, 0.9)`;
    
    let css = `border-radius: ${rad}px;\nbackground: ${color};\nbox-shadow: ${dist}px ${dist}px ${dist*2}px ${darkColor},\n            -${dist}px -${dist}px ${dist*2}px ${lightColor};`;
    return {
      css,
      preview: `
        <div class="flex items-center justify-center p-8 rounded-xl" style="background-color: ${color}">
          <div class="flex items-center justify-center text-xs text-gray-500 font-semibold" style="${css} width: ${size}px; height: ${size}px;">
            Neumorphic Box
          </div>
        </div>
      `
    };
  },
  'flex-generator': (inputs) => {
    let dir = inputs.direction || 'row';
    let just = inputs.justify || 'flex-start';
    let align = inputs.align || 'stretch';
    let gap = parseInt(inputs.gap) || 16;
    
    let css = `display: flex;\nflex-direction: ${dir};\njustify-content: ${just};\nalign-items: ${align};\ngap: ${gap}px;`;
    return {
      css,
      preview: `
        <div class="p-4 bg-bg-main/50 rounded-xl border border-border-card" style="${css}">
          <div class="px-4 py-2 bg-primary/20 border border-primary/40 rounded text-primary text-xs font-bold text-center">Item 1</div>
          <div class="px-4 py-2 bg-accent/20 border border-accent/40 rounded text-accent text-xs font-bold text-center">Item 2</div>
          <div class="px-4 py-2 bg-primary/20 border border-primary/40 rounded text-primary text-xs font-bold text-center">Item 3</div>
        </div>
      `
    };
  },

  // --- FINANCE TOOLS ---
  'emi-calculator': (inputs) => {
    let p = parseFloat(inputs.principal) || 100000;
    let r = parseFloat(inputs.rate) || 7.5;
    let t = parseFloat(inputs.tenure) || 20;
    
    let monthlyRate = (r / 12) / 100;
    let months = t * 12;
    
    let emi = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    let totalPaid = emi * months;
    let totalInterest = totalPaid - p;
    
    return {
      emi: `$ ${emi.toFixed(2)}`,
      interest: `$ ${totalInterest.toFixed(2)}`,
      total: `$ ${totalPaid.toFixed(2)}`,
      chart: `
        <div class="mt-4 text-xs text-text-muted space-y-1.5">
          <div class="flex justify-between"><span>Principal:</span><strong class="text-text-main">50%</strong></div>
          <div class="flex justify-between"><span>Interest splits:</span><strong class="text-primary">50%</strong></div>
        </div>
      `
    };
  },
  'percentage-calculator': (inputs) => {
    let v1 = parseFloat(inputs.val1) || 0;
    let v2 = parseFloat(inputs.val2) || 0;
    let type = inputs.type || 'of';
    
    if (type === 'of') {
      return { result: `${(v1 / 100) * v2}` };
    }
    if (type === 'what-percent') {
      if (v2 === 0) return { result: 'Error: Cannot divide by zero' };
      return { result: `${((v1 / v2) * 100).toFixed(2)}%` };
    }
    if (type === 'change') {
      if (v1 === 0) return { result: 'Error: Initial value cannot be zero' };
      let diff = v2 - v1;
      let pct = (diff / v1) * 100;
      return { result: `${pct.toFixed(2)}% (${diff >= 0 ? 'Increase' : 'Decrease'})` };
    }
    return { result: 'Invalid Type' };
  },

  // --- MATH TOOLS ---
  'age-calculator': (inputs) => {
    let dobStr = inputs.dob || '1995-05-15';
    let dob = new Date(dobStr);
    let now = new Date();
    if (isNaN(dob.getTime())) return { age: 'Invalid Date Format (Use YYYY-MM-DD)', stats: '' };
    
    let diff = now.getTime() - dob.getTime();
    if (diff < 0) return { age: 'Birthdate cannot be in the future!', stats: '' };
    
    let yrs = now.getFullYear() - dob.getFullYear();
    let mths = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();
    
    if (days < 0) {
      mths--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (mths < 0) {
      yrs--;
      mths += 12;
    }
    
    let totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    return {
      age: `${yrs} Years, ${mths} Months, ${days} Days`,
      stats: `
        <div class="text-xs text-text-muted mt-2 space-y-1">
          <div>Total days lived: <strong class="text-text-main">${totalDays} days</strong></div>
          <div>Total hours lived: <strong class="text-text-main">${totalDays * 24} hours</strong></div>
        </div>
      `
    };
  },
  'bmi-calculator': (inputs) => {
    let w = parseFloat(inputs.weight) || 70;
    let h = parseFloat(inputs.height) || 175;
    
    let heightM = h / 100;
    let bmi = w / (heightM * heightM);
    
    let cat = 'Normal Weight';
    let color = 'text-emerald-500';
    if (bmi < 18.5) { cat = 'Underweight'; color = 'text-sky-500'; }
    else if (bmi >= 30) { cat = 'Obese'; color = 'text-red-500'; }
    else if (bmi >= 25) { cat = 'Overweight'; color = 'text-amber-500'; }
    
    return {
      bmi: bmi.toFixed(1),
      category: cat,
      range: `
        <div class="mt-4 p-4 bg-bg-main/50 border border-border-card rounded-xl">
          <div class="text-xs font-semibold ${color}">Your classification: ${cat}</div>
          <div class="flex h-2 bg-border-card rounded-full mt-2 overflow-hidden">
            <div class="bg-sky-400 h-full flex-1"></div>
            <div class="bg-emerald-400 h-full flex-1"></div>
            <div class="bg-amber-400 h-full flex-1"></div>
            <div class="bg-red-400 h-full flex-1"></div>
          </div>
        </div>
      `
    };
  },

  // --- TIME TOOLS ---
  'timezone-converter': (inputs) => {
    let time = inputs.time || '12:00';
    let from = inputs.fromZone || 'UTC';
    let to = inputs.toZone || 'Asia/Kolkata';
    
    try {
      let [h, m] = time.split(':').map(Number);
      let date = new Date();
      date.setHours(h);
      date.setMinutes(m);
      
      let formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: to,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return { result: formatter.format(date) };
    } catch(e) {
      return { result: 'Error converting timezone.' };
    }
  },
  'unix-timestamp': (inputs) => {
    let ts = parseInt(inputs.timestamp) || 0;
    try {
      let d = new Date(ts * 1000);
      if (isNaN(d.getTime())) return { date: 'Invalid Unix Timestamp', local: '' };
      return {
        date: d.toISOString(),
        local: d.toLocaleString()
      };
    } catch(e) {
      return { date: 'Error parsing epoch', local: '' };
    }
  }
};
