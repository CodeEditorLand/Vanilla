var I=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var v=(l,a,e,t)=>{for(var o=t>1?void 0:t?T(a,e):a,i=l.length-1,s;i>=0;i--)(s=l[i])&&(o=(t?s(a,e,o):s(o))||o);return t&&o&&I(a,e,o),o},L=(l,a)=>(e,t)=>a(e,t,l);import*as d from"../../../../../../vs/base/browser/dom.js";import{StandardMouseEvent as x}from"../../../../../../vs/base/browser/mouseEvent.js";import{EventType as N}from"../../../../../../vs/base/browser/touch.js";import{Delayer as H}from"../../../../../../vs/base/common/async.js";import{Emitter as _}from"../../../../../../vs/base/common/event.js";import{Disposable as O,DisposableStore as w}from"../../../../../../vs/base/common/lifecycle.js";import{ThemeIcon as F}from"../../../../../../vs/base/common/themables.js";import{foldingCollapsedIcon as R,foldingExpandedIcon as A}from"../../../../../../vs/editor/contrib/folding/browser/foldingDecorations.js";import{MenuId as V}from"../../../../../../vs/platform/actions/common/actions.js";import{IContextMenuService as K}from"../../../../../../vs/platform/contextview/browser/contextView.js";import{IInstantiationService as j}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{FoldingController as z}from"../../../../../../vs/workbench/contrib/notebook/browser/controller/foldingController.js";import"../../../../../../vs/workbench/contrib/notebook/browser/controller/sectionActions.js";import{CellFoldingState as C}from"../../../../../../vs/workbench/contrib/notebook/browser/notebookBrowser.js";import"../../../../../../vs/workbench/contrib/notebook/browser/notebookOptions.js";import"../../../../../../vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon.js";import"../../../../../../vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel.js";import"../../../../../../vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSource.js";import{INotebookCellOutlineDataSourceFactory as P}from"../../../../../../vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSourceFactory.js";import"../../../../../../vs/workbench/contrib/notebook/browser/viewModel/OutlineEntry.js";import{CellKind as m}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";class S extends O{constructor(e,t,o,i,s){super();this.element=e;this.foldingIcon=t;this.header=o;this.entry=i;this.notebookEditor=s;this._register(d.addDisposableListener(this.header,d.EventType.CLICK||N.Tap,()=>{this.focusCell()})),this._register(d.addDisposableListener(this.foldingIcon.domNode,d.EventType.CLICK||N.Tap,()=>{if(this.entry.cell.cellKind===m.Markup){const n=this.entry.cell.foldingState;this.toggleFoldRange(n)}}))}toggleFoldRange(e){const t=this.notebookEditor.getContribution(z.id),o=this.entry.index,i=this.entry.level,s=e===C.Collapsed?C.Expanded:C.Collapsed;t.setFoldingStateDown(o,s,i),this.focusCell()}focusCell(){this.notebookEditor.focusNotebookCell(this.entry.cell,"container");const e=this.notebookEditor.getAbsoluteTopOfElement(this.entry.cell),t=S.getParentCount(this.entry);this.notebookEditor.setScrollTop(e-(t+1.1)*22)}static getParentCount(e){let t=0;for(;e.parent;)t++,e=e.parent;return t}}class B{constructor(a,e){this.isCollapsed=a;this.dimension=e;this.domNode=document.createElement("div"),this.domNode.style.width=`${e}px`,this.domNode.style.height=`${e}px`,this.domNode.className=F.asClassName(a?R:A)}domNode;setVisible(a){this.domNode.style.cursor=a?"pointer":"default",this.domNode.style.opacity=a?"1":"0"}}let c=class extends O{constructor(e,t,o,i,s,n){super();this.domNode=e;this.notebookEditor=t;this.notebookCellList=o;this.layoutFn=i;this._contextMenuService=s;this.instantiationService=n;this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled&&this.init(),this._register(this.notebookEditor.notebookOptions.onDidChangeOptions(r=>{(r.stickyScrollEnabled||r.stickyScrollMode)&&this.updateConfig(r)})),this._register(d.addDisposableListener(this.domNode,d.EventType.CONTEXT_MENU,async r=>{this.onContextMenu(r)}))}_disposables=new w;currentStickyLines=new Map;_onDidChangeNotebookStickyScroll=this._register(new _);onDidChangeNotebookStickyScroll=this._onDidChangeNotebookStickyScroll.event;notebookCellOutlineReference;_layoutDisposableStore=this._register(new w);getDomNode(){return this.domNode}getCurrentStickyHeight(){let e=0;return this.currentStickyLines.forEach(t=>{t.rendered&&(e+=22)}),e}setCurrentStickyLines(e){this.currentStickyLines=e}compareStickyLineMaps(e,t){if(e.size!==t.size)return!1;for(const[o,i]of e){const s=t.get(o);if(!s||i.rendered!==s.rendered)return!1}return!0}onContextMenu(e){const t=new x(d.getWindow(this.domNode),e),o=t.target.parentElement,i=Array.from(this.currentStickyLines.values()).find(n=>n.line.element.contains(o))?.line.entry;if(!i)return;const s={outlineEntry:i,notebookEditor:this.notebookEditor};this._contextMenuService.showContextMenu({menuId:V.NotebookStickyScrollContext,getAnchor:()=>t,menuActionOptions:{shouldForwardArgs:!0,arg:s}})}updateConfig(e){e.stickyScrollEnabled?this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled?this.init():(this._disposables.clear(),this.notebookCellOutlineReference?.dispose(),this.disposeCurrentStickyLines(),d.clearNode(this.domNode),this.updateDisplay()):e.stickyScrollMode&&this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled&&this.notebookCellOutlineReference?.object&&this.updateContent(b(this.notebookEditor,this.notebookCellList,this.notebookCellOutlineReference?.object?.entries,this.getCurrentStickyHeight()))}init(){const{object:e}=this.notebookCellOutlineReference=this.instantiationService.invokeFunction(t=>t.get(P).getOrCreate(this.notebookEditor));this._register(this.notebookCellOutlineReference),this.updateContent(b(this.notebookEditor,this.notebookCellList,e.entries,this.getCurrentStickyHeight())),this._disposables.add(e.onDidChange(()=>{const t=b(this.notebookEditor,this.notebookCellList,e.entries,this.getCurrentStickyHeight());this.compareStickyLineMaps(t,this.currentStickyLines)||this.updateContent(t)})),this._disposables.add(this.notebookEditor.onDidAttachViewModel(()=>{this.updateContent(b(this.notebookEditor,this.notebookCellList,e.entries,this.getCurrentStickyHeight()))})),this._disposables.add(this.notebookEditor.onDidScroll(()=>{const t=new H(100);t.trigger(()=>{t.dispose();const o=b(this.notebookEditor,this.notebookCellList,e.entries,this.getCurrentStickyHeight());this.compareStickyLineMaps(o,this.currentStickyLines)||this.updateContent(o)})}))}static getVisibleOutlineEntry(e,t){let o=0,i=t.length-1,s=-1;for(;o<=i;){const n=Math.floor((o+i)/2);if(t[n].index===e){s=n;break}else t[n].index<e?(s=n,o=n+1):i=n-1}if(s!==-1){const n=t[s],r=[];return n.asFlatList(r),r.find(E=>E.index===e)}}updateContent(e){d.clearNode(this.domNode),this.disposeCurrentStickyLines(),this.renderStickyLines(e,this.domNode);const t=this.getCurrentStickyHeight();this.setCurrentStickyLines(e);const o=this.getCurrentStickyHeight()-t;if(o!==0){this._onDidChangeNotebookStickyScroll.fire(o);const i=this._layoutDisposableStore.add(d.scheduleAtNextAnimationFrame(d.getWindow(this.getDomNode()),()=>{this.layoutFn(o),this.updateDisplay(),this._layoutDisposableStore.delete(i)}))}else this.updateDisplay()}updateDisplay(){this.getCurrentStickyHeight()>0?this.domNode.style.display="block":this.domNode.style.display="none"}static computeStickyHeight(e){let t=0;for(e.cell.cellKind===m.Markup&&e.level<7&&(t+=22);e.parent;)t+=22,e=e.parent;return t}static checkCollapsedStickyLines(e,t,o){let i=e;const s=new Map,n=[];for(;i;){if(i.level>=7){i=i.parent;continue}const r=c.createStickyElement(i,o);s.set(i,{line:r,rendered:!1}),n.unshift(r),i=i.parent}for(let r=0;r<n.length&&!(r>=t);r++)s.set(n[r].entry,{line:n[r],rendered:!0});return s}renderStickyLines(e,t){const o=Array.from(e.entries()).reverse();for(const[,i]of o)i.rendered&&t.append(i.line.element)}static createStickyElement(e,t){const o=document.createElement("div");o.classList.add("notebook-sticky-scroll-element"),t.notebookOptions.getLayoutConfiguration().stickyScrollMode==="indented"&&(o.style.paddingLeft=S.getParentCount(e)*10+"px");let s=!1;e.cell.cellKind===m.Markup&&(s=e.cell.foldingState===C.Collapsed);const n=new B(s,16);n.domNode.classList.add("notebook-sticky-scroll-folding-icon"),n.setVisible(!0);const r=document.createElement("div");return r.classList.add("notebook-sticky-scroll-header"),r.innerText=e.label,o.append(n.domNode,r),new S(o,n,r,e,t)}disposeCurrentStickyLines(){this.currentStickyLines.forEach(e=>{e.line.dispose()})}dispose(){this._disposables.dispose(),this.disposeCurrentStickyLines(),this.notebookCellOutlineReference?.dispose(),super.dispose()}};c=v([L(4,K),L(5,j)],c);function b(l,a,e,t){const o=l.scrollTop-t,i=l.visibleRanges[0];if(!i)return new Map;if(i.start===0){const p=l.cellAt(0),u=c.getVisibleOutlineEntry(0,e);if(p&&u&&p.cellKind===m.Markup&&u.level<7&&l.scrollTop>22)return c.checkCollapsedStickyLines(u,100,l)}let s,n;const r=i.start-1;for(let p=r;p<i.end;p++){if(s=l.cellAt(p),!s)return new Map;if(n=c.getVisibleOutlineEntry(p,e),!n)continue;const u=l.cellAt(p+1);if(!u){const y=l.getLayoutInfo().scrollHeight,k=Math.floor(y/22);return c.checkCollapsedStickyLines(n,k,l)}const h=c.getVisibleOutlineEntry(p+1,e);if(h&&u.cellKind===m.Markup&&h.level<7){const y=a.getCellViewScrollTop(u),k=c.computeStickyHeight(n),g=c.computeStickyHeight(h);if(o+k<y){const f=Math.floor((y-o)/22);return c.checkCollapsedStickyLines(n,f,l)}else{if(g>=k)return c.checkCollapsedStickyLines(h,100,l);if(g<k){const f=y-o;if(f>=g){const M=Math.floor(f/22);return c.checkCollapsedStickyLines(n,M,l)}else return c.checkCollapsedStickyLines(h,100,l)}}}}const E=l.getLayoutInfo().scrollHeight,D=Math.floor((E-o)/22);return c.checkCollapsedStickyLines(n,D,l)}export{S as NotebookStickyLine,c as NotebookStickyScroll,b as computeContent};