import"./iPadShowKeyboard.css";import*as e from"../../../../base/browser/dom.js";import{Disposable as o}from"../../../../base/common/lifecycle.js";import{OverlayWidgetPositionPreference as s}from"../../../browser/editorBrowser.js";import{EditorContributionInstantiation as n,registerEditorContribution as a}from"../../../browser/editorExtensions.js";import"../../../common/editorCommon.js";import{EditorOption as l}from"../../../common/config/editorOptions.js";import{isIOS as p}from"../../../../base/common/platform.js";class r extends o{static ID="editor.contrib.iPadShowKeyboard";editor;widget;constructor(i){super(),this.editor=i,this.widget=null,p&&(this._register(i.onDidChangeConfiguration(()=>this.update())),this.update())}update(){const i=!this.editor.getOption(l.readOnly);!this.widget&&i?this.widget=new t(this.editor):this.widget&&!i&&(this.widget.dispose(),this.widget=null)}dispose(){super.dispose(),this.widget&&(this.widget.dispose(),this.widget=null)}}class t extends o{static ID="editor.contrib.ShowKeyboardWidget";editor;_domNode;constructor(i){super(),this.editor=i,this._domNode=document.createElement("textarea"),this._domNode.className="iPadShowKeyboard",this._register(e.addDisposableListener(this._domNode,"touchstart",d=>{this.editor.focus()})),this._register(e.addDisposableListener(this._domNode,"focus",d=>{this.editor.focus()})),this.editor.addOverlayWidget(this)}dispose(){this.editor.removeOverlayWidget(this),super.dispose()}getId(){return t.ID}getDomNode(){return this._domNode}getPosition(){return{preference:s.BOTTOM_RIGHT_CORNER}}}a(r.ID,r,n.Eventually);export{r as IPadShowKeyboard};
