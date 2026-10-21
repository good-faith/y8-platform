const fs = require('fs');
const eu = 'node_modules/@noble/hashes/esm/utils.js';
const u  = 'node_modules/@noble/hashes/utils.js';

if (fs.existsSync(eu) && !fs.readFileSync(eu, 'utf8').includes('anumber')) {
  fs.appendFileSync(
    eu,
    '\nexport const anumber=(n)=>{if(!Number.isSafeInteger(n)||n<0)throw new Error("expected non-negative integer, got "+n);};\n'
  );
  const cjs =
    'Object.defineProperty(exports,"anumber",{enumerable:true,get:function(){return function(n){if(!Number.isSafeInteger(n)||n<0)throw new Error("expected non-negative integer, got "+n);};}});';
  fs.appendFileSync(u, '\n' + cjs + '\n');
}

if (
  fs.existsSync('node_modules/@noble/hashes/package.json') &&
  !fs.existsSync('node_modules/@noble/hashes/esm/sha2.js')
) {
  fs.writeFileSync(
    'node_modules/@noble/hashes/esm/sha2.js',
    'export {sha256,sha224} from "./sha256.js";\nexport {sha512,sha384,sha512_256,sha512_224} from "./sha512.js";\n'
  );
  fs.writeFileSync(
    'node_modules/@noble/hashes/sha2.js',
    '"use strict";Object.defineProperty(exports,"__esModule",{value:true});const s=require("./sha256");const t=require("./sha512");exports.sha256=s.sha256;exports.sha224=s.sha224;exports.sha512=t.sha512;exports.sha384=t.sha384;exports.sha512_256=t.sha512_256;exports.sha512_224=t.sha512_224;\n'
  );
  const pkg = JSON.parse(fs.readFileSync('node_modules/@noble/hashes/package.json', 'utf8'));
  if (!pkg.exports['./sha2']) {
    pkg.exports['./sha2'] = { import: './esm/sha2.js', default: './sha2.js' };
    fs.writeFileSync('node_modules/@noble/hashes/package.json', JSON.stringify(pkg, null, 2));
  }
}
console.log('noble-hashes verified/patched');
