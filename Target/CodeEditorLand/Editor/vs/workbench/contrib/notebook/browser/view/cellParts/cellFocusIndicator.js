import*as e from"../../../../../../base/browser/dom.js";import{FastDomNode as s}from"../../../../../../base/browser/fastDomNode.js";import{CellKind as a}from"../../../common/notebookCommon.js";import{CellContentPart as d}from"../cellPart.js";class C extends d{constructor(t,o,r,l,i,p){super();this.notebookEditor=t;this.titleToolbar=o;this.top=r;this.left=l;this.right=i;this.bottom=p;this.codeFocusIndicator=new s(e.append(this.left.domNode,e.$(".codeOutput-focus-indicator-container",void 0,e.$(".codeOutput-focus-indicator.code-focus-indicator")))),this.outputFocusIndicator=new s(e.append(this.left.domNode,e.$(".codeOutput-focus-indicator-container",void 0,e.$(".codeOutput-focus-indicator.output-focus-indicator")))),this._register(e.addDisposableListener(this.codeFocusIndicator.domNode,e.EventType.CLICK,()=>{this.currentCell&&(this.currentCell.isInputCollapsed=!this.currentCell.isInputCollapsed)})),this._register(e.addDisposableListener(this.outputFocusIndicator.domNode,e.EventType.CLICK,()=>{this.currentCell&&(this.currentCell.isOutputCollapsed=!this.currentCell.isOutputCollapsed)})),this._register(e.addDisposableListener(this.left.domNode,e.EventType.DBLCLICK,n=>{if(!this.currentCell||!this.notebookEditor.hasModel()||n.target!==this.left.domNode)return;n.offsetY<this.currentCell.layoutInfo.outputContainerOffset?this.currentCell.isInputCollapsed=!this.currentCell.isInputCollapsed:this.currentCell.isOutputCollapsed=!this.currentCell.isOutputCollapsed})),this._register(this.titleToolbar.onDidUpdateActions(()=>{this.updateFocusIndicatorsForTitleMenu()}))}codeFocusIndicator;outputFocusIndicator;updateInternalLayoutNow(t){if(t.cellKind===a.Markup){const o=this.notebookEditor.notebookOptions.computeIndicatorPosition(t.layoutInfo.totalHeight,t.layoutInfo.foldHintHeight,this.notebookEditor.textModel?.viewType);this.bottom.domNode.style.transform=`translateY(${o.bottomIndicatorTop+6}px)`,this.left.setHeight(o.verticalIndicatorHeight),this.right.setHeight(o.verticalIndicatorHeight),this.codeFocusIndicator.setHeight(o.verticalIndicatorHeight-this.getIndicatorTopMargin()*2-t.layoutInfo.chatHeight)}else{const o=t,r=this.notebookEditor.notebookOptions.getLayoutConfiguration(),l=this.notebookEditor.notebookOptions.computeBottomToolbarDimensions(this.notebookEditor.textModel?.viewType),i=o.layoutInfo.codeIndicatorHeight+o.layoutInfo.outputIndicatorHeight+o.layoutInfo.commentHeight;this.left.setHeight(i),this.right.setHeight(i),this.codeFocusIndicator.setHeight(o.layoutInfo.codeIndicatorHeight),this.outputFocusIndicator.setHeight(Math.max(o.layoutInfo.outputIndicatorHeight-o.viewContext.notebookOptions.getLayoutConfiguration().focusIndicatorGap,0)),this.bottom.domNode.style.transform=`translateY(${o.layoutInfo.totalHeight-l.bottomToolbarGap-r.cellBottomMargin}px)`}this.updateFocusIndicatorsForTitleMenu()}updateFocusIndicatorsForTitleMenu(){const t=(this.currentCell?.layoutInfo.chatHeight??0)+this.getIndicatorTopMargin();this.left.domNode.style.transform=`translateY(${t}px)`,this.right.domNode.style.transform=`translateY(${t}px)`}getIndicatorTopMargin(){const t=this.notebookEditor.notebookOptions.getLayoutConfiguration();return this.titleToolbar.hasActions?t.editorToolbarHeight+t.cellTopMargin:t.cellTopMargin}}export{C as CellFocusIndicator};
