const r={exports:{}};(()=>{function c(){const p=/("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^/*]*(?:(?:\*|\/)[^/*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;function s(n){return n.replace(p,(e,u,o,l,t,a)=>{if(l)return"";if(t){const i=t.length;return t[i-1]===`
`?t[i-2]==="\r"?`\r
`:`
`:""}else return a?e.substring(1):e})}function f(n){const e=s(n);try{return JSON.parse(e)}catch{const o=e.replace(/,\s*([}\]])/g,"$1");return JSON.parse(o)}}return{stripComments:s,parse:f}}typeof r=="object"&&typeof r.exports=="object"&&(r.exports=c())})();const x=r.exports.stripComments,d=r.exports.parse;export{d as parse,x as stripComments};
