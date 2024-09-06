import{Color as h,RGBA as v}from"../../../../../vs/base/common/color.js";import"../../../../../vs/platform/theme/common/themeService.js";import"../../../../../vs/platform/workspace/common/workspace.js";import"../../../../../vs/workbench/contrib/debug/browser/linkDetector.js";import{ansiColorIdentifiers as I}from"../../../../../vs/workbench/contrib/terminal/common/terminalColorRegistry.js";function j(i,d,f,b){const s=document.createElement("span"),g=i.length;let r=[],k,t,A,m=!1,a=0,p="";for(;a<g;){let n=!1;if(i.charCodeAt(a)===27&&i.charAt(a+1)==="["){const c=a;a+=2;let e="";for(;a<g;){const o=i.charAt(a);if(e+=o,a++,o.match(/^[ABCDHIJKfhmpsu]$/)){n=!0;break}}if(n){if(F(s,p,r,d,b,k,t,A),p="",e.match(/^(?:[34][0-8]|9[0-7]|10[0-7]|[0-9]|2[1-5,7-9]|[34]9|5[8,9]|1[0-9])(?:;[349][0-7]|10[0-7]|[013]|[245]|[34]9)?(?:;[012]?[0-9]?[0-9])*;?m$/)){const o=e.slice(0,-1).split(";").filter(u=>u!=="").map(u=>parseInt(u,10));if(o[0]===38||o[0]===48||o[0]===58){const u=o[0]===38?"foreground":o[0]===48?"background":"underline";o[1]===5?M(o,u):o[1]===2&&L(o,u)}else w(o)}}else a=c}n===!1&&(p+=i.charAt(a),a++)}return p&&F(s,p,r,d,b,k,t,A),s;function l(n,c){n==="foreground"?k=c:n==="background"?t=c:n==="underline"&&(A=c),r=r.filter(e=>e!==`code-${n}-colored`),c!==void 0&&r.push(`code-${n}-colored`)}function S(){const n=k;l("foreground",t),l("background",n)}function w(n){for(const c of n)switch(c){case 0:{r=[],k=void 0,t=void 0;break}case 1:{r=r.filter(e=>e!=="code-bold"),r.push("code-bold");break}case 2:{r=r.filter(e=>e!=="code-dim"),r.push("code-dim");break}case 3:{r=r.filter(e=>e!=="code-italic"),r.push("code-italic");break}case 4:{r=r.filter(e=>e!=="code-underline"&&e!=="code-double-underline"),r.push("code-underline");break}case 5:{r=r.filter(e=>e!=="code-blink"),r.push("code-blink");break}case 6:{r=r.filter(e=>e!=="code-rapid-blink"),r.push("code-rapid-blink");break}case 7:{m||(m=!0,S());break}case 8:{r=r.filter(e=>e!=="code-hidden"),r.push("code-hidden");break}case 9:{r=r.filter(e=>e!=="code-strike-through"),r.push("code-strike-through");break}case 10:{r=r.filter(e=>!e.startsWith("code-font"));break}case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:case 19:case 20:{r=r.filter(e=>!e.startsWith("code-font")),r.push(`code-font-${c-10}`);break}case 21:{r=r.filter(e=>e!=="code-underline"&&e!=="code-double-underline"),r.push("code-double-underline");break}case 22:{r=r.filter(e=>e!=="code-bold"&&e!=="code-dim");break}case 23:{r=r.filter(e=>e!=="code-italic"&&e!=="code-font-10");break}case 24:{r=r.filter(e=>e!=="code-underline"&&e!=="code-double-underline");break}case 25:{r=r.filter(e=>e!=="code-blink"&&e!=="code-rapid-blink");break}case 27:{m&&(m=!1,S());break}case 28:{r=r.filter(e=>e!=="code-hidden");break}case 29:{r=r.filter(e=>e!=="code-strike-through");break}case 53:{r=r.filter(e=>e!=="code-overline"),r.push("code-overline");break}case 55:{r=r.filter(e=>e!=="code-overline");break}case 39:{l("foreground",void 0);break}case 49:{l("background",void 0);break}case 59:{l("underline",void 0);break}case 73:{r=r.filter(e=>e!=="code-superscript"&&e!=="code-subscript"),r.push("code-superscript");break}case 74:{r=r.filter(e=>e!=="code-superscript"&&e!=="code-subscript"),r.push("code-subscript");break}case 75:{r=r.filter(e=>e!=="code-superscript"&&e!=="code-subscript");break}default:{G(c);break}}}function L(n,c){if(n.length>=5&&n[2]>=0&&n[2]<=255&&n[3]>=0&&n[3]<=255&&n[4]>=0&&n[4]<=255){const e=new v(n[2],n[3],n[4]);l(c,e)}}function M(n,c){let e=n[2];const o=W(e);if(o)l(c,o);else if(e>=0&&e<=15){if(c==="underline"){const u=f.getColorTheme(),B=I[e],R=u.getColor(B);R&&l(c,R.rgba);return}e+=30,e>=38&&(e+=52),c==="background"&&(e+=10),G(e)}}function G(n){const c=f.getColorTheme();let e,o;if(n>=30&&n<=37?(o=n-30,e="foreground"):n>=90&&n<=97?(o=n-90+8,e="foreground"):n>=40&&n<=47?(o=n-40,e="background"):n>=100&&n<=107&&(o=n-100+8,e="background"),o!==void 0&&e){const u=I[o],B=c.getColor(u);B&&l(e,B.rgba)}}}function F(i,d,f,b,s,g,r,k){if(!i||!d)return;const t=b.linkify(d,!0,s);t.className=f.join(" "),g&&(t.style.color=h.Format.CSS.formatRGB(new h(g))),r&&(t.style.backgroundColor=h.Format.CSS.formatRGB(new h(r))),k&&(t.style.textDecorationColor=h.Format.CSS.formatRGB(new h(k))),i.appendChild(t)}function W(i){if(i%1===0)if(i>=16&&i<=231){i-=16;let d=i%6;i=(i-d)/6;let f=i%6;i=(i-f)/6;let b=i;const s=255/5;return d=Math.round(d*s),f=Math.round(f*s),b=Math.round(b*s),new v(b,f,d)}else if(i>=232&&i<=255){i-=232;const d=Math.round(i/23*255);return new v(d,d,d)}else return}export{F as appendStylizedStringToContainer,W as calcANSI8bitColor,j as handleANSIOutput};