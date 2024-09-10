import{localize as g}from"../../../../nls.js";import{deepClone as b}from"../../../../base/common/objects.js";import{ThemeIcon as F}from"../../../../base/common/themables.js";import{buttonForeground as E,foreground as v}from"../../../../platform/theme/common/colorRegistry.js";import{chartsBlue as D,chartsGreen as V,chartsOrange as R,chartsPurple as N,chartsRed as P,chartsYellow as B}from"../../../../platform/theme/common/colors/chartsColors.js";import{asCssVariable as C,registerColor as I,transparent as k}from"../../../../platform/theme/common/colorUtils.js";import"../common/history.js";import{rot as T}from"../../../../base/common/numbers.js";import{svgElem as _}from"../../../../base/browser/dom.js";const h=22,s=11,G=4,f=5,M=I("scmGraph.historyItemGroupLocal",D,g("scmGraphHistoryItemGroupLocal","Local history item group color.")),re=I("scmGraph.historyItemGroupRemote",N,g("scmGraphHistoryItemGroupRemote","Remote history item group color.")),oe=I("scmGraph.historyItemGroupBase",R,g("scmGraphHistoryItemGroupBase","Base history item group color.")),ne=I("scmGraph.historyItemHoverDefaultLabelForeground",v,g("scmGraphHistoryItemHoverDefaultLabelForeground","History item hover default label foreground color.")),se=I("scmGraph.historyItemHoverDefaultLabelBackground",k(v,.2),g("scmGraphHistoryItemHoverDefaultLabelBackground","History item hover default label background color.")),ie=I("scmGraph.historyItemHoverLabelForeground",E,g("scmGraphHistoryItemHoverLabelForeground","History item hover label foreground color.")),ce=I("scmGraph.historyItemHoverAdditionsForeground","gitDecoration.addedResourceForeground",g("scmGraph.HistoryItemHoverAdditionsForeground","History item hover additions foreground color.")),de=I("scmGraph.historyItemHoverDeletionsForeground","gitDecoration.deletedResourceForeground",g("scmGraph.HistoryItemHoverDeletionsForeground","History item hover deletions foreground color.")),A=[I("scmGraph.foreground1",V,g("scmGraphForeground1","Source control graph foreground color (1).")),I("scmGraph.foreground2",P,g("scmGraphForeground2","Source control graph foreground color (2).")),I("scmGraph.foreground3",B,g("scmGraphForeground3","Source control graph foreground color (3)."))];function w(i,e){for(const o of i.references??[]){const n=e.get(o.id);if(n!==void 0)return n}}function S(i){const e=document.createElementNS("http://www.w3.org/2000/svg","path");return e.setAttribute("fill","none"),e.setAttribute("stroke-width","1px"),e.setAttribute("stroke-linecap","round"),e.style.stroke=C(i),e}function $(i,e,o){const n=document.createElementNS("http://www.w3.org/2000/svg","circle");return n.setAttribute("cx",`${s*(i+1)}`),n.setAttribute("cy",`${s}`),n.setAttribute("r",`${e}`),n.style.fill=C(o),n}function x(i,e,o,n){const p=S(n);return p.setAttribute("d",`M ${i} ${e} V ${o}`),p}function W(i,e){for(let o=i.length-1;o>=0;o--)if(i[o].id===e)return o;return-1}function le(i){const e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.classList.add("graph");const o=i.historyItem,n=i.inputSwimlanes,p=i.outputSwimlanes,l=n.findIndex(r=>r.id===o.id),u=l!==-1?l:n.length,m=u<p.length?p[u].color:u<n.length?n[u].color:M;let a=0;for(let r=0;r<n.length;r++){const c=n[r].color;if(n[r].id===o.id)if(r!==u){const t=[],d=S(c);t.push(`M ${s*(r+1)} 0`),t.push(`A ${s} ${s} 0 0 1 ${s*r} ${s}`),t.push(`H ${s*(u+1)}`),d.setAttribute("d",t.join(" ")),e.append(d)}else a++;else if(a<p.length&&n[r].id===p[a].id){if(r===a){const t=x(s*(r+1),0,h,c);e.append(t)}else{const t=[],d=S(c);t.push(`M ${s*(r+1)} 0`),t.push("V 6"),t.push(`A ${f} ${f} 0 0 1 ${s*(r+1)-f} ${h/2}`),t.push(`H ${s*(a+1)+f}`),t.push(`A ${f} ${f} 0 0 0 ${s*(a+1)} ${h/2+f}`),t.push(`V ${h}`),d.setAttribute("d",t.join(" ")),e.append(d)}a++}}for(let r=1;r<o.parentIds.length;r++){const c=W(p,o.parentIds[r]);if(c===-1)continue;const t=[],d=S(p[c].color);t.push(`M ${s*c} ${h/2}`),t.push(`A ${s} ${s} 0 0 1 ${s*(c+1)} ${h}`),t.push(`M ${s*c} ${h/2}`),t.push(`H ${s*(u+1)} `),d.setAttribute("d",t.join(" ")),e.append(d)}if(l!==-1){const r=x(s*(u+1),0,h/2,n[l].color);e.append(r)}if(o.parentIds.length>0){const r=x(s*(u+1),h/2,h,m);e.append(r)}if(o.parentIds.length>1){const r=$(u,G+1,m);e.append(r);const c=$(u,G-1,m);e.append(c)}else{if(o.references?.some(c=>F.isThemeIcon(c.icon)&&c.icon.id==="target")){const c=$(u,G+2,m);e.append(c)}const r=$(u,G,m);e.append(r)}return e.style.height=`${h}px`,e.style.width=`${s*(Math.max(n.length,p.length,1)+1)}px`,e}function pe(i){const e=_("svg",{style:{height:`${h}px`,width:`${s*(i.length+1)}px`}});for(let o=0;o<i.length;o++){const n=x(s*(o+1),0,h,i[o].color);e.root.append(n)}return e.root}function ue(i,e=new Map){let o=-1;const n=[];for(let p=0;p<i.length;p++){const l=i[p],m=(n.at(-1)?.outputSwimlanes??[]).map(t=>b(t)),a=[];let r=!1;if(l.parentIds.length>0)for(const t of m){if(t.id===l.id){r||(a.push({id:l.parentIds[0],color:w(l,e)??t.color}),r=!0);continue}a.push(b(t))}for(let t=r?1:0;t<l.parentIds.length;t++){let d;if(!r)d=w(l,e);else{const H=i.find(y=>y.id===l.parentIds[t]);d=H?w(H,e):void 0}d||(o=T(o+1,A.length),d=A[o]),a.push({id:l.parentIds[t],color:d})}const c=(l.references??[]).map(t=>{let d=e.get(t.id);if(e.has(t.id)&&d===void 0){const H=m.findIndex(L=>L.id===l.id),y=H!==-1?H:m.length;d=y<a.length?a[y].color:y<m.length?m[y].color:M}return{...t,color:d}});n.push({historyItem:{...l,references:c},inputSwimlanes:m,outputSwimlanes:a})}return n}export{h as SWIMLANE_HEIGHT,s as SWIMLANE_WIDTH,A as colorRegistry,oe as historyItemGroupBase,M as historyItemGroupLocal,re as historyItemGroupRemote,ce as historyItemHoverAdditionsForeground,se as historyItemHoverDefaultLabelBackground,ne as historyItemHoverDefaultLabelForeground,de as historyItemHoverDeletionsForeground,ie as historyItemHoverLabelForeground,pe as renderSCMHistoryGraphPlaceholder,le as renderSCMHistoryItemGraph,ue as toISCMHistoryItemViewModelArray};
