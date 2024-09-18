import{Color as p,RGBA as v}from"../../../../base/common/color.js";import"../../../../platform/workspace/common/workspace.js";import{ansiColorIdentifiers as I}from"../../terminal/common/terminalColorRegistry.js";import"./linkDetector.js";function H(i,d,s){const u=document.createElement("span"),k=i.length;let n=[],a,f,l,m=!1,o=0,h="";for(;o<k;){let r=!1;if(i.charCodeAt(o)===27&&i.charAt(o+1)==="["){const t=o;o+=2;let e="";for(;o<k;){const c=i.charAt(o);if(e+=c,o++,c.match(/^[ABCDHIJKfhmpsu]$/)){r=!0;break}}if(r){if(S(u,h,n,d,s,a,f,l),h="",e.match(/^(?:[34][0-8]|9[0-7]|10[0-7]|[0-9]|2[1-5,7-9]|[34]9|5[8,9]|1[0-9])(?:;[349][0-7]|10[0-7]|[013]|[245]|[34]9)?(?:;[012]?[0-9]?[0-9])*;?m$/)){const c=e.slice(0,-1).split(";").filter(g=>g!=="").map(g=>parseInt(g,10));if(c[0]===38||c[0]===48||c[0]===58){const g=c[0]===38?"foreground":c[0]===48?"background":"underline";c[1]===5?F(c,g):c[1]===2&&R(c,g)}else G(c)}}else o=t}r===!1&&(h+=i.charAt(o),o++)}return h&&S(u,h,n,d,s,a,f,l),u;function b(r,t){r==="foreground"?a=t:r==="background"?f=t:r==="underline"&&(l=t),n=n.filter(e=>e!==`code-${r}-colored`),t!==void 0&&n.push(`code-${r}-colored`)}function A(){const r=a;b("foreground",f),b("background",r)}function G(r){for(const t of r)switch(t){case 0:{n=[],a=void 0,f=void 0;break}case 1:{n=n.filter(e=>e!=="code-bold"),n.push("code-bold");break}case 2:{n=n.filter(e=>e!=="code-dim"),n.push("code-dim");break}case 3:{n=n.filter(e=>e!=="code-italic"),n.push("code-italic");break}case 4:{n=n.filter(e=>e!=="code-underline"&&e!=="code-double-underline"),n.push("code-underline");break}case 5:{n=n.filter(e=>e!=="code-blink"),n.push("code-blink");break}case 6:{n=n.filter(e=>e!=="code-rapid-blink"),n.push("code-rapid-blink");break}case 7:{m||(m=!0,A());break}case 8:{n=n.filter(e=>e!=="code-hidden"),n.push("code-hidden");break}case 9:{n=n.filter(e=>e!=="code-strike-through"),n.push("code-strike-through");break}case 10:{n=n.filter(e=>!e.startsWith("code-font"));break}case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:case 19:case 20:{n=n.filter(e=>!e.startsWith("code-font")),n.push(`code-font-${t-10}`);break}case 21:{n=n.filter(e=>e!=="code-underline"&&e!=="code-double-underline"),n.push("code-double-underline");break}case 22:{n=n.filter(e=>e!=="code-bold"&&e!=="code-dim");break}case 23:{n=n.filter(e=>e!=="code-italic"&&e!=="code-font-10");break}case 24:{n=n.filter(e=>e!=="code-underline"&&e!=="code-double-underline");break}case 25:{n=n.filter(e=>e!=="code-blink"&&e!=="code-rapid-blink");break}case 27:{m&&(m=!1,A());break}case 28:{n=n.filter(e=>e!=="code-hidden");break}case 29:{n=n.filter(e=>e!=="code-strike-through");break}case 53:{n=n.filter(e=>e!=="code-overline"),n.push("code-overline");break}case 55:{n=n.filter(e=>e!=="code-overline");break}case 39:{b("foreground",void 0);break}case 49:{b("background",void 0);break}case 59:{b("underline",void 0);break}case 73:{n=n.filter(e=>e!=="code-superscript"&&e!=="code-subscript"),n.push("code-superscript");break}case 74:{n=n.filter(e=>e!=="code-superscript"&&e!=="code-subscript"),n.push("code-subscript");break}case 75:{n=n.filter(e=>e!=="code-superscript"&&e!=="code-subscript");break}default:{B(t);break}}}function R(r,t){if(r.length>=5&&r[2]>=0&&r[2]<=255&&r[3]>=0&&r[3]<=255&&r[4]>=0&&r[4]<=255){const e=new v(r[2],r[3],r[4]);b(t,e)}}function F(r,t){let e=r[2];const c=$(e);if(c)b(t,c);else if(e>=0&&e<=15){if(t==="underline"){const g=I[e];b(t,`--vscode-treminal-${g}`);return}e+=30,e>=38&&(e+=52),t==="background"&&(e+=10),B(e)}}function B(r){let t,e;if(r>=30&&r<=37?(e=r-30,t="foreground"):r>=90&&r<=97?(e=r-90+8,t="foreground"):r>=40&&r<=47?(e=r-40,t="background"):r>=100&&r<=107&&(e=r-100+8,t="background"),e!==void 0&&t){const c=I[e];b(t,`--vscode-${c.replaceAll(".","-")}`)}}}function S(i,d,s,u,k,n,a,f){if(!i||!d)return;const l=u.linkify(d,!0,k);l.className=s.join(" "),n&&(l.style.color=typeof n=="string"?`var(${n})`:p.Format.CSS.formatRGB(new p(n))),a&&(l.style.backgroundColor=typeof a=="string"?`var(${a})`:p.Format.CSS.formatRGB(new p(a))),f&&(l.style.textDecorationColor=typeof f=="string"?`var(${f})`:p.Format.CSS.formatRGB(new p(f))),i.appendChild(l)}function $(i){if(i%1===0)if(i>=16&&i<=231){i-=16;let d=i%6;i=(i-d)/6;let s=i%6;i=(i-s)/6;let u=i;const k=255/5;return d=Math.round(d*k),s=Math.round(s*k),u=Math.round(u*k),new v(u,s,d)}else if(i>=232&&i<=255){i-=232;const d=Math.round(i/23*255);return new v(d,d,d)}else return}export{S as appendStylizedStringToContainer,$ as calcANSI8bitColor,H as handleANSIOutput};
