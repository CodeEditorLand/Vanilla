import{Range as T}from"../../../../editor/common/core/range.js";const C=(s,v,c)=>{let a;if(s[0]===255&&s[1]===254)a=new TextDecoder("utf-16le").decode(s);else if(s[0]===254&&s[1]===255)a=new TextDecoder("utf-16be").decode(s);else if(a=new TextDecoder("utf8").decode(s),a.slice(0,1e3).includes("\uFFFD")&&s.includes(0))return[];const x=[],h=[];let f=null,g=c.remainingResultQuota;for(;g>=0&&(f=v.exec(a));)h.push({matchStartIndex:f.index,matchedText:f[0]}),g--;if(h.length){const m=new Set,w=new Set,e=[],L=t=>a.slice(e[t].start,e[t].end);let l=0,u=null;const S=/\r?\n/g;for(;u=S.exec(a);)e.push({start:l,end:u.index}),l=u.index+u[0].length;l<a.length&&e.push({start:l,end:a.length});let n=0;for(const{matchStartIndex:t,matchedText:p}of h){if(g<0)break;for(;e[n+1]&&t>e[n].end;)n++;let i=n;for(;e[i+1]&&t+p.length>e[i].end;)i++;if(c.surroundingContext)for(let r=Math.max(0,n-c.surroundingContext);r<n;r++)m.add(r);let R="",o=0;for(let r=n;r<=i;r++){let d=L(r);c.previewOptions?.charsPerLine&&d.length>c.previewOptions.charsPerLine&&(o=Math.max(t-e[n].start-20,0),d=d.substr(o,c.previewOptions.charsPerLine)),R+=`${d}
`,w.add(r)}const I=new T(n,t-e[n].start,i,t+p.length-e[i].start),E=new T(0,t-e[n].start-o,i-n,t+p.length-e[i].start-(i===n?o:0)),M={rangeLocations:[{source:I,preview:E}],previewText:R};if(x.push(M),c.surroundingContext)for(let r=i+1;r<=Math.min(i+c.surroundingContext,e.length-1);r++)m.add(r)}for(const t of m)w.has(t)||x.push({text:L(t),lineNumber:t+1})}return x};export{C as getFileResults};
