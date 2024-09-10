const t={exports:{}};(function(){function c(){const p=/("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;function s(n){return n.replace(p,function(e,f,o,l,r,a){if(l)return"";if(r){const i=r.length;return r[i-1]===`
`?r[i-2]==="\r"?`\r
`:`
`:""}else return a?e.substring(1):e})}function u(n){const e=s(n);try{return JSON.parse(e)}catch{const o=e.replace(/,\s*([}\]])/g,"$1");return JSON.parse(o)}}return{stripComments:s,parse:u}}typeof t=="object"&&typeof t.exports=="object"?t.exports=c():console.trace("jsonc defined in UNKNOWN context (neither requirejs or commonjs)")})();const x=t.exports.stripComments,d=t.exports.parse;export{d as parse,x as stripComments};
