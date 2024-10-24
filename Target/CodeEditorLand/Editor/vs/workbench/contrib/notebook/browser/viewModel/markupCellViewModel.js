var _=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var g=(l,r,t,e)=>{for(var o=e>1?void 0:e?b(r,t):r,i=l.length-1,n;i>=0;i--)(n=l[i])&&(o=(e?n(r,t,o):n(o))||o);return e&&o&&_(r,t,o),o},h=(l,r)=>(t,e)=>r(t,e,l);import{Emitter as p}from"../../../../../base/common/event.js";import*as v from"../../../../../base/common/uuid.js";import"../../../../../editor/common/editorCommon.js";import{IConfigurationService as y}from"../../../../../platform/configuration/common/configuration.js";import{CellEditState as u,CellFoldingState as I,CellLayoutContext as w,CellLayoutState as a}from"../notebookBrowser.js";import{BaseCellViewModel as S}from"./baseCellViewModel.js";import"../../common/model/notebookCellTextModel.js";import{CellKind as O}from"../../common/notebookCommon.js";import{ITextModelService as T}from"../../../../../editor/common/services/resolverService.js";import"./viewContext.js";import{IUndoRedoService as k}from"../../../../../platform/undoRedo/common/undoRedo.js";import"../notebookOptions.js";import{ICodeEditorService as x}from"../../../../../editor/browser/services/codeEditorService.js";import{NotebookCellStateChangedEvent as E}from"../notebookViewEvents.js";let s=class extends S{constructor(t,e,o,i,n,m,H,f,c){super(t,e,v.generateUuid(),n,m,H,f,c);this.foldingDelegate=i;this.viewContext=n;const{bottomToolbarGap:C}=this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);this._layoutInfo={chatHeight:0,editorHeight:0,previewHeight:0,fontInfo:o?.fontInfo||null,editorWidth:o?.width?this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(o.width):0,commentOffset:0,commentHeight:0,bottomToolbarOffset:C,totalHeight:100,layoutState:a.Uninitialized,foldHintHeight:0,statusBarHeight:0},this._register(this.onDidChangeState(d=>{this.viewContext.eventDispatcher.emit([new E(d,this.model)]),d.foldingStateChanged&&this._updateTotalHeight(this._computeTotalHeight(),w.Fold)}))}cellKind=O.Markup;_layoutInfo;_renderedHtml;get renderedHtml(){return this._renderedHtml}set renderedHtml(t){this._renderedHtml!==t&&(this._renderedHtml=t,this._onDidChangeState.fire({contentChanged:!0}))}get layoutInfo(){return this._layoutInfo}_previewHeight=0;set renderedMarkdownHeight(t){this._previewHeight=t,this._updateTotalHeight(this._computeTotalHeight())}_chatHeight=0;set chatHeight(t){this._chatHeight=t,this._updateTotalHeight(this._computeTotalHeight())}get chatHeight(){return this._chatHeight}_editorHeight=0;_statusBarHeight=0;set editorHeight(t){this._editorHeight=t,this._statusBarHeight=this.viewContext.notebookOptions.computeStatusBarHeight(),this._updateTotalHeight(this._computeTotalHeight())}get editorHeight(){throw new Error("MarkdownCellViewModel.editorHeight is write only")}_onDidChangeLayout=this._register(new p);onDidChangeLayout=this._onDidChangeLayout.event;get foldingState(){return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this))}_hoveringOutput=!1;get outputIsHovered(){return this._hoveringOutput}set outputIsHovered(t){this._hoveringOutput=t}_focusOnOutput=!1;get outputIsFocused(){return this._focusOnOutput}set outputIsFocused(t){this._focusOnOutput=t}get inputInOutputIsFocused(){return!1}set inputInOutputIsFocused(t){}_hoveringCell=!1;get cellIsHovered(){return this._hoveringCell}set cellIsHovered(t){this._hoveringCell=t,this._onDidChangeState.fire({cellIsHoveredChanged:!0})}_computeTotalHeight(){const t=this.viewContext.notebookOptions.getLayoutConfiguration(),{bottomToolbarGap:e}=this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType),o=this._computeFoldHintHeight();return this.getEditState()===u.Editing?this._editorHeight+t.markdownCellTopMargin+t.markdownCellBottomMargin+e+this._statusBarHeight+this._commentHeight:Math.max(1,this._previewHeight+e+o+this._commentHeight)}_computeFoldHintHeight(){return this.getEditState()===u.Editing||this.foldingState!==I.Collapsed?0:this.viewContext.notebookOptions.getLayoutConfiguration().markdownFoldHintHeight}updateOptions(t){(t.cellStatusBarVisibility||t.insertToolbarPosition||t.cellToolbarLocation)&&this._updateTotalHeight(this._computeTotalHeight())}outputsViewModels=[];getOutputOffset(t){return-1}updateOutputHeight(t,e){}triggerFoldingStateChange(){this._onDidChangeState.fire({foldingStateChanged:!0})}_updateTotalHeight(t,e){t!==this.layoutInfo.totalHeight&&this.layoutChange({totalHeight:t,context:e})}layoutChange(t){let e,o;this.isInputCollapsed?(e=this.viewContext.notebookOptions.computeCollapsedMarkdownCellHeight(this.viewType),t.totalHeight=e,o=0):(e=t.totalHeight===void 0?this._layoutInfo.layoutState===a.Uninitialized?100:this._layoutInfo.totalHeight:t.totalHeight,o=this._computeFoldHintHeight());let i;if(this.getEditState()===u.Editing){const n=this.viewContext.notebookOptions.getLayoutConfiguration();i=n.editorToolbarHeight+n.cellTopMargin+this._chatHeight+this._editorHeight+this._statusBarHeight}else i=this._previewHeight;this._layoutInfo={fontInfo:t.font||this._layoutInfo.fontInfo,editorWidth:t.outerWidth!==void 0?this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(t.outerWidth):this._layoutInfo.editorWidth,chatHeight:this._chatHeight,editorHeight:this._editorHeight,statusBarHeight:this._statusBarHeight,previewHeight:this._previewHeight,bottomToolbarOffset:this.viewContext.notebookOptions.computeBottomToolbarOffset(e,this.viewType),totalHeight:e,layoutState:a.Measured,foldHintHeight:o,commentOffset:i,commentHeight:t.commentHeight?this._commentHeight:this._layoutInfo.commentHeight},this._onDidChangeLayout.fire(t)}restoreEditorViewState(t,e){super.restoreEditorViewState(t),e!==void 0&&this.layoutInfo.layoutState===a.Uninitialized&&(this._layoutInfo={...this.layoutInfo,totalHeight:e,chatHeight:this._chatHeight,editorHeight:this._editorHeight,statusBarHeight:this._statusBarHeight,layoutState:a.FromCache},this.layoutChange({}))}getDynamicHeight(){return null}getHeight(t){return this._layoutInfo.layoutState===a.Uninitialized?100:this._layoutInfo.totalHeight}onDidChangeTextModelContent(){this._onDidChangeState.fire({contentChanged:!0})}onDeselect(){}_hasFindResult=this._register(new p);hasFindResult=this._hasFindResult.event;startFind(t,e){const o=super.cellStartFind(t,e);return o===null?null:{cell:this,contentMatches:o}}dispose(){super.dispose(),this.foldingDelegate=null}};s=g([h(5,y),h(6,T),h(7,k),h(8,x)],s);export{s as MarkupCellViewModel};
