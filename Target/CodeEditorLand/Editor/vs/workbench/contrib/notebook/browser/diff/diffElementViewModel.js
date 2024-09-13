import{Emitter as S}from"../../../../../base/common/event.js";import{hash as I}from"../../../../../base/common/hash.js";import{Disposable as v}from"../../../../../base/common/lifecycle.js";import{Schemas as O}from"../../../../../base/common/network.js";import{DiffEditorWidget as E}from"../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";import{getFormattedMetadataJSON as _}from"../../common/model/notebookCellTextModel.js";import{CellUri as w}from"../../common/notebookCommon.js";import{CellLayoutState as C}from"../notebookBrowser.js";import{getEditorPadding as H}from"./diffCellEditorOptions.js";import{DiffNestedCellViewModel as D}from"./diffNestedCellViewModel.js";import{NotebookDiffViewEventType as T}from"./eventDispatcher.js";import{DIFF_CELL_MARGIN as M,DiffSide as b}from"./notebookDiffEditorBrowser.js";const X=24,Y=17;var k=(t=>(t[t.Expanded=0]="Expanded",t[t.Collapsed=1]="Collapsed",t))(k||{});const N=1440;class V extends v{constructor(t,e,i){super();this.mainDocumentTextModel=t;this.editorEventDispatcher=e;this.initData=i;this._register(this.editorEventDispatcher.onDidChangeLayout(a=>this._layoutInfoEmitter.fire({outerWidth:!0})))}_layoutInfoEmitter=this._register(new S);onDidLayoutChange=this._layoutInfoEmitter.event}class Z extends V{type="placeholder";hiddenCells=[];_unfoldHiddenCells=this._register(new S);onUnfoldHiddenCells=this._unfoldHiddenCells.event;constructor(n,t,e){super(n,t,e)}get totalHeight(){return 24+2*M}getHeight(n){return this.totalHeight}layoutChange(){}showHiddenCells(){this._unfoldHiddenCells.fire()}}class x extends V{constructor(t,e,i,a,u,s,l,h,p,m){super(t,u,s);this.type=a;this.index=h;this.configurationService=p;this.unchangedRegionsService=m;this.original=e?this._register(new D(e,l)):void 0,this.modified=i?this._register(new D(i,l)):void 0;const g=this._estimateEditorHeight(s.fontInfo),c=25;this._layoutInfo={width:0,editorHeight:g,editorMargin:0,metadataHeight:0,cellStatusHeight:c,metadataStatusHeight:this.ignoreMetadata?0:25,rawOutputHeight:0,outputTotalHeight:0,outputStatusHeight:this.ignoreOutputs?0:25,outputMetadataHeight:0,bodyMargin:32,totalHeight:82+c+g,layoutState:C.Uninitialized},this.cellFoldingState=i?.getTextBufferHash()!==e?.getTextBufferHash()?0:1,this.metadataFoldingState=1,this.outputFoldingState=1}cellFoldingState;metadataFoldingState;outputFoldingState;_stateChangeEmitter=this._register(new S);onDidStateChange=this._stateChangeEmitter.event;_layoutInfo;displayIconToHideUnmodifiedCells;_hideUnchangedCells=this._register(new S);onHideUnchangedCells=this._hideUnchangedCells.event;hideUnchangedCells(){this._hideUnchangedCells.fire()}set rawOutputHeight(t){this._layout({rawOutputHeight:Math.min(N,t)})}get rawOutputHeight(){throw new Error("Use Cell.layoutInfo.rawOutputHeight")}set outputStatusHeight(t){this._layout({outputStatusHeight:t})}get outputStatusHeight(){throw new Error("Use Cell.layoutInfo.outputStatusHeight")}set outputMetadataHeight(t){this._layout({outputMetadataHeight:t})}get outputMetadataHeight(){throw new Error("Use Cell.layoutInfo.outputStatusHeight")}set editorHeight(t){this._layout({editorHeight:t})}get editorHeight(){throw new Error("Use Cell.layoutInfo.editorHeight")}set editorMargin(t){this._layout({editorMargin:t})}get editorMargin(){throw new Error("Use Cell.layoutInfo.editorMargin")}set metadataStatusHeight(t){this._layout({metadataStatusHeight:t})}get metadataStatusHeight(){throw new Error("Use Cell.layoutInfo.outputStatusHeight")}set metadataHeight(t){this._layout({metadataHeight:t})}get metadataHeight(){throw new Error("Use Cell.layoutInfo.metadataHeight")}_renderOutput=!0;set renderOutput(t){this._renderOutput=t,this._layout({recomputeOutput:!0}),this._stateChangeEmitter.fire({renderOutput:this._renderOutput})}get renderOutput(){return this._renderOutput}get layoutInfo(){return this._layoutInfo}get totalHeight(){return this.layoutInfo.totalHeight}get ignoreOutputs(){return this.configurationService.getValue("notebook.diff.ignoreOutputs")||!!this.mainDocumentTextModel?.transientOptions.transientOutputs}get ignoreMetadata(){return this.configurationService.getValue("notebook.diff.ignoreMetadata")}_sourceEditorViewState=null;_outputEditorViewState=null;_metadataEditorViewState=null;original;modified;layoutChange(){this._layout({recomputeOutput:!0})}_estimateEditorHeight(t){const e=t?.lineHeight??17;switch(this.type){case"unchanged":case"insert":{const i=this.modified.textModel.textBuffer.getLineCount();return i*e+H(i).top+H(i).bottom}case"delete":case"modified":{const i=this.original.textModel.textBuffer.getLineCount();return i*e+H(i).top+H(i).bottom}}}_layout(t){const e=t.width!==void 0?t.width:this._layoutInfo.width,i=t.editorHeight!==void 0?t.editorHeight:this._layoutInfo.editorHeight,a=t.editorMargin!==void 0?t.editorMargin:this._layoutInfo.editorMargin,u=t.metadataHeight!==void 0?t.metadataHeight:this._layoutInfo.metadataHeight,s=t.cellStatusHeight!==void 0?t.cellStatusHeight:this._layoutInfo.cellStatusHeight,l=t.metadataStatusHeight!==void 0?t.metadataStatusHeight:this._layoutInfo.metadataStatusHeight,h=t.rawOutputHeight!==void 0?t.rawOutputHeight:this._layoutInfo.rawOutputHeight,p=t.outputStatusHeight!==void 0?t.outputStatusHeight:this._layoutInfo.outputStatusHeight,m=t.bodyMargin!==void 0?t.bodyMargin:this._layoutInfo.bodyMargin,g=t.outputMetadataHeight!==void 0?t.outputMetadataHeight:this._layoutInfo.outputMetadataHeight,c=this.ignoreOutputs?0:t.recomputeOutput||t.rawOutputHeight!==void 0||t.outputMetadataHeight!==void 0?this._getOutputTotalHeight(h,g):this._layoutInfo.outputTotalHeight,y=i+a+s+u+l+c+p+m,d={width:e,editorHeight:i,editorMargin:a,metadataHeight:u,cellStatusHeight:s,metadataStatusHeight:l,outputTotalHeight:c,outputStatusHeight:p,bodyMargin:m,rawOutputHeight:h,outputMetadataHeight:g,totalHeight:y,layoutState:C.Measured};let r=!1;const f={};d.width!==this._layoutInfo.width&&(f.width=!0,r=!0),d.editorHeight!==this._layoutInfo.editorHeight&&(f.editorHeight=!0,r=!0),d.editorMargin!==this._layoutInfo.editorMargin&&(f.editorMargin=!0,r=!0),d.metadataHeight!==this._layoutInfo.metadataHeight&&(f.metadataHeight=!0,r=!0),d.cellStatusHeight!==this._layoutInfo.cellStatusHeight&&(f.cellStatusHeight=!0,r=!0),d.metadataStatusHeight!==this._layoutInfo.metadataStatusHeight&&(f.metadataStatusHeight=!0,r=!0),d.outputTotalHeight!==this._layoutInfo.outputTotalHeight&&(f.outputTotalHeight=!0,r=!0),d.outputStatusHeight!==this._layoutInfo.outputStatusHeight&&(f.outputStatusHeight=!0,r=!0),d.bodyMargin!==this._layoutInfo.bodyMargin&&(f.bodyMargin=!0,r=!0),d.outputMetadataHeight!==this._layoutInfo.outputMetadataHeight&&(f.outputMetadataHeight=!0,r=!0),d.totalHeight!==this._layoutInfo.totalHeight&&(f.totalHeight=!0,r=!0),r&&(this._layoutInfo=d,this._fireLayoutChangeEvent(f))}getHeight(t){if(this._layoutInfo.layoutState===C.Uninitialized){const e=this.cellFoldingState===1?0:this.computeInputEditorHeight(t);return this._computeTotalHeight(e)}else return this._layoutInfo.totalHeight}_computeTotalHeight(t){return t+this._layoutInfo.editorMargin+this._layoutInfo.metadataHeight+this._layoutInfo.cellStatusHeight+this._layoutInfo.metadataStatusHeight+this._layoutInfo.outputTotalHeight+this._layoutInfo.outputStatusHeight+this._layoutInfo.outputMetadataHeight+this._layoutInfo.bodyMargin}computeInputEditorHeight(t){const e=Math.max(this.original?.textModel.textBuffer.getLineCount()??1,this.modified?.textModel.textBuffer.getLineCount()??1);return e*t+H(e).top+H(e).bottom}_getOutputTotalHeight(t,e){return this.outputFoldingState===1?0:this.renderOutput?this.isOutputEmpty()?24:this.getRichOutputTotalHeight()+e:t}_fireLayoutChangeEvent(t){this._layoutInfoEmitter.fire(t),this.editorEventDispatcher.emit([{type:T.CellLayoutChanged,source:this._layoutInfo}])}getComputedCellContainerWidth(t,e,i){return i?t.width-2*M+(e?E.ENTIRE_DIFF_OVERVIEW_WIDTH:0)-2:(t.width-2*M+(e?E.ENTIRE_DIFF_OVERVIEW_WIDTH:0))/2-18-2}getOutputEditorViewState(){return this._outputEditorViewState}saveOutputEditorViewState(t){this._outputEditorViewState=t}getMetadataEditorViewState(){return this._metadataEditorViewState}saveMetadataEditorViewState(t){this._metadataEditorViewState=t}getSourceEditorViewState(){return this._sourceEditorViewState}saveSpirceEditorViewState(t){this._sourceEditorViewState=t}}class $ extends x{constructor(t,e,i,a,u,s,l,h,p,m,g){super(t,i,a,u,s,l,h,m,p,g);this.otherDocumentTextModel=e;this.type=u,this.cellFoldingState=this.modified.textModel.getValue()!==this.original.textModel.getValue()?0:1,this.metadataFoldingState=1,this.outputFoldingState=1,this.checkMetadataIfModified()&&(this.metadataFoldingState=0),this.checkIfOutputsModified()&&(this.outputFoldingState=0),this._register(this.original.onDidChangeOutputLayout(()=>{this._layout({recomputeOutput:!0})})),this._register(this.modified.onDidChangeOutputLayout(()=>{this._layout({recomputeOutput:!0})})),this._register(this.modified.textModel.onDidChangeContent(()=>{if(t.transientOptions.cellContentMetadata){const c=[...Object.keys(t.transientOptions.cellContentMetadata)],y=Object.assign({},this.modified.metadata),d=this.original.metadata;for(const r of c)r in d&&(y[r]=d[r]);this.modified.textModel.metadata=y}}))}get originalDocument(){return this.otherDocumentTextModel}get modifiedDocument(){return this.mainDocumentTextModel}original;modified;type;editorHeightWithUnchangedLinesCollapsed;checkIfInputModified(){return this.original.textModel.getTextBufferHash()===this.modified.textModel.getTextBufferHash()?!1:{reason:"Cell content has changed"}}checkIfOutputsModified(){if(this.mainDocumentTextModel.transientOptions.transientOutputs)return!1;const t=L(this.original?.outputs??[],this.modified?.outputs??[]);return t===0?!1:{reason:t===1?"Output metadata has changed":void 0,kind:t}}checkMetadataIfModified(){return I(_(this.mainDocumentTextModel.transientOptions.transientCellMetadata,this.original?.metadata||{},this.original?.language))!==I(_(this.mainDocumentTextModel.transientOptions.transientCellMetadata,this.modified?.metadata??{},this.modified?.language))?{reason:void 0}:!1}updateOutputHeight(t,e,i){t===b.Original?this.original.updateOutputHeight(e,i):this.modified.updateOutputHeight(e,i)}getOutputOffsetInContainer(t,e){return t===b.Original?this.original.getOutputOffset(e):this.modified.getOutputOffset(e)}getOutputOffsetInCell(t,e){const i=this.getOutputOffsetInContainer(t,e);return this._layoutInfo.editorHeight+this._layoutInfo.editorMargin+this._layoutInfo.metadataHeight+this._layoutInfo.cellStatusHeight+this._layoutInfo.metadataStatusHeight+this._layoutInfo.outputStatusHeight+this._layoutInfo.bodyMargin/2+i}isOutputEmpty(){return this.mainDocumentTextModel.transientOptions.transientOutputs?!0:this.checkIfOutputsModified()?!1:(this.original?.outputs||[]).length===0}getRichOutputTotalHeight(){return Math.max(this.original.getOutputTotalHeight(),this.modified.getOutputTotalHeight())}getNestedCellViewModel(t){return t===b.Original?this.original:this.modified}getCellByUri(t){return t.toString()===this.original.uri.toString()?this.original:this.modified}computeInputEditorHeight(t){return this.type==="modified"&&typeof this.editorHeightWithUnchangedLinesCollapsed=="number"&&this.unchangedRegionsService.options.enabled&&this.checkIfInputModified()?this.editorHeightWithUnchangedLinesCollapsed:super.computeInputEditorHeight(t)}async computeInputEditorHeightWithUnchangedLinesHidden(){this.checkIfInputModified()&&(this.editorHeightWithUnchangedLinesCollapsed=this._layoutInfo.editorHeight=await this.unchangedRegionsService.computeEditorHeight(this.original.uri,this.modified.uri))}async computeMetadataEditorHeightWithUnchangedLinesHidden(){if(this.checkMetadataIfModified()){const t=w.generateCellPropertyUri(this.originalDocument.uri,this.original.handle,O.vscodeNotebookCellMetadata),e=w.generateCellPropertyUri(this.modifiedDocument.uri,this.modified.handle,O.vscodeNotebookCellMetadata);this._layoutInfo.metadataHeight=await this.unchangedRegionsService.computeEditorHeight(t,e)}}async computeEditorHeights(){this.type==="unchanged"||!this.unchangedRegionsService.options.enabled||await Promise.all([this.computeInputEditorHeightWithUnchangedLinesHidden(),this.computeMetadataEditorHeightWithUnchangedLinesHidden()])}}class tt extends x{constructor(t,e,i,a,u,s,l,h,p,m,g){super(t,i,a,u,s,l,h,g,p,m);this.otherDocumentTextModel=e;this.type=u,this._register(this.cellViewModel.onDidChangeOutputLayout(()=>{this._layout({recomputeOutput:!0})}))}get cellViewModel(){return this.type==="insert"?this.modified:this.original}get originalDocument(){return this.type==="insert"?this.otherDocumentTextModel:this.mainDocumentTextModel}get modifiedDocument(){return this.type==="insert"?this.mainDocumentTextModel:this.otherDocumentTextModel}type;checkIfInputModified(){return{reason:"Cell content has changed"}}getNestedCellViewModel(t){return this.type==="insert"?this.modified:this.original}checkIfOutputsModified(){return!1}checkMetadataIfModified(){return!1}updateOutputHeight(t,e,i){this.cellViewModel?.updateOutputHeight(e,i)}getOutputOffsetInContainer(t,e){return this.cellViewModel.getOutputOffset(e)}getOutputOffsetInCell(t,e){const i=this.cellViewModel.getOutputOffset(e);return this._layoutInfo.editorHeight+this._layoutInfo.editorMargin+this._layoutInfo.metadataHeight+this._layoutInfo.cellStatusHeight+this._layoutInfo.metadataStatusHeight+this._layoutInfo.outputStatusHeight+this._layoutInfo.bodyMargin/2+i}isOutputEmpty(){return this.mainDocumentTextModel.transientOptions.transientOutputs?!0:(this.original?.outputs||this.modified?.outputs||[]).length===0}getRichOutputTotalHeight(){return this.cellViewModel?.getOutputTotalHeight()??0}getCellByUri(t){return this.cellViewModel}}var U=(e=>(e[e.Unchanged=0]="Unchanged",e[e.Metadata=1]="Metadata",e[e.Other=2]="Other",e))(U||{});function et(o,n){if(I(o.metadata)===I(n.metadata))return 2;for(let t=0;t<o.outputs.length;t++){const e=o.outputs[t],i=n.outputs[t];if(e.mime!==i.mime||e.data.buffer.length!==i.data.buffer.length)return 2;for(let a=0;a<e.data.buffer.length;a++)if(e.data.buffer[a]!==i.data.buffer[a])return 2}return 1}function L(o,n){if(o.length!==n.length)return 2;const t=o.length;for(let e=0;e<t;e++){const i=o[e],a=n[e];if(I(i.metadata)!==I(a.metadata))return 1;if(i.outputs.length!==a.outputs.length)return 2;for(let u=0;u<i.outputs.length;u++){const s=i.outputs[u],l=a.outputs[u];if(s.mime!==l.mime||s.data.buffer.length!==l.data.buffer.length)return 2;for(let h=0;h<s.data.buffer.length;h++)if(s.data.buffer[h]!==l.data.buffer[h])return 2}}return 0}function F(o){if(!o.length)return null;const t=o[0].mime;return o.find(i=>i.mime!==t)?null:o.map(i=>i.data.toString()).join("")}function it(o){if(o.length===1){const n=F(o[0].outputs);if(n)return n}return JSON.stringify(o.map(n=>({metadata:n.metadata,outputItems:n.outputs.map(t=>({mimeType:t.mime,data:t.data.toString()}))})),void 0,"	")}export{Y as DefaultLineHeight,x as DiffElementCellViewModelBase,Z as DiffElementPlaceholderViewModel,V as DiffElementViewModelBase,X as HeightOfHiddenLinesRegionInDiffEditor,N as OUTPUT_EDITOR_HEIGHT_MAGIC,U as OutputComparison,k as PropertyFoldingState,$ as SideBySideDiffElementViewModel,tt as SingleSideDiffElementViewModel,it as getFormattedOutputJSON,F as getStreamOutputData,et as outputEqual};
