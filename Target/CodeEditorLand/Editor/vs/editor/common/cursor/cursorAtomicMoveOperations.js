import{CharCode as c}from"../../../base/common/charCode.js";import{CursorColumns as f}from"../core/cursorColumns.js";var C=(e=>(e[e.Left=0]="Left",e[e.Right=1]="Right",e[e.Nearest=2]="Nearest",e))(C||{});class p{static whitespaceVisibleColumn(s,a,e){const b=s.length;let r=0,o=-1,u=-1;for(let t=0;t<b;t++){if(t===a)return[o,u,r];switch(r%e===0&&(o=t,u=r),s.charCodeAt(t)){case c.Space:r+=1;break;case c.Tab:r=f.nextRenderTabStop(r,e);break;default:return[-1,-1,-1]}}return a===b?[o,u,r]:[-1,-1,-1]}static atomicPosition(s,a,e,b){const r=s.length,[o,u,t]=p.whitespaceVisibleColumn(s,a,e);if(t===-1)return-1;let l;switch(b){case 0:l=!0;break;case 1:l=!1;break;case 2:if(t%e===0)return a;l=t%e<=e/2;break}if(l){if(o===-1)return-1;let n=u;for(let m=o;m<r;++m){if(n===u+e)return o;switch(s.charCodeAt(m)){case c.Space:n+=1;break;case c.Tab:n=f.nextRenderTabStop(n,e);break;default:return-1}}return n===u+e?o:-1}const h=f.nextRenderTabStop(t,e);let i=t;for(let n=a;n<r;n++){if(i===h)return n;switch(s.charCodeAt(n)){case c.Space:i+=1;break;case c.Tab:i=f.nextRenderTabStop(i,e);break;default:return-1}}return i===h?r:-1}}export{p as AtomicTabMoveOperations,C as Direction};
