import"../../../base/browser/fastDomNode.js";import{ViewEventHandler as c}from"../../common/viewEventHandler.js";import"../../common/viewModel/viewContext.js";import"./renderingContext.js";class f extends c{_context;constructor(t){super(),this._context=t,this._context.addEventHandler(this)}dispose(){this._context.removeEventHandler(this),super.dispose()}}var m=(e=>(e[e.None=0]="None",e[e.ContentWidgets=1]="ContentWidgets",e[e.OverflowingContentWidgets=2]="OverflowingContentWidgets",e[e.OverflowGuard=3]="OverflowGuard",e[e.OverlayWidgets=4]="OverlayWidgets",e[e.OverflowingOverlayWidgets=5]="OverflowingOverlayWidgets",e[e.ScrollableElement=6]="ScrollableElement",e[e.TextArea=7]="TextArea",e[e.ViewLines=8]="ViewLines",e[e.Minimap=9]="Minimap",e))(m||{});class p{static write(t,o){t.setAttribute("data-mprt",String(o))}static read(t){const o=t.getAttribute("data-mprt");return o===null?0:parseInt(o,10)}static collect(t,o){const l=[];let s=0;for(;t&&t!==t.ownerDocument.body&&t!==o;)t.nodeType===t.ELEMENT_NODE&&(l[s++]=this.read(t)),t=t.parentElement;const r=new Uint8Array(s);for(let n=0;n<s;n++)r[n]=l[s-n-1];return r}}export{m as PartFingerprint,p as PartFingerprints,f as ViewPart};
