function m(c,a,l){const n=p(c);let e=n.next();for(;e!==null;){let t=0;if(e.length===2&&e.charAt(1)===":"){switch(e.charAt(0)){case"R":t=1;break;case"L":t=-1;break;default:}e=n.next()}const r=h();if(r&&l.push({matcher:r,priority:t}),e!==",")break;e=n.next()}function u(){if(e==="-"){e=n.next();const t=u();return t?r=>t(r)<0?0:-1:null}if(e==="("){e=n.next();const t=x();return e===")"&&(e=n.next()),t}if(f(e)){const t=[];do t.push(e),e=n.next();while(f(e));return r=>a(t,r)}return null}function h(){let t=u();if(!t)return null;const r=[];for(;t;)r.push(t),t=u();return o=>{let i=r[0](o);for(let s=1;i>=0&&s<r.length;s++)i=Math.min(i,r[s](o));return i}}function x(){let t=h();if(!t)return null;const r=[];for(;t&&(r.push(t),e==="|"||e===",");){do e=n.next();while(e==="|"||e===",");t=h()}return o=>{let i=r[0](o);for(let s=1;s<r.length;s++)i=Math.max(i,r[s](o));return i}}}function f(c){return!!c&&!!c.match(/[\w.:]+/)}function p(c){const a=/([LR]:|[\w.:][\w.:-]*|[,|\-()])/g;let l=a.exec(c);return{next:()=>{if(!l)return null;const n=l[0];return l=a.exec(c),n}}}export{m as createMatchers};
