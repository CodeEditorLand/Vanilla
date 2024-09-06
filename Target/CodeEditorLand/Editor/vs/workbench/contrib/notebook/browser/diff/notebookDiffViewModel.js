import"../../../../../../vs/base/common/cancellation.js";import"../../../../../../vs/base/common/diff/diff.js";import{Emitter as k}from"../../../../../../vs/base/common/event.js";import{Disposable as V,DisposableStore as x,dispose as C}from"../../../../../../vs/base/common/lifecycle.js";import{Schemas as c}from"../../../../../../vs/base/common/network.js";import"../../../../../../vs/editor/common/config/fontInfo.js";import"../../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../../vs/platform/instantiation/common/instantiation.js";import{MultiDiffEditorItem as S}from"../../../../../../vs/workbench/contrib/multiDiffEditor/browser/multiDiffSourceResolverService.js";import{DiffElementPlaceholderViewModel as N,SideBySideDiffElementViewModel as D,SingleSideDiffElementViewModel as E}from"../../../../../../vs/workbench/contrib/notebook/browser/diff/diffElementViewModel.js";import"../../../../../../vs/workbench/contrib/notebook/browser/diff/eventDispatcher.js";import{NOTEBOOK_DIFF_ITEM_DIFF_STATE as y,NOTEBOOK_DIFF_ITEM_KIND as b}from"../../../../../../vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser.js";import"../../../../../../vs/workbench/contrib/notebook/common/model/notebookTextModel.js";import{CellUri as p}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import"../../../../../../vs/workbench/contrib/notebook/common/notebookService.js";import"../../../../../../vs/workbench/contrib/notebook/common/services/notebookWorkerService.js";class pe extends V{constructor(t,o,e,i,n,l,f,s){super();this.model=t;this.notebookEditorWorkerService=o;this.instantiationService=e;this.configurationService=i;this.eventDispatcher=n;this.notebookService=l;this.fontInfo=f;this.excludeUnchangedPlaceholder=s;this.hideOutput=this.model.modified.notebook.transientOptions.transientOutputs||this.configurationService.getValue("notebook.diff.ignoreOutputs"),this.hideCellMetadata=this.configurationService.getValue("notebook.diff.ignoreMetadata"),this._register(this.configurationService.onDidChangeConfiguration(r=>{let h=!1;if(r.affectsConfiguration("notebook.diff.ignoreMetadata")){const u=this.configurationService.getValue("notebook.diff.ignoreMetadata");u!==void 0&&this.hideCellMetadata!==u&&(this.hideCellMetadata=u,h=!0)}if(r.affectsConfiguration("notebook.diff.ignoreOutputs")){const u=this.configurationService.getValue("notebook.diff.ignoreOutputs");u!==void 0&&this.hideOutput!==(u||this.model.modified.notebook.transientOptions.transientOutputs)&&(this.hideOutput=u||!!this.model.modified.notebook.transientOptions.transientOutputs,h=!0)}h&&this._onDidChange.fire()}))}placeholderAndRelatedCells=new Map;_items=[];get items(){return this._items}_onDidChangeItems=this._register(new k);onDidChangeItems=this._onDidChangeItems.event;disposables=this._register(new x);_onDidChange=this._register(new k);diffEditorItems=[];onDidChange=this._onDidChange.event;get value(){return this.diffEditorItems.filter(t=>t.type!=="placeholder").filter(t=>this._includeUnchanged?!0:t instanceof m||t instanceof g||t instanceof I?!(t.type==="unchanged"&&t.containerType==="unchanged"):!0).filter(t=>t instanceof I?!this.hideOutput:!0).filter(t=>t instanceof g?!this.hideCellMetadata:!0)}_hasUnchangedCells;get hasUnchangedCells(){return this._hasUnchangedCells===!0}_includeUnchanged;get includeUnchanged(){return this._includeUnchanged===!0}set includeUnchanged(t){this._includeUnchanged=t,this._onDidChange.fire()}hideOutput;hideCellMetadata;originalCellViewModels=[];dispose(){this.clear(),super.dispose()}clear(){this.disposables.clear(),C(Array.from(this.placeholderAndRelatedCells.keys())),this.placeholderAndRelatedCells.clear(),C(this.originalCellViewModels),this.originalCellViewModels=[],C(this._items),this._items.splice(0,this._items.length)}async computeDiff(t){const o=await this.notebookEditorWorkerService.computeDiff(this.model.original.resource,this.model.modified.resource);if(t.isCancellationRequested)return;O(this.model,o.cellsDiff);const{cellDiffInfo:e,firstChangeIndex:i}=_(this.model,o);if(!U(e,this.originalCellViewModels,this.model))return this.updateViewModels(e),this.updateDiffEditorItems(),{firstChangeIndex:i}}updateDiffEditorItems(){this.diffEditorItems=[];const t=this.model.original.resource,o=this.model.modified.resource;this._hasUnchangedCells=!1,this.items.forEach(e=>{switch(e.type){case"delete":{this.diffEditorItems.push(new m(e.original.uri,void 0,e.type,e.type));const i=p.generateCellPropertyUri(t,e.original.handle,c.vscodeNotebookCellMetadata);this.diffEditorItems.push(new g(i,void 0,e.type,e.type));const n=p.generateCellPropertyUri(t,e.original.handle,c.vscodeNotebookCellOutput);this.diffEditorItems.push(new I(n,void 0,e.type,e.type));break}case"insert":{this.diffEditorItems.push(new m(void 0,e.modified.uri,e.type,e.type));const i=p.generateCellPropertyUri(o,e.modified.handle,c.vscodeNotebookCellMetadata);this.diffEditorItems.push(new g(void 0,i,e.type,e.type));const n=p.generateCellPropertyUri(o,e.modified.handle,c.vscodeNotebookCellOutput);this.diffEditorItems.push(new I(void 0,n,e.type,e.type));break}case"modified":{const i=e.checkIfInputModified()?e.type:"unchanged",n=e.checkIfInputModified()||e.checkMetadataIfModified()||e.checkIfOutputsModified()?e.type:"unchanged";this.diffEditorItems.push(new m(e.original.uri,e.modified.uri,i,n));const l=p.generateCellPropertyUri(t,e.original.handle,c.vscodeNotebookCellMetadata),f=p.generateCellPropertyUri(o,e.modified.handle,c.vscodeNotebookCellMetadata);this.diffEditorItems.push(new g(l,f,e.checkMetadataIfModified()?e.type:"unchanged",n));const s=p.generateCellPropertyUri(t,e.original.handle,c.vscodeNotebookCellOutput),r=p.generateCellPropertyUri(o,e.modified.handle,c.vscodeNotebookCellOutput);this.diffEditorItems.push(new I(s,r,e.checkIfOutputsModified()?e.type:"unchanged",n));break}case"unchanged":{this._hasUnchangedCells=!0,this.diffEditorItems.push(new m(e.original.uri,e.modified.uri,e.type,e.type));const i=p.generateCellPropertyUri(t,e.original.handle,c.vscodeNotebookCellMetadata),n=p.generateCellPropertyUri(o,e.modified.handle,c.vscodeNotebookCellMetadata);this.diffEditorItems.push(new g(i,n,e.type,e.type));const l=p.generateCellPropertyUri(t,e.original.handle,c.vscodeNotebookCellOutput),f=p.generateCellPropertyUri(o,e.modified.handle,c.vscodeNotebookCellOutput);this.diffEditorItems.push(new I(l,f,e.type,e.type));break}}}),this._onDidChange.fire()}updateViewModels(t){const o=R(this.instantiationService,this.configurationService,this.model,this.eventDispatcher,t,this.fontInfo,this.notebookService),e=this._items.length;this.clear(),this._items.splice(0,e);let i;this.originalCellViewModels=o,o.forEach((n,l)=>{if(n.type==="unchanged"&&!this.excludeUnchangedPlaceholder){if(!i){n.displayIconToHideUnmodifiedCells=!0,i=new N(n.mainDocumentTextModel,n.editorEventDispatcher,n.initData),this._items.push(i);const s=i;this.disposables.add(s.onUnfoldHiddenCells(()=>{const r=this.placeholderAndRelatedCells.get(s);if(!Array.isArray(r))return;const h=this._items.indexOf(s);this._items.splice(h,1,...r),this._onDidChangeItems.fire({start:h,deleteCount:1,elements:r})})),this.disposables.add(n.onHideUnchangedCells(()=>{const r=this.placeholderAndRelatedCells.get(s);if(!Array.isArray(r))return;const h=this._items.indexOf(n);this._items.splice(h,r.length,s),this._onDidChangeItems.fire({start:h,deleteCount:r.length,elements:[s]})}))}const f=this.placeholderAndRelatedCells.get(i)||[];f.push(n),this.placeholderAndRelatedCells.set(i,f),i.hiddenCells.push(n)}else i=void 0,this._items.push(n)}),this._onDidChangeItems.fire({start:0,deleteCount:e,elements:this._items})}}function O(d,a){const t=a.changes;for(let o=0;o<a.changes.length-1;o++){const e=t[o],i=t[o+1],n=e.originalStart,l=e.modifiedStart;e.originalLength===1&&e.modifiedLength===0&&i.originalStart===n+2&&i.originalLength===0&&i.modifiedStart===l+1&&i.modifiedLength===1&&d.original.notebook.cells[n].getHashValue()===d.modified.notebook.cells[l+1].getHashValue()&&d.original.notebook.cells[n+1].getHashValue()===d.modified.notebook.cells[l].getHashValue()&&(e.originalStart=n,e.originalLength=0,e.modifiedStart=l,e.modifiedLength=1,i.originalStart=n+1,i.originalLength=1,i.modifiedStart=l+2,i.modifiedLength=0,o++)}}function _(d,a){const t=a.cellsDiff.changes,o=[],e=d.original.notebook,i=d.modified.notebook;let n=0,l=0,f=-1;for(let s=0;s<t.length;s++){const r=t[s];for(let u=0;u<r.originalStart-n;u++){const w=e.cells[n+u],v=i.cells[l+u];w.getHashValue()===v.getHashValue()?o.push({originalCellIndex:n+u,modifiedCellIndex:l+u,type:"unchanged"}):(f===-1&&(f=o.length),o.push({originalCellIndex:n+u,modifiedCellIndex:l+u,type:"modified"}))}const h=T(r,e,i);h.length&&f===-1&&(f=o.length),o.push(...h),n=r.originalStart+r.originalLength,l=r.modifiedStart+r.modifiedLength}for(let s=n;s<e.cells.length;s++)o.push({originalCellIndex:s,modifiedCellIndex:s-n+l,type:"unchanged"});return{cellDiffInfo:o,firstChangeIndex:f}}function U(d,a,t){if(d.length!==a.length)return!1;const o=t.original.notebook,e=t.modified.notebook;for(let i=0;i<a.length;i++){const n=d[i],l=a[i];if(n.type!==l.type)return!1;switch(n.type){case"delete":{if(o.cells[n.originalCellIndex].handle!==l.original?.handle)return!1;continue}case"insert":{if(e.cells[n.modifiedCellIndex].handle!==l.modified?.handle)return!1;continue}default:{if(o.cells[n.originalCellIndex].handle!==l.original?.handle||e.cells[n.modifiedCellIndex].handle!==l.modified?.handle)return!1;continue}}}return!0}function R(d,a,t,o,e,i,n){const l=t.original.notebook,f=t.modified.notebook,s={metadataStatusHeight:a.getValue("notebook.diff.ignoreMetadata")?0:25,outputStatusHeight:a.getValue("notebook.diff.ignoreOutputs")||f.transientOptions.transientOutputs?0:25,fontInfo:i};return e.map(r=>{switch(r.type){case"delete":return new E(l,f,l.cells[r.originalCellIndex],void 0,"delete",o,s,n);case"insert":return new E(f,l,void 0,f.cells[r.modifiedCellIndex],"insert",o,s,n);case"modified":return new D(t.modified.notebook,t.original.notebook,l.cells[r.originalCellIndex],f.cells[r.modifiedCellIndex],"modified",o,s,n);case"unchanged":return new D(t.modified.notebook,t.original.notebook,l.cells[r.originalCellIndex],f.cells[r.modifiedCellIndex],"unchanged",o,s,n)}})}function T(d,a,t){const o=[],e=Math.min(d.originalLength,d.modifiedLength);for(let i=0;i<e;i++){const n=a.cells[d.originalStart+i].equal(t.cells[d.modifiedStart+i]);o.push({originalCellIndex:d.originalStart+i,modifiedCellIndex:d.modifiedStart+i,type:n?"unchanged":"modified"})}for(let i=e;i<d.originalLength;i++)o.push({originalCellIndex:d.originalStart+i,type:"delete"});for(let i=e;i<d.modifiedLength;i++)o.push({modifiedCellIndex:d.modifiedStart+i,type:"insert"});return o}class M extends S{constructor(t,o,e,i,n,l,f){super(t,o,e,f);this.type=i;this.containerType=n;this.kind=l}}class m extends M{constructor(a,t,o,e){super(a,t,t||a,o,e,"Cell",{[b.key]:"Cell",[y.key]:o})}}class g extends M{constructor(a,t,o,e){super(a,t,t||a,o,e,"Metadata",{[b.key]:"Metadata",[y.key]:o})}}class I extends M{constructor(a,t,o,e){super(a,t,t||a,o,e,"Output",{[b.key]:"Output",[y.key]:o})}}export{pe as NotebookDiffViewModel,M as NotebookMultiDiffEditorItem,O as prettyChanges};
