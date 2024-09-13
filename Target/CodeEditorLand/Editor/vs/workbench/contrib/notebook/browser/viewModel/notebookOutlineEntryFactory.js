var v=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var f=(o,e,t,n)=>{for(var r=n>1?void 0:n?M(e,t):e,i=o.length-1,l;i>=0;i--)(l=o[i])&&(r=(n?l(e,t,r):l(r))||r);return n&&r&&v(e,t,r),r},u=(o,e)=>(t,n)=>e(t,n,o);import{renderMarkdownAsPlaintext as I}from"../../../../../base/browser/markdownRenderer.js";import{ITextModelService as S}from"../../../../../editor/common/services/resolverService.js";import{IOutlineModelService as b}from"../../../../../editor/contrib/documentSymbols/browser/outlineModel.js";import{localize as k}from"../../../../../nls.js";import{createDecorator as w}from"../../../../../platform/instantiation/common/instantiation.js";import{CellKind as h}from"../../common/notebookCommon.js";import{INotebookExecutionStateService as O}from"../../common/notebookExecutionStateService.js";import{OutlineEntry as m}from"./OutlineEntry.js";import{getMarkdownHeadersInCell as C}from"./foldingModel.js";var x=(e=>(e[e.NonHeaderOutlineLevel=7]="NonHeaderOutlineLevel",e))(x||{});function E(o){const e=Array.from(C(o));if(e.length)return e;const t=o.match(/<h([1-6]).*>(.*)<\/h\1>/i);if(t){const n=Number.parseInt(t[1]),r=t[2].trim();e.push({depth:n,text:r})}return e}const K=w("INotebookOutlineEntryFactory");let p=class{constructor(e,t,n){this.executionStateService=e;this.outlineModelService=t;this.textModelService=n}cellOutlineEntryCache={};cachedMarkdownOutlineEntries=new WeakMap;getOutlineEntries(e,t){const n=[],r=e.cellKind===h.Markup;let i=T(e),l=!1;if(r){const a=e.getText().substring(0,1e4),s=this.cachedMarkdownOutlineEntries.get(e),d=s?.alternativeId===e.getAlternativeId()?s.headers:Array.from(E(a));this.cachedMarkdownOutlineEntries.set(e,{alternativeId:e.getAlternativeId(),headers:d});for(const{depth:c,text:y}of d)l=!0,n.push(new m(t++,c,e,y,!1,!1));l||(i=I({value:i}))}if(!l){const a=!r&&this.executionStateService.getCellExecution(e.uri);let s=i.trim();if(!r){const d=this.cellOutlineEntryCache[e.id];d&&(n.push(new m(t++,7,e,s,!!a,a?a.isPaused:!1)),d.forEach(c=>{n.push(new m(t++,c.level,e,c.name,!1,!1,c.range,c.kind))}))}n.length===0&&(s.length===0&&(s=k("empty","empty cell")),n.push(new m(t++,7,e,s,!!a,a?a.isPaused:!1)))}return n}async cacheSymbols(e,t){if(e.cellKind===h.Markup)return;const n=await this.textModelService.createModelReference(e.uri);try{const r=n.object.textEditorModel,i=await this.outlineModelService.getOrCreate(r,t),l=g(i.getTopLevelSymbols(),8);this.cellOutlineEntryCache[e.id]=l}finally{n.dispose()}}};p=f([u(0,O),u(1,b),u(2,S)],p);function g(o,e){const t=[];return o.forEach(n=>{t.push({name:n.name,range:n.range,level:e,kind:n.kind}),n.children&&t.push(...g(n.children,e+1))}),t}function T(o){const e=o.textBuffer;for(let t=0;t<e.getLineCount();t++){const n=e.getLineFirstNonWhitespaceColumn(t+1),r=e.getLineLength(t+1);if(n<r)return e.getLineContent(t+1)}return o.getText().substring(0,100)}export{K as INotebookOutlineEntryFactory,x as NotebookOutlineConstants,p as NotebookOutlineEntryFactory};
