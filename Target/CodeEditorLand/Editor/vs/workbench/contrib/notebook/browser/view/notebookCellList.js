var Q=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var $=(m,h,e,t)=>{for(var i=t>1?void 0:t?X(h,e):h,o=m.length-1,n;o>=0;o--)(n=m[o])&&(i=(t?n(h,e,i):n(i))||i);return t&&i&&Q(h,e,i),i},I=(m,h)=>(e,t)=>h(e,t,m);import*as g from"../../../../../base/browser/dom.js";import{ListError as H}from"../../../../../base/browser/ui/list/list.js";import{Emitter as M,Event as N}from"../../../../../base/common/event.js";import{Disposable as z,DisposableStore as U,MutableDisposable as W}from"../../../../../base/common/lifecycle.js";import{isMacintosh as ee}from"../../../../../base/common/platform.js";import{TrackedRangeStickiness as Z}from"../../../../../editor/common/model.js";import{PrefixSumComputer as te}from"../../../../../editor/common/model/prefixSumComputer.js";import{IConfigurationService as ie}from"../../../../../platform/configuration/common/configuration.js";import{IListService as oe,WorkbenchList as ne}from"../../../../../platform/list/browser/listService.js";import{CursorAtBoundary as B,CellEditState as K,CellFocusMode as le,CellRevealType as f,CellRevealRangeType as A,CursorAtLineBoundary as D}from"../notebookBrowser.js";import{diff as j,NOTEBOOK_EDITOR_CURSOR_BOUNDARY as se,CellKind as F,SelectionStateType as S,NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY as re}from"../../common/notebookCommon.js";import{cellRangesToIndexes as Y,reduceCellRanges as y,cellRangesEqual as ae}from"../../common/notebookRange.js";import{NOTEBOOK_CELL_LIST_FOCUSED as de}from"../../common/notebookContextKeys.js";import{clamp as C}from"../../../../../base/common/numbers.js";import{FastDomNode as ce}from"../../../../../base/browser/fastDomNode.js";import{MarkupCellViewModel as he}from"../viewModel/markupCellViewModel.js";import{IInstantiationService as ue}from"../../../../../platform/instantiation/common/instantiation.js";import{NotebookCellListView as me}from"./notebookCellListView.js";import{INotebookExecutionStateService as we}from"../../common/notebookExecutionStateService.js";import{NotebookCellAnchor as pe}from"./notebookCellAnchor.js";import{NotebookViewZones as ge}from"../viewParts/notebookViewZones.js";var ve=(i=>(i[i.Top=0]="Top",i[i.Center=1]="Center",i[i.Bottom=2]="Bottom",i[i.NearTop=3]="NearTop",i))(ve||{});function P(m,h){if(!h.length)return m;let e=0,t=0;const i=[];for(;e<m.length&&t<h.length;)e<h[t].start&&i.push(...m.slice(e,h[t].start)),e=h[t].end+1,t++;return e<m.length&&i.push(...m.slice(e)),i}const L=5e3;function fe(m){const h=0-(parseInt(m.style.top,10)||0);return h>=0&&h<=L*2}let R=class extends ne{constructor(e,t,i,o,n,l,r,s,d,c,a){super(e,t,o,n,r,l,s,d,c);this.listUser=e;this.notebookOptions=i;de.bindTo(this.contextKeyService).set(!0),this._previousFocusedElements=this.getFocusedElements(),this._localDisposableStore.add(this.onDidChangeFocus(u=>{this._previousFocusedElements.forEach(w=>{u.elements.indexOf(w)<0&&w.onDeselect()}),this._previousFocusedElements=u.elements}));const p=se.bindTo(l);p.set("none");const v=re.bindTo(l);v.set("none");const T=this._localDisposableStore.add(new W),G=this._localDisposableStore.add(new W);this._notebookCellAnchor=new pe(a,d,this.onDidScroll);const E=u=>{switch(u.cursorAtBoundary()){case B.Both:p.set("both");break;case B.Top:p.set("top");break;case B.Bottom:p.set("bottom");break;default:p.set("none");break}switch(u.cursorAtLineBoundary()){case D.Both:v.set("both");break;case D.Start:v.set("start");break;case D.End:v.set("end");break;default:v.set("none");break}};this._localDisposableStore.add(this.onDidChangeFocus(u=>{if(u.elements.length){const w=u.elements[0];T.value=w.onDidChangeState(b=>{b.selectionChanged&&E(w)}),G.value=w.onDidChangeEditorAttachState(()=>{w.editorAttached&&E(w)}),E(w);return}p.set("none")})),this._localDisposableStore.add(this.view.onMouseDblClick(()=>{const u=this.getFocusedElements()[0];if(u&&u.cellKind===F.Markup&&!u.isInputCollapsed&&!this._viewModel?.options.isReadOnly){const w=this._getViewIndexUpperBound(u);w>=0&&this._revealInViewWithMinimalScrolling(w),u.updateEditState(K.Editing,"dbclick"),u.focusMode=le.Editor}}));const _=()=>{if(!this.view.length)return;const u=this.getViewScrollTop(),w=this.getViewScrollBottom();if(u>=w)return;const b=C(this.view.indexAt(u),0,this.view.length-1),q=this.view.element(b),x=this._viewModel.getCellIndex(q),k=C(this.view.indexAt(w),0,this.view.length-1),J=this.view.element(k),O=this._viewModel.getCellIndex(J);O-x===k-b?this.visibleRanges=[{start:x,end:O+1}]:this.visibleRanges=this._getVisibleRangesFromIndex(b,x,k,O)};this._localDisposableStore.add(this.view.onDidChangeContentHeight(()=>{this._isInLayout&&g.scheduleAtNextAnimationFrame(g.getWindow(t),()=>{_()}),_()})),this._localDisposableStore.add(this.view.onDidScroll(()=>{this._isInLayout&&g.scheduleAtNextAnimationFrame(g.getWindow(t),()=>{_()}),_()}))}view;viewZones;get onWillScroll(){return this.view.onWillScroll}get rowsContainer(){return this.view.containerDomNode}get scrollableElement(){return this.view.scrollableElementDomNode}_previousFocusedElements=[];_localDisposableStore=new U;_viewModelStore=new U;styleElement;_notebookCellAnchor;_onDidRemoveOutputs=this._localDisposableStore.add(new M);onDidRemoveOutputs=this._onDidRemoveOutputs.event;_onDidHideOutputs=this._localDisposableStore.add(new M);onDidHideOutputs=this._onDidHideOutputs.event;_onDidRemoveCellsFromView=this._localDisposableStore.add(new M);onDidRemoveCellsFromView=this._onDidRemoveCellsFromView.event;_viewModel=null;get viewModel(){return this._viewModel}_hiddenRangeIds=[];hiddenRangesPrefixSum=null;_onDidChangeVisibleRanges=this._localDisposableStore.add(new M);onDidChangeVisibleRanges=this._onDidChangeVisibleRanges.event;_visibleRanges=[];get visibleRanges(){return this._visibleRanges}set visibleRanges(e){ae(this._visibleRanges,e)||(this._visibleRanges=e,this._onDidChangeVisibleRanges.fire())}_isDisposed=!1;get isDisposed(){return this._isDisposed}_isInLayout=!1;_webviewElement=null;get webviewElement(){return this._webviewElement}get inRenderingTransaction(){return this.view.inRenderingTransaction}createListView(e,t,i,o){const n=new me(e,t,i,o);return this.viewZones=new ge(n,this),n}_getView(){return this.view}attachWebview(e){e.style.top=`-${L}px`,this.rowsContainer.insertAdjacentElement("afterbegin",e),this._webviewElement=new ce(e)}elementAt(e){if(!this.view.length)return;const t=this.view.indexAt(e),i=C(t,0,this.view.length-1);return this.element(i)}elementHeight(e){const t=this._getViewIndexUpperBound(e);if(t===void 0||t<0||t>=this.length)throw this._getViewIndexUpperBound(e),new H(this.listUser,`Invalid index ${t}`);return this.view.elementHeight(t)}detachViewModel(){this._viewModelStore.clear(),this._viewModel=null,this.hiddenRangesPrefixSum=null}attachViewModel(e){this._viewModel=e,this._viewModelStore.add(e.onDidChangeViewCells(n=>{if(this._isDisposed)return;this.viewZones.onCellsChanged(n);const l=this._hiddenRangeIds.map(a=>this._viewModel.getTrackedRange(a)).filter(a=>a!==null),r=P(this._viewModel.viewCells,l),s=[],d=new Set;for(let a=0;a<this.length;a++)s.push(this.element(a)),d.add(this.element(a).uri.toString());const c=j(s,r,a=>d.has(a.uri.toString()));n.synchronous?this._updateElementsInWebview(c):this._viewModelStore.add(g.scheduleAtNextAnimationFrame(g.getWindow(this.rowsContainer),()=>{this._isDisposed||this._updateElementsInWebview(c)}))})),this._viewModelStore.add(e.onDidChangeSelection(n=>{if(n==="view")return;const l=Y(e.getSelections()).map(s=>e.cellAt(s)).filter(s=>!!s).map(s=>this._getViewIndexUpperBound(s));this.setSelection(l,void 0,!0);const r=Y([e.getFocus()]).map(s=>e.cellAt(s)).filter(s=>!!s).map(s=>this._getViewIndexUpperBound(s));r.length&&this.setFocus(r,void 0,!0)}));const t=e.getHiddenRanges();this.setHiddenAreas(t,!1);const i=y(t),o=e.viewCells.slice(0);i.reverse().forEach(n=>{const l=o.splice(n.start,n.end-n.start+1);this._onDidRemoveCellsFromView.fire(l)}),this.splice2(0,0,o)}_updateElementsInWebview(e){e.reverse().forEach(t=>{const i=[],o=[],n=[];for(let l=t.start;l<t.start+t.deleteCount;l++){const r=this.element(l);r.cellKind===F.Code?this._viewModel.hasCell(r)?i.push(...r?.outputsViewModels):o.push(...r?.outputsViewModels):n.push(r)}this.splice2(t.start,t.deleteCount,t.toInsert),this._onDidHideOutputs.fire(i),this._onDidRemoveOutputs.fire(o),this._onDidRemoveCellsFromView.fire(n)})}clear(){super.splice(0,this.length)}setHiddenAreas(e,t){if(!this._viewModel)return!1;const i=y(e),o=this._hiddenRangeIds.map(l=>this._viewModel.getTrackedRange(l)).filter(l=>l!==null);if(i.length===o.length){let l=!1;for(let r=0;r<i.length;r++)if(!(i[r].start===o[r].start&&i[r].end===o[r].end)){l=!0;break}if(!l)return this._updateHiddenRangePrefixSum(i),this.viewZones.onHiddenRangesChange(),this.viewZones.layout(),!1}this._hiddenRangeIds.forEach(l=>this._viewModel.setTrackedRange(l,null,Z.GrowsOnlyWhenTypingAfter));const n=i.map(l=>this._viewModel.setTrackedRange(null,l,Z.GrowsOnlyWhenTypingAfter)).filter(l=>l!==null);return this._hiddenRangeIds=n,this._updateHiddenRangePrefixSum(i),this.viewZones.onHiddenRangesChange(),t&&this.updateHiddenAreasInView(o,i),this.viewZones.layout(),!0}_updateHiddenRangePrefixSum(e){let t=0,i=0;const o=[];for(;i<e.length;){for(let l=t;l<e[i].start-1;l++)o.push(1);o.push(e[i].end-e[i].start+1+1),t=e[i].end+1,i++}for(let l=t;l<this._viewModel.length;l++)o.push(1);const n=new Uint32Array(o.length);for(let l=0;l<o.length;l++)n[l]=o[l];this.hiddenRangesPrefixSum=new te(n)}updateHiddenAreasInView(e,t){const i=P(this._viewModel.viewCells,e),o=new Set;i.forEach(r=>{o.add(r.uri.toString())});const n=P(this._viewModel.viewCells,t),l=j(i,n,r=>o.has(r.uri.toString()));this._updateElementsInWebview(l)}splice2(e,t,i=[]){if(e<0||e>this.view.length)return;const o=g.isAncestorOfActiveElement(this.rowsContainer);super.splice(e,t,i),o&&this.domFocus();const n=[];this.getSelectedElements().forEach(l=>{this._viewModel.hasCell(l)&&n.push(l.handle)}),!n.length&&this._viewModel.viewCells.length&&this._viewModel.updateSelectionsState({kind:S.Index,focus:{start:0,end:1},selections:[{start:0,end:1}]}),this.viewZones.layout()}getModelIndex(e){const t=this.indexOf(e);return this.getModelIndex2(t)}getModelIndex2(e){return this.hiddenRangesPrefixSum?this.hiddenRangesPrefixSum.getPrefixSum(e-1):e}getViewIndex(e){const t=this._viewModel.getCellIndex(e);return this.getViewIndex2(t)}getViewIndex2(e){if(!this.hiddenRangesPrefixSum)return e;const t=this.hiddenRangesPrefixSum.getIndexOf(e);return t.remainder!==0?e>=this.hiddenRangesPrefixSum.getTotalSum()?e-(this.hiddenRangesPrefixSum.getTotalSum()-this.hiddenRangesPrefixSum.getCount()):void 0:t.index}convertModelIndexToViewIndex(e){return this.hiddenRangesPrefixSum?e>=this.hiddenRangesPrefixSum.getTotalSum()?Math.min(this.length,this.hiddenRangesPrefixSum.getTotalSum()):this.hiddenRangesPrefixSum.getIndexOf(e).index:e}modelIndexIsVisible(e){return this.hiddenRangesPrefixSum&&this.hiddenRangesPrefixSum.getIndexOf(e).remainder!==0?e>=this.hiddenRangesPrefixSum.getTotalSum():!0}_getVisibleRangesFromIndex(e,t,i,o){const n=[],l=[];let r=e,s=t;for(;r<=i;){const d=this.hiddenRangesPrefixSum.getPrefixSum(r);d===s+1?(n.length&&(n[n.length-1]===s-1?l.push({start:n[n.length-1],end:s+1}):l.push({start:n[n.length-1],end:n[n.length-1]+1})),n.push(s),r++,s++):(n.length&&(n[n.length-1]===s-1?l.push({start:n[n.length-1],end:s+1}):l.push({start:n[n.length-1],end:n[n.length-1]+1})),n.push(s),r++,s=d)}return n.length&&l.push({start:n[n.length-1],end:n[n.length-1]+1}),y(l)}getVisibleRangesPlusViewportAboveAndBelow(){if(this.view.length<=0)return[];const e=Math.max(this.getViewScrollTop()-this.renderHeight,0),t=this.view.indexAt(e),i=this.view.element(t),o=this._viewModel.getCellIndex(i),n=C(this.getViewScrollBottom()+this.renderHeight,0,this.scrollHeight),l=C(this.view.indexAt(n),0,this.view.length-1),r=this.view.element(l),s=this._viewModel.getCellIndex(r);return s-o===l-t?[{start:o,end:s}]:this._getVisibleRangesFromIndex(t,o,l,s)}_getViewIndexUpperBound(e){if(!this._viewModel)return-1;const t=this._viewModel.getCellIndex(e);if(t===-1)return-1;if(!this.hiddenRangesPrefixSum)return t;const i=this.hiddenRangesPrefixSum.getIndexOf(t);return i.remainder!==0&&t>=this.hiddenRangesPrefixSum.getTotalSum()?t-(this.hiddenRangesPrefixSum.getTotalSum()-this.hiddenRangesPrefixSum.getCount()):i.index}_getViewIndexUpperBound2(e){if(!this.hiddenRangesPrefixSum)return e;const t=this.hiddenRangesPrefixSum.getIndexOf(e);return t.remainder!==0&&e>=this.hiddenRangesPrefixSum.getTotalSum()?e-(this.hiddenRangesPrefixSum.getTotalSum()-this.hiddenRangesPrefixSum.getCount()):t.index}focusElement(e){const t=this._getViewIndexUpperBound(e);if(t>=0&&this._viewModel){const i=this.element(t).handle;this._viewModel.updateSelectionsState({kind:S.Handle,primary:i,selections:[i]},"view"),this.setFocus([t],void 0,!1)}}selectElements(e){const t=e.map(i=>this._getViewIndexUpperBound(i)).filter(i=>i>=0);this.setSelection(t)}getCellViewScrollTop(e){const t=this._getViewIndexUpperBound(e);if(t===void 0||t<0||t>=this.length)throw new H(this.listUser,`Invalid index ${t}`);return this.view.elementTop(t)}getCellViewScrollBottom(e){const t=this._getViewIndexUpperBound(e);if(t===void 0||t<0||t>=this.length)throw new H(this.listUser,`Invalid index ${t}`);const i=this.view.elementTop(t),o=this.view.elementHeight(t);return i+o}setFocus(e,t,i){if(i){super.setFocus(e,t);return}if(e.length){if(this._viewModel){const o=this.element(e[0]).handle;this._viewModel.updateSelectionsState({kind:S.Handle,primary:o,selections:this.getSelection().map(n=>this.element(n).handle)},"view")}}else if(this._viewModel){if(this.length)return;this._viewModel.updateSelectionsState({kind:S.Handle,primary:null,selections:[]},"view")}super.setFocus(e,t)}setSelection(e,t,i){if(i){super.setSelection(e,t);return}e.length?this._viewModel&&this._viewModel.updateSelectionsState({kind:S.Handle,primary:this.getFocusedElements()[0]?.handle??null,selections:e.map(o=>this.element(o)).map(o=>o.handle)},"view"):this._viewModel&&this._viewModel.updateSelectionsState({kind:S.Handle,primary:this.getFocusedElements()[0]?.handle??null,selections:[]},"view"),super.setSelection(e,t)}revealCells(e){const t=this._getViewIndexUpperBound2(e.start);if(t<0)return;const i=this._getViewIndexUpperBound2(e.end-1),o=this.getViewScrollTop(),n=this.getViewScrollBottom(),l=this.view.elementTop(t);if(l>=o&&l<n){const r=this.view.elementTop(i),s=this.view.elementHeight(i);if(r+s<=n)return;if(r>=n)return this._revealInternal(i,!1,2);if(r<n)return r+s-n<l-o?this.view.setScrollTop(o+r+s-n):this._revealInternal(t,!1,0)}this._revealInViewWithMinimalScrolling(t)}_revealInViewWithMinimalScrolling(e,t){const i=this.view.firstMostlyVisibleIndex,o=this.view.elementHeight(e);e<=i||!t&&o>=this.view.renderHeight?this._revealInternal(e,!0,0):this._revealInternal(e,!0,2,t)}scrollToBottom(){const e=this.view.scrollHeight,t=this.getViewScrollTop(),i=this.getViewScrollBottom();this.view.setScrollTop(e-(i-t))}async revealCell(e,t){const i=this._getViewIndexUpperBound(e);if(!(i<0)){switch(t){case f.Top:this._revealInternal(i,!1,0);break;case f.Center:this._revealInternal(i,!1,1);break;case f.CenterIfOutsideViewport:this._revealInternal(i,!0,1);break;case f.NearTopIfOutsideViewport:this._revealInternal(i,!0,3);break;case f.FirstLineIfOutsideViewport:this._revealInViewWithMinimalScrolling(i,!0);break;case f.Default:this._revealInViewWithMinimalScrolling(i);break}if((e.getEditState()===K.Editing||t===f.FirstLineIfOutsideViewport&&e.cellKind===F.Code)&&!e.editorAttached)return V(e)}}_revealInternal(e,t,i,o){if(e>=this.view.length)return;const n=this.getViewScrollTop(),l=this.getViewScrollBottom(),r=this.view.elementTop(e),s=this.view.elementHeight(e)+r;if(!(t&&r>=n&&s<l))switch(i){case 0:this.view.setScrollTop(r),this.view.setScrollTop(this.view.elementTop(e));break;case 1:case 3:{this.view.setScrollTop(r-this.view.renderHeight/2);const d=this.view.elementTop(e),c=this.view.elementHeight(e),a=this.getViewScrollBottom()-this.getViewScrollTop();c>=a?this.view.setScrollTop(d):i===1?this.view.setScrollTop(d+c/2-a/2):i===3&&this.view.setScrollTop(d-a/5)}break;case 2:if(o){const d=this.viewModel?.layoutInfo?.fontInfo.lineHeight??15,c=this.notebookOptions.getLayoutConfiguration().cellTopMargin+this.notebookOptions.getLayoutConfiguration().editorTopPadding,a=r+d+c;if(a<l)return;this.view.setScrollTop(this.scrollTop+(a-l));break}this.view.setScrollTop(this.scrollTop+(s-l)),this.view.setScrollTop(this.scrollTop+(this.view.elementTop(e)+this.view.elementHeight(e)-this.getViewScrollBottom()));break;default:break}}async revealRangeInCell(e,t,i){const o=this._getViewIndexUpperBound(e);if(!(o<0))switch(i){case A.Default:return this._revealRangeInternalAsync(o,t);case A.Center:return this._revealRangeInCenterInternalAsync(o,t);case A.CenterIfOutsideViewport:return this._revealRangeInCenterIfOutsideViewportInternalAsync(o,t)}}async _revealRangeInternalAsync(e,t){const i=this.getViewScrollTop(),o=this.getViewScrollBottom(),n=this.view.elementTop(e),l=this.view.element(e);if(l.editorAttached)this._revealRangeCommon(e,t);else{const r=this.view.elementHeight(e);let s;return n+r<=i?(this.view.setScrollTop(n),s="top"):n>=o&&(this.view.setScrollTop(n-this.view.renderHeight/2),s="bottom"),new Promise((c,a)=>{l.onDidChangeEditorAttachState(()=>{l.editorAttached?c():a()})}).then(()=>{this._revealRangeCommon(e,t,s)})}}async _revealRangeInCenterInternalAsync(e,t){const i=(r,s)=>{const d=this.view.element(r),c=d.getPositionScrollTopOffset(s),a=this.view.elementTop(r)+c;this.view.setScrollTop(a-this.view.renderHeight/2),d.revealRangeInCenter(s)},n=this.view.elementTop(e);this.view.setScrollTop(n-this.view.renderHeight/2);const l=this.view.element(e);if(l.editorAttached)i(e,t);else return V(l).then(()=>i(e,t))}async _revealRangeInCenterIfOutsideViewportInternalAsync(e,t){const i=(c,a)=>{const p=this.view.element(c),v=p.getPositionScrollTopOffset(a),T=this.view.elementTop(c)+v;this.view.setScrollTop(T-this.view.renderHeight/2),p.revealRangeInCenter(a)},o=this.getViewScrollTop(),n=this.getViewScrollBottom(),r=this.view.elementTop(e),s=this.view.element(e),d=r+s.getPositionScrollTopOffset(t);if(d<o||d>n){this.view.setScrollTop(d-this.view.renderHeight/2);const c=this.view.elementTop(e)+s.getPositionScrollTopOffset(t);if(this.view.setScrollTop(c-this.view.renderHeight/2),!s.editorAttached)return V(s).then(()=>i(e,t))}else if(s.editorAttached)s.revealRangeInCenter(t);else return V(s).then(()=>i(e,t))}_revealRangeCommon(e,t,i){const o=this.view.element(e),n=this.getViewScrollTop(),l=this.getViewScrollBottom(),r=o.getPositionScrollTopOffset(t),s=this.view.elementHeight(e);if(r>=s){const a=o.layoutInfo.totalHeight;this.updateElementHeight(e,a)}const c=this.view.elementTop(e)+r;c<n?this.view.setScrollTop(c-30):c>l?this.view.setScrollTop(n+c-l+30):i==="bottom"?this.view.setScrollTop(n+c-l+30):i==="top"&&this.view.setScrollTop(c-30)}revealCellOffsetInCenter(e,t){const i=this._getViewIndexUpperBound(e);if(i>=0){const o=this.view.element(i),n=this.view.elementTop(i);if(o instanceof he)return this._revealInCenterIfOutsideViewport(i);{const l=o.layoutInfo.outputContainerOffset+Math.min(t,o.layoutInfo.outputTotalHeight);this.view.setScrollTop(n-this.view.renderHeight/2),this.view.setScrollTop(n+l-this.view.renderHeight/2)}}}revealOffsetInCenterIfOutsideViewport(e){const t=this.getViewScrollTop(),i=this.getViewScrollBottom();(e<t||e>i)&&this.view.setScrollTop(e-this.view.renderHeight/2)}_revealInCenterIfOutsideViewport(e){this._revealInternal(e,!0,1)}domElementOfElement(e){const t=this._getViewIndexUpperBound(e);return t>=0?this.view.domElement(t):null}focusView(){this.view.domNode.focus()}triggerScrollFromMouseWheelEvent(e){this.view.delegateScrollFromMouseWheelEvent(e)}delegateVerticalScrollbarPointerDown(e){this.view.delegateVerticalScrollbarPointerDown(e)}isElementAboveViewport(e){return this.view.elementTop(e)+this.view.elementHeight(e)<this.scrollTop}updateElementHeight2(e,t,i=null){const o=this._getViewIndexUpperBound(e);if(o===void 0||o<0||o>=this.length)return;if(this.isElementAboveViewport(o)){const s=this.elementHeight(e)-t;this._webviewElement&&N.once(this.view.onWillScroll)(()=>{const d=parseInt(this._webviewElement.domNode.style.top,10);fe(this._webviewElement.domNode)?this._webviewElement.setTop(d-s):this._webviewElement.setTop(-L)}),this.view.updateElementHeight(o,t,i),this.viewZones.layout();return}if(i!==null){this.view.updateElementHeight(o,t,i),this.viewZones.layout();return}const n=this.getFocus(),l=n.length?n[0]:null;if(l){const r=t-this.view.elementHeight(o);if(this._notebookCellAnchor.shouldAnchor(this.view,l,r,this.element(o))){this.view.updateElementHeight(o,t,l),this.viewZones.layout();return}}this.view.updateElementHeight(o,t,null),this.viewZones.layout()}changeViewZones(e){this.viewZones.changeViewZones(e)&&this.viewZones.layout()}domFocus(){const e=this.getFocusedElements()[0],t=e&&this.domElementOfElement(e);this.view.domNode.ownerDocument.activeElement&&t&&t.contains(this.view.domNode.ownerDocument.activeElement)||!ee&&this.view.domNode.ownerDocument.activeElement&&g.findParentWithClass(this.view.domNode.ownerDocument.activeElement,"context-view")||super.domFocus()}focusContainer(e){e&&(this._viewModel?.updateSelectionsState({kind:S.Handle,primary:null,selections:[]},"view"),this.setFocus([],void 0,!0),this.setSelection([],void 0,!0)),super.domFocus()}getViewScrollTop(){return this.view.getScrollTop()}getViewScrollBottom(){return this.getViewScrollTop()+this.view.renderHeight}setCellEditorSelection(e,t){const i=e;i.editorAttached?i.setSelection(t):V(i).then(()=>{i.setSelection(t)})}style(e){const t=this.view.domId;this.styleElement||(this.styleElement=g.createStyleSheet(this.view.domNode));const i=t&&`.${t}`,o=[];e.listBackground&&o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows { background: ${e.listBackground}; }`),e.listFocusBackground&&(o.push(`.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${e.listFocusBackground}; }`),o.push(`.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${e.listFocusBackground}; }`)),e.listFocusForeground&&o.push(`.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${e.listFocusForeground}; }`),e.listActiveSelectionBackground&&(o.push(`.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${e.listActiveSelectionBackground}; }`),o.push(`.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${e.listActiveSelectionBackground}; }`)),e.listActiveSelectionForeground&&o.push(`.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${e.listActiveSelectionForeground}; }`),e.listFocusAndSelectionBackground&&o.push(`
				.monaco-drag-image,
				.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${e.listFocusAndSelectionBackground}; }
			`),e.listFocusAndSelectionForeground&&o.push(`
				.monaco-drag-image,
				.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${e.listFocusAndSelectionForeground}; }
			`),e.listInactiveFocusBackground&&(o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${e.listInactiveFocusBackground}; }`),o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${e.listInactiveFocusBackground}; }`)),e.listInactiveSelectionBackground&&(o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${e.listInactiveSelectionBackground}; }`),o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${e.listInactiveSelectionBackground}; }`)),e.listInactiveSelectionForeground&&o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${e.listInactiveSelectionForeground}; }`),e.listHoverBackground&&o.push(`.monaco-list${i}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${e.listHoverBackground}; }`),e.listHoverForeground&&o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${e.listHoverForeground}; }`),e.listSelectionOutline&&o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${e.listSelectionOutline}; outline-offset: -1px; }`),e.listFocusOutline&&o.push(`
				.monaco-drag-image,
				.monaco-list${i}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${e.listFocusOutline}; outline-offset: -1px; }
			`),e.listInactiveFocusOutline&&o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${e.listInactiveFocusOutline}; outline-offset: -1px; }`),e.listHoverOutline&&o.push(`.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${e.listHoverOutline}; outline-offset: -1px; }`),e.listDropOverBackground&&o.push(`
				.monaco-list${i}.drop-target,
				.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${i} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${e.listDropOverBackground} !important; color: inherit !important; }
			`);const n=o.join(`
`);n!==this.styleElement.textContent&&(this.styleElement.textContent=n)}getRenderHeight(){return this.view.renderHeight}getScrollHeight(){return this.view.scrollHeight}layout(e,t){this._isInLayout=!0,super.layout(e,t),this.renderHeight===0?this.view.domNode.style.visibility="hidden":this.view.domNode.style.visibility="initial",this._isInLayout=!1}dispose(){this._isDisposed=!0,this._viewModelStore.dispose(),this._localDisposableStore.dispose(),this._notebookCellAnchor.dispose(),this.viewZones.dispose(),super.dispose(),this._previousFocusedElements=[],this._viewModel=null,this._hiddenRangeIds=[],this.hiddenRangesPrefixSum=null,this._visibleRanges=[]}};R=$([I(7,oe),I(8,ie),I(9,ue),I(10,we)],R);class bt extends z{constructor(e){super();this.list=e}getViewIndex(e){return this.list.getViewIndex(e)??-1}getViewHeight(e){return this.list.viewModel?this.list.elementHeight(e):-1}getCellRangeFromViewRange(e,t){if(!this.list.viewModel)return;const i=this.list.getModelIndex2(e);if(i===void 0)throw new Error(`startIndex ${e} out of boundary`);if(t>=this.list.length){const o=this.list.viewModel.length;return{start:i,end:o}}else{const o=this.list.getModelIndex2(t);if(o===void 0)throw new Error(`endIndex ${t} out of boundary`);return{start:i,end:o}}}getCellsFromViewRange(e,t){if(!this.list.viewModel)return[];const i=this.getCellRangeFromViewRange(e,t);return i?this.list.viewModel.getCellsInRange(i):[]}getCellsInRange(e){return this.list.viewModel?.getCellsInRange(e)??[]}getVisibleRangesPlusViewportAboveAndBelow(){return this.list?.getVisibleRangesPlusViewportAboveAndBelow()??[]}}function V(m){return new Promise((h,e)=>{N.once(m.onDidChangeEditorAttachState)(()=>m.editorAttached?h():e())})}export{bt as ListViewInfoAccessor,L as NOTEBOOK_WEBVIEW_BOUNDARY,R as NotebookCellList};
