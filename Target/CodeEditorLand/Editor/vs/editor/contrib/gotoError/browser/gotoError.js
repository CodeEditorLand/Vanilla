var M=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var b=(s,i,t,e)=>{for(var o=e>1?void 0:e?w(i,t):i,u=s.length-1,f;u>=0;u--)(f=s[u])&&(o=(e?f(i,t,o):f(o))||o);return e&&o&&M(i,t,o),o},d=(s,i)=>(t,e)=>i(t,e,s);import{Codicon as I}from"../../../../base/common/codicons.js";import{KeyCode as a,KeyMod as l}from"../../../../base/common/keyCodes.js";import{DisposableStore as y}from"../../../../base/common/lifecycle.js";import{EditorAction as S,EditorCommand as D,EditorContributionInstantiation as P,registerEditorAction as g,registerEditorCommand as A,registerEditorContribution as L}from"../../../browser/editorExtensions.js";import{ICodeEditorService as N}from"../../../browser/services/codeEditorService.js";import{Position as O}from"../../../common/core/position.js";import{Range as E}from"../../../common/core/range.js";import{EditorContextKeys as c}from"../../../common/editorContextKeys.js";import{IMarkerNavigationService as F}from"./markerNavigationService.js";import*as n from"../../../../nls.js";import{MenuId as k}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as G,RawContextKey as K}from"../../../../platform/contextkey/common/contextkey.js";import{TextEditorSelectionRevealType as T}from"../../../../platform/editor/common/editor.js";import{IInstantiationService as W}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as m}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{registerIcon as C}from"../../../../platform/theme/common/iconRegistry.js";import{MarkerNavigationWidget as v}from"./gotoErrorWidget.js";let r=class{constructor(i,t,e,o,u){this._markerNavigationService=t;this._contextKeyService=e;this._editorService=o;this._instantiationService=u;this._editor=i,this._widgetVisible=x.bindTo(this._contextKeyService)}static ID="editor.contrib.markerController";static get(i){return i.getContribution(r.ID)}_editor;_widgetVisible;_sessionDispoables=new y;_model;_widget;dispose(){this._cleanUp(),this._sessionDispoables.dispose()}_cleanUp(){this._widgetVisible.reset(),this._sessionDispoables.clear(),this._widget=void 0,this._model=void 0}_getOrCreateModel(i){if(this._model&&this._model.matches(i))return this._model;let t=!1;return this._model&&(t=!0,this._cleanUp()),this._model=this._markerNavigationService.getMarkerList(i),t&&this._model.move(!0,this._editor.getModel(),this._editor.getPosition()),this._widget=this._instantiationService.createInstance(v,this._editor),this._widget.onDidClose(()=>this.close(),this,this._sessionDispoables),this._widgetVisible.set(!0),this._sessionDispoables.add(this._model),this._sessionDispoables.add(this._widget),this._sessionDispoables.add(this._editor.onDidChangeCursorPosition(e=>{(!this._model?.selected||!E.containsPosition(this._model?.selected.marker,e.position))&&this._model?.resetIndex()})),this._sessionDispoables.add(this._model.onDidChange(()=>{if(!this._widget||!this._widget.position||!this._model)return;const e=this._model.find(this._editor.getModel().uri,this._widget.position);e?this._widget.updateMarker(e.marker):this._widget.showStale()})),this._sessionDispoables.add(this._widget.onDidSelectRelatedInformation(e=>{this._editorService.openCodeEditor({resource:e.resource,options:{pinned:!0,revealIfOpened:!0,selection:E.lift(e).collapseToStart()}},this._editor),this.close(!1)})),this._sessionDispoables.add(this._editor.onDidChangeModel(()=>this._cleanUp())),this._model}close(i=!0){this._cleanUp(),i&&this._editor.focus()}showAtMarker(i){if(this._editor.hasModel()){const t=this._getOrCreateModel(this._editor.getModel().uri);t.resetIndex(),t.move(!0,this._editor.getModel(),new O(i.startLineNumber,i.startColumn)),t.selected&&this._widget.showAtMarker(t.selected.marker,t.selected.index,t.selected.total)}}async nagivate(i,t){if(this._editor.hasModel()){const e=this._getOrCreateModel(t?void 0:this._editor.getModel().uri);if(e.move(i,this._editor.getModel(),this._editor.getPosition()),!e.selected)return;if(e.selected.marker.resource.toString()!==this._editor.getModel().uri.toString()){this._cleanUp();const o=await this._editorService.openCodeEditor({resource:e.selected.marker.resource,options:{pinned:!1,revealIfOpened:!0,selectionRevealType:T.NearTop,selection:e.selected.marker}},this._editor);o&&(r.get(o)?.close(),r.get(o)?.nagivate(i,t))}else this._widget.showAtMarker(e.selected.marker,e.selected.index,e.selected.total)}}};r=b([d(1,F),d(2,G),d(3,N),d(4,W)],r);class _ extends S{constructor(t,e,o){super(o);this._next=t;this._multiFile=e}async run(t,e){e.hasModel()&&r.get(e)?.nagivate(this._next,this._multiFile)}}class p extends _{static ID="editor.action.marker.next";static LABEL=n.localize("markerAction.next.label","Go to Next Problem (Error, Warning, Info)");constructor(){super(!0,!1,{id:p.ID,label:p.LABEL,alias:"Go to Next Problem (Error, Warning, Info)",precondition:void 0,kbOpts:{kbExpr:c.focus,primary:l.Alt|a.F8,weight:m.EditorContrib},menuOpts:{menuId:v.TitleMenu,title:p.LABEL,icon:C("marker-navigation-next",I.arrowDown,n.localize("nextMarkerIcon","Icon for goto next marker.")),group:"navigation",order:1}})}}class h extends _{static ID="editor.action.marker.prev";static LABEL=n.localize("markerAction.previous.label","Go to Previous Problem (Error, Warning, Info)");constructor(){super(!1,!1,{id:h.ID,label:h.LABEL,alias:"Go to Previous Problem (Error, Warning, Info)",precondition:void 0,kbOpts:{kbExpr:c.focus,primary:l.Shift|l.Alt|a.F8,weight:m.EditorContrib},menuOpts:{menuId:v.TitleMenu,title:h.LABEL,icon:C("marker-navigation-previous",I.arrowUp,n.localize("previousMarkerIcon","Icon for goto previous marker.")),group:"navigation",order:2}})}}class z extends _{constructor(){super(!0,!0,{id:"editor.action.marker.nextInFiles",label:n.localize("markerAction.nextInFiles.label","Go to Next Problem in Files (Error, Warning, Info)"),alias:"Go to Next Problem in Files (Error, Warning, Info)",precondition:void 0,kbOpts:{kbExpr:c.focus,primary:a.F8,weight:m.EditorContrib},menuOpts:{menuId:k.MenubarGoMenu,title:n.localize({key:"miGotoNextProblem",comment:["&& denotes a mnemonic"]},"Next &&Problem"),group:"6_problem_nav",order:1}})}}class R extends _{constructor(){super(!1,!0,{id:"editor.action.marker.prevInFiles",label:n.localize("markerAction.previousInFiles.label","Go to Previous Problem in Files (Error, Warning, Info)"),alias:"Go to Previous Problem in Files (Error, Warning, Info)",precondition:void 0,kbOpts:{kbExpr:c.focus,primary:l.Shift|a.F8,weight:m.EditorContrib},menuOpts:{menuId:k.MenubarGoMenu,title:n.localize({key:"miGotoPreviousProblem",comment:["&& denotes a mnemonic"]},"Previous &&Problem"),group:"6_problem_nav",order:2}})}}L(r.ID,r,P.Lazy),g(p),g(h),g(z),g(R);const x=new K("markersNavigationVisible",!1),U=D.bindToContribution(r.get);A(new U({id:"closeMarkersNavigation",precondition:x,handler:s=>s.close(),kbOpts:{weight:m.EditorContrib+50,kbExpr:c.focus,primary:a.Escape,secondary:[l.Shift|a.Escape]}}));export{r as MarkerController,p as NextMarkerAction};
