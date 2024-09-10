var z=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var A=(f,a,e,t)=>{for(var n=t>1?void 0:t?j(a,e):a,o=f.length-1,i;o>=0;o--)(i=f[o])&&(n=(t?i(a,e,n):i(n))||n);return t&&n&&z(a,e,n),n},b=(f,a)=>(e,t)=>a(e,t,f);import{groupBy as X}from"../../../../../base/common/collections.js";import{onUnexpectedError as J}from"../../../../../base/common/errors.js";import{Emitter as k}from"../../../../../base/common/event.js";import{Disposable as Q,DisposableStore as Y}from"../../../../../base/common/lifecycle.js";import{clamp as P}from"../../../../../base/common/numbers.js";import*as Z from"../../../../../base/common/strings.js";import{IBulkEditService as ee,ResourceTextEdit as te}from"../../../../../editor/browser/services/bulkEditService.js";import{Range as F}from"../../../../../editor/common/core/range.js";import{TrackedRangeStickiness as y}from"../../../../../editor/common/model.js";import{MultiModelEditStackElement as W,SingleModelEditStackElement as D}from"../../../../../editor/common/model/editStack.js";import{IntervalNode as ne,IntervalTree as oe}from"../../../../../editor/common/model/intervalTree.js";import{ModelDecorationOptions as w}from"../../../../../editor/common/model/textModel.js";import{ITextModelService as ie}from"../../../../../editor/common/services/resolverService.js";import{IInstantiationService as le}from"../../../../../platform/instantiation/common/instantiation.js";import{IUndoRedoService as se}from"../../../../../platform/undoRedo/common/undoRedo.js";import{CellFindMatchModel as re}from"../contrib/find/findModel.js";import{CellEditState as R,CellFoldingState as N}from"../notebookBrowser.js";import{NotebookMetadataChangedEvent as ae}from"../notebookViewEvents.js";import{NotebookCellSelectionCollection as de}from"./cellSelectionCollection.js";import{CodeCellViewModel as T}from"./codeCellViewModel.js";import{MarkupCellViewModel as ce}from"./markupCellViewModel.js";import{CellKind as S,NotebookCellsChangeType as V,NotebookFindScopeType as U,SelectionStateType as he}from"../../common/notebookCommon.js";import{INotebookExecutionStateService as ue,NotebookExecutionType as ge}from"../../common/notebookExecutionStateService.js";import{cellIndexesToRanges as x,cellRangesToIndexes as K,reduceCellRanges as G}from"../../common/notebookRange.js";const pe=()=>{throw new Error("Invalid change accessor")};class fe{_decorationsTree;constructor(){this._decorationsTree=new oe}intervalSearch(a,e,t,n,o,i=!1){return this._decorationsTree.intervalSearch(a,e,t,n,o,i)}search(a,e,t,n,o){return this._decorationsTree.search(a,e,n,o)}collectNodesFromOwner(a){return this._decorationsTree.collectNodesFromOwner(a)}collectNodesPostOrder(){return this._decorationsTree.collectNodesPostOrder()}insert(a){this._decorationsTree.insert(a)}delete(a){this._decorationsTree.delete(a)}resolveNode(a,e){this._decorationsTree.resolveNode(a,e)}acceptReplace(a,e,t,n){this._decorationsTree.acceptReplace(a,e,t,n)}}const q=[w.register({description:"notebook-view-model-tracked-range-always-grows-when-typing-at-edges",stickiness:y.AlwaysGrowsWhenTypingAtEdges}),w.register({description:"notebook-view-model-tracked-range-never-grows-when-typing-at-edges",stickiness:y.NeverGrowsWhenTypingAtEdges}),w.register({description:"notebook-view-model-tracked-range-grows-only-when-typing-before",stickiness:y.GrowsOnlyWhenTypingBefore}),w.register({description:"notebook-view-model-tracked-range-grows-only-when-typing-after",stickiness:y.GrowsOnlyWhenTypingAfter})];function Ce(f){return f instanceof w?f:w.createDynamic(f)}let L=0,O=class extends Q{constructor(e,t,n,o,i,l,s,d,h,p){super();this.viewType=e;this._notebook=t;this._viewContext=n;this._layoutInfo=o;this._options=i;this._instantiationService=l;this._bulkEditService=s;this._undoService=d;this._textModelService=h;L++,this.id="$notebookViewModel"+L,this._instanceId=Z.singleLetterHash(L),this.replView=!!this.options.inRepl;const v=(r,c)=>{const u=r.map(g=>[g[0],g[1],g[2].map(C=>$(this._instantiationService,this,C,this._viewContext))]);u.reverse().forEach(g=>{const C=this._viewCells.splice(g[0],g[1],...g[2]);this._decorationsTree.acceptReplace(g[0],g[1],g[2].length,!0),C.forEach(_=>{this._handleToViewCellMapping.delete(_.handle),_.dispose()}),g[2].forEach(_=>{this._handleToViewCellMapping.set(_.handle,_),this._localStore.add(_)})});const E=this.selectionHandles;this._onDidChangeViewCells.fire({synchronous:c,splices:u});let m=[];if(E.length){const g=E[0],C=this._viewCells.indexOf(this.getCellByHandle(g));m=[g];let _=0;for(let B=0;B<u.length;B++){const I=u[0];if(I[0]+I[1]<=C){_+=I[2].length-I[1];continue}if(I[0]>C){m=[g];break}if(I[0]+I[1]>C){m=[this._viewCells[I[0]+_].handle];break}}}const H=m.map(g=>this._viewCells.findIndex(C=>C.handle===g));this._selectionCollection.setState(x([H[0]])[0],x(H),!0,"model")};this._register(this._notebook.onDidChangeContent(r=>{for(let c=0;c<r.rawEvents.length;c++){const u=r.rawEvents[c];let E=[];const m=r.synchronous??!0;if(u.kind===V.ModelChange||u.kind===V.Initialize){E=u.changes,v(E,m);continue}else if(u.kind===V.Move)v([[u.index,u.length,[]]],m),v([[u.newIdx,0,u.cells]],m);else continue}})),this._register(this._notebook.onDidChangeContent(r=>{r.rawEvents.forEach(c=>{c.kind===V.ChangeDocumentMetadata&&this._viewContext.eventDispatcher.emit([new ae(this._notebook.metadata)])}),r.endSelectionState&&this.updateSelectionsState(r.endSelectionState)})),this._register(this._viewContext.eventDispatcher.onDidChangeLayout(r=>{this._layoutInfo=r.value,this._viewCells.forEach(c=>{c.cellKind===S.Markup?(r.source.width||r.source.fontInfo)&&c.layoutChange({outerWidth:r.value.width,font:r.value.fontInfo}):r.source.width!==void 0&&c.layoutChange({outerWidth:r.value.width,font:r.value.fontInfo})})})),this._register(this._viewContext.notebookOptions.onDidChangeOptions(r=>{for(let c=0;c<this.length;c++)this._viewCells[c].updateOptions(r)})),this._register(p.onDidChangeExecution(r=>{if(r.type!==ge.cell)return;const c=this.getCellByHandle(r.cellHandle);c instanceof T&&c.updateExecutionState(r)})),this._register(this._selectionCollection.onDidChangeSelection(r=>{this._onDidChangeSelection.fire(r)}));const M=this.replView?this._notebook.cells.length-1:this._notebook.cells.length;for(let r=0;r<M;r++)this._viewCells.push($(this._instantiationService,this,this._notebook.cells[r],this._viewContext));this._viewCells.forEach(r=>{this._handleToViewCellMapping.set(r.handle,r)})}_localStore=this._register(new Y);_handleToViewCellMapping=new Map;get options(){return this._options}_onDidChangeOptions=this._register(new k);get onDidChangeOptions(){return this._onDidChangeOptions.event}_viewCells=[];replView;get viewCells(){return this._viewCells}get length(){return this._viewCells.length}get notebookDocument(){return this._notebook}get uri(){return this._notebook.uri}get metadata(){return this._notebook.metadata}_onDidChangeViewCells=this._register(new k);get onDidChangeViewCells(){return this._onDidChangeViewCells.event}_lastNotebookEditResource=[];get lastNotebookEditResource(){return this._lastNotebookEditResource.length?this._lastNotebookEditResource[this._lastNotebookEditResource.length-1]:null}get layoutInfo(){return this._layoutInfo}_onDidChangeSelection=this._register(new k);get onDidChangeSelection(){return this._onDidChangeSelection.event}_selectionCollection=this._register(new de);get selectionHandles(){const e=new Set,t=[];return K(this._selectionCollection.selections).map(n=>n<this.length?this.cellAt(n):void 0).forEach(n=>{n&&!e.has(n.handle)&&t.push(n.handle)}),t}set selectionHandles(e){const t=e.map(n=>this._viewCells.findIndex(o=>o.handle===n));this._selectionCollection.setSelections(x(t),!0,"model")}_decorationsTree=new fe;_decorations=Object.create(null);_lastDecorationId=0;_instanceId;id;_foldingRanges=null;_onDidFoldingStateChanged=new k;onDidFoldingStateChanged=this._onDidFoldingStateChanged.event;_hiddenRanges=[];_focused=!0;get focused(){return this._focused}_decorationIdToCellMap=new Map;_statusBarItemIdToCellMap=new Map;updateOptions(e){this._options={...this._options,...e},this._onDidChangeOptions.fire()}getFocus(){return this._selectionCollection.focus}getSelections(){return this._selectionCollection.selections}setEditorFocus(e){this._focused=e}validateRange(e){if(!e)return null;const t=P(e.start,0,this.length),n=P(e.end,0,this.length);return t<=n?{start:t,end:n}:{start:n,end:t}}updateSelectionsState(e,t="model"){if(this._focused||t==="model")if(e.kind===he.Handle){const n=e.primary!==null?this.getCellIndexByHandle(e.primary):null,o=n!==null?this.validateRange({start:n,end:n+1}):null,i=x(e.selections.map(l=>this.getCellIndexByHandle(l))).map(l=>this.validateRange(l)).filter(l=>l!==null);this._selectionCollection.setState(o,G(i),!0,t)}else{const n=this.validateRange(e.focus),o=e.selections.map(i=>this.validateRange(i)).filter(i=>i!==null);this._selectionCollection.setState(n,G(o),!0,t)}}getFoldingStartIndex(e){if(!this._foldingRanges)return-1;const t=this._foldingRanges.findRange(e+1);return this._foldingRanges.getStartLineNumber(t)-1}getFoldingState(e){if(!this._foldingRanges)return N.None;const t=this._foldingRanges.findRange(e+1);return this._foldingRanges.getStartLineNumber(t)-1!==e?N.None:this._foldingRanges.isCollapsed(t)?N.Collapsed:N.Expanded}getFoldedLength(e){if(!this._foldingRanges)return 0;const t=this._foldingRanges.findRange(e+1),n=this._foldingRanges.getStartLineNumber(t)-1;return this._foldingRanges.getEndLineNumber(t)-1-n}updateFoldingRanges(e){this._foldingRanges=e;let t=!1;const n=[];let o=0,i=0,l=Number.MAX_VALUE,s=-1;for(;o<e.length;o++){if(!e.isCollapsed(o))continue;const d=e.getStartLineNumber(o)+1,h=e.getEndLineNumber(o);l<=d&&h<=s||(!t&&i<this._hiddenRanges.length&&this._hiddenRanges[i].start+1===d&&this._hiddenRanges[i].end+1===h?(n.push(this._hiddenRanges[i]),i++):(t=!0,n.push({start:d-1,end:h-1})),l=d,s=h)}(t||i<this._hiddenRanges.length)&&(this._hiddenRanges=n,this._onDidFoldingStateChanged.fire()),this._viewCells.forEach(d=>{d.cellKind===S.Markup&&d.triggerFoldingStateChange()})}getHiddenRanges(){return this._hiddenRanges}getCellByHandle(e){return this._handleToViewCellMapping.get(e)}getCellIndexByHandle(e){return this._viewCells.findIndex(t=>t.handle===e)}getCellIndex(e){return this._viewCells.indexOf(e)}cellAt(e){return this._viewCells[e]}getCellsInRange(e){if(!e)return this._viewCells.slice(0);const t=this.validateRange(e);if(t){const n=[];for(let o=t.start;o<t.end;o++)n.push(this._viewCells[o]);return n}return[]}getNearestVisibleCellIndexUpwards(e){for(let t=this._hiddenRanges.length-1;t>=0;t--){const n=this._hiddenRanges[t],o=n.start-1,i=n.end;if(!(o>e)){if(o<=e&&i>=e)return e;break}}return e}getNextVisibleCellIndex(e){for(let t=0;t<this._hiddenRanges.length;t++){const n=this._hiddenRanges[t],o=n.start-1,i=n.end;if(!(i<e)){if(o<=e)return i+1;break}}return e+1}getPreviousVisibleCellIndex(e){for(let t=this._hiddenRanges.length-1;t>=0;t--){const n=this._hiddenRanges[t],o=n.start-1;if(n.end<e)return e;if(o<=e)return o}return e}hasCell(e){return this._handleToViewCellMapping.has(e.handle)}getVersionId(){return this._notebook.versionId}getAlternativeId(){return this._notebook.alternativeVersionId}getTrackedRange(e){return this._getDecorationRange(e)}_getDecorationRange(e){const t=this._decorations[e];if(!t)return null;const n=this.getVersionId();return t.cachedVersionId!==n&&this._decorationsTree.resolveNode(t,n),t.range===null?{start:t.cachedAbsoluteStart-1,end:t.cachedAbsoluteEnd-1}:{start:t.range.startLineNumber-1,end:t.range.endLineNumber-1}}setTrackedRange(e,t,n){const o=e?this._decorations[e]:null;return o?t?(this._decorationsTree.delete(o),o.reset(this.getVersionId(),t.start,t.end+1,new F(t.start+1,1,t.end+1,1)),o.setOptions(q[n]),this._decorationsTree.insert(o),o.id):(this._decorationsTree.delete(o),delete this._decorations[o.id],null):t?this._deltaCellDecorationsImpl(0,[],[{range:new F(t.start+1,1,t.end+1,1),options:q[n]}])[0]:null}_deltaCellDecorationsImpl(e,t,n){const o=this.getVersionId(),i=t.length;let l=0;const s=n.length;let d=0;const h=new Array(s);for(;l<i||d<s;){let p=null;if(l<i){do p=this._decorations[t[l++]];while(!p&&l<i);p&&this._decorationsTree.delete(p)}if(d<s){if(!p){const c=++this._lastDecorationId,u=`${this._instanceId};${c}`;p=new ne(u,0,0),this._decorations[u]=p}const v=n[d],M=v.range,r=Ce(v.options);p.ownerId=e,p.reset(o,M.startLineNumber,M.endLineNumber,F.lift(M)),p.setOptions(r),this._decorationsTree.insert(p),h[d]=p.id,d++}else p&&delete this._decorations[p.id]}return h}deltaCellDecorations(e,t){e.forEach(o=>{const i=this._decorationIdToCellMap.get(o);i!==void 0&&(this.getCellByHandle(i)?.deltaCellDecorations([o],[]),this._decorationIdToCellMap.delete(o))});const n=[];return t.forEach(o=>{const l=this.getCellByHandle(o.handle)?.deltaCellDecorations([],[o.options])||[];l.forEach(s=>{this._decorationIdToCellMap.set(s,o.handle)}),n.push(...l)}),n}deltaCellStatusBarItems(e,t){const n=X(e,i=>this._statusBarItemIdToCellMap.get(i)??-1),o=[];t.forEach(i=>{const l=this.getCellByHandle(i.handle),s=n[i.handle]??[];delete n[i.handle],s.forEach(h=>this._statusBarItemIdToCellMap.delete(h));const d=l?.deltaCellStatusBarItems(s,i.items)||[];d.forEach(h=>{this._statusBarItemIdToCellMap.set(h,i.handle)}),o.push(...d)});for(const i in n){const l=parseInt(i),s=n[l];this.getCellByHandle(l)?.deltaCellStatusBarItems(s,[]),s.forEach(h=>this._statusBarItemIdToCellMap.delete(h))}return o}nearestCodeCellIndex(e){const t=this.viewCells.slice(0,e).reverse().findIndex(n=>n.cellKind===S.Code);if(t>-1)return e-t-1;{const n=this.viewCells.slice(e+1).findIndex(o=>o.cellKind===S.Code);return n>-1?e+1+n:-1}}getEditorViewState(){const e={},t={},n={},o={};this._viewCells.forEach((l,s)=>{l.getEditState()===R.Editing&&(e[s]=!0),l.isInputCollapsed&&(t[s]=!0),l instanceof T&&l.isOutputCollapsed&&(n[s]=!0),l.lineNumbers!=="inherit"&&(o[s]=l.lineNumbers)});const i={};return this._viewCells.map(l=>({handle:l.model.handle,state:l.saveEditorViewState()})).forEach((l,s)=>{l.state&&(i[s]=l.state)}),{editingCells:e,editorViewStates:i,cellLineNumberStates:o,collapsedInputCells:t,collapsedOutputCells:n}}restoreEditorViewState(e){e&&this._viewCells.forEach((t,n)=>{const o=e.editingCells&&e.editingCells[n],i=e.editorViewStates&&e.editorViewStates[n];t.updateEditState(o?R.Editing:R.Preview,"viewState");const l=e.cellTotalHeights?e.cellTotalHeights[n]:void 0;t.restoreEditorViewState(i,l),e.collapsedInputCells&&e.collapsedInputCells[n]&&(t.isInputCollapsed=!0),e.collapsedOutputCells&&e.collapsedOutputCells[n]&&t instanceof T&&(t.isOutputCollapsed=!0),e.cellLineNumberStates&&e.cellLineNumberStates[n]&&(t.lineNumbers=e.cellLineNumberStates[n])})}changeModelDecorations(e){const t={deltaDecorations:(o,i)=>this._deltaModelDecorationsImpl(o,i)};let n=null;try{n=e(t)}catch(o){J(o)}return t.deltaDecorations=pe,n}_deltaModelDecorationsImpl(e,t){const n=new Map;e.forEach(i=>{const l=i.ownerId;if(!n.has(l)){const d=this._viewCells.find(h=>h.handle===l);d&&n.set(l,{cell:d,oldDecorations:[],newDecorations:[]})}const s=n.get(l);s&&(s.oldDecorations=i.decorations)}),t.forEach(i=>{const l=i.ownerId;if(!n.has(l)){const d=this._viewCells.find(h=>h.handle===l);d&&n.set(l,{cell:d,oldDecorations:[],newDecorations:[]})}const s=n.get(l);s&&(s.newDecorations=i.decorations)});const o=[];return n.forEach((i,l)=>{const s=i.cell.deltaModelDecorations(i.oldDecorations,i.newDecorations);o.push({ownerId:l,decorations:s})}),o}find(e,t){const n=[];let o=[];if(t.findScope&&(t.findScope.findScopeType===U.Cells||t.findScope.findScopeType===U.Text)){const i=t.findScope.selectedCellRanges?.map(s=>this.validateRange(s)).filter(s=>!!s)??[];o=K(i).map(s=>this._viewCells[s])}else o=this._viewCells;return o.forEach((i,l)=>{const s=i.startFind(e,t);s&&n.push(new re(s.cell,l,s.contentMatches,[]))}),n.filter(i=>i.cell.cellKind===S.Code?t.includeCodeInput:(i.cell.getEditState()===R.Editing||!t.includeMarkupPreview)&&t.includeMarkupInput)}replaceOne(e,t,n){const o=e;return this._lastNotebookEditResource.push(o.uri),o.resolveTextModel().then(()=>{this._bulkEditService.apply([new te(e.uri,{range:t,text:n})],{quotableLabel:"Notebook Replace"})})}async replaceAll(e,t){if(!e.length)return;const n=[];return this._lastNotebookEditResource.push(e[0].cell.uri),e.forEach(o=>{o.contentMatches.forEach((i,l)=>{n.push({versionId:void 0,textEdit:{range:i.range,text:t[l]},resource:o.cell.uri})})}),Promise.all(e.map(o=>o.cell.resolveTextModel())).then(async()=>{this._bulkEditService.apply({edits:n},{quotableLabel:"Notebook Replace All"})})}async _withElement(e,t){const n=this._viewCells.filter(i=>e.matchesResource(i.uri)),o=await Promise.all(n.map(i=>this._textModelService.createModelReference(i.uri)));await t(),o.forEach(i=>i.dispose())}async undo(){const e=this._undoService.getElements(this.uri),t=e.past.length?e.past[e.past.length-1]:void 0;return t&&t instanceof D||t instanceof W?(await this._withElement(t,async()=>{await this._undoService.undo(this.uri)}),t instanceof D?[t.resource]:t.resources):(await this._undoService.undo(this.uri),[])}async redo(){const t=this._undoService.getElements(this.uri).future[0];return t&&t instanceof D||t instanceof W?(await this._withElement(t,async()=>{await this._undoService.redo(this.uri)}),t instanceof D?[t.resource]:t.resources):(await this._undoService.redo(this.uri),[])}equal(e){return this._notebook===e}dispose(){this._localStore.clear(),this._viewCells.forEach(e=>{e.dispose()}),super.dispose()}};O=A([b(5,le),b(6,ee),b(7,se),b(8,ie),b(9,ue)],O);function $(f,a,e,t){return e.cellKind===S.Code?f.createInstance(T,a.viewType,e,a.layoutInfo,t):f.createInstance(ce,a.viewType,e,a.layoutInfo,a,t)}export{O as NotebookViewModel,$ as createCellViewModel};
