const i=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;function f(a){return i.test(a)}const c=function(){if(typeof crypto=="object"&&typeof crypto.randomUUID=="function")return crypto.randomUUID.bind(crypto);let a;typeof crypto=="object"&&typeof crypto.getRandomValues=="function"?a=crypto.getRandomValues.bind(crypto):a=function(o){for(let n=0;n<o.length;n++)o[n]=Math.floor(Math.random()*256);return o};const t=new Uint8Array(16),e=[];for(let o=0;o<256;o++)e.push(o.toString(16).padStart(2,"0"));return function(){a(t),t[6]=t[6]&15|64,t[8]=t[8]&63|128;let n=0,r="";return r+=e[t[n++]],r+=e[t[n++]],r+=e[t[n++]],r+=e[t[n++]],r+="-",r+=e[t[n++]],r+=e[t[n++]],r+="-",r+=e[t[n++]],r+=e[t[n++]],r+="-",r+=e[t[n++]],r+=e[t[n++]],r+="-",r+=e[t[n++]],r+=e[t[n++]],r+=e[t[n++]],r+=e[t[n++]],r+=e[t[n++]],r+=e[t[n++]],r}}();export{c as generateUuid,f as isUUID};