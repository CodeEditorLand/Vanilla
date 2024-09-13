var K=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var P=(r,e,i,t)=>{for(var o=t>1?void 0:t?M(e,i):e,n=r.length-1,d;n>=0;n--)(d=r[n])&&(o=(t?d(e,i,o):d(o))||o);return t&&o&&K(e,i,o),o},f=(r,e)=>(i,t)=>e(i,t,r);import{createCancelablePromise as W}from"../../../../../base/common/async.js";import{onUnexpectedError as A}from"../../../../../base/common/errors.js";import{KeyChord as O,KeyCode as s,KeyMod as l}from"../../../../../base/common/keyCodes.js";import{DisposableStore as L}from"../../../../../base/common/lifecycle.js";import*as b from"../../../../../nls.js";import{CommandsRegistry as v}from"../../../../../platform/commands/common/commands.js";import{IConfigurationService as N}from"../../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as c,IContextKeyService as D,RawContextKey as V}from"../../../../../platform/contextkey/common/contextkey.js";import{InputFocusedContext as q}from"../../../../../platform/contextkey/common/contextkeys.js";import{TextEditorSelectionSource as I}from"../../../../../platform/editor/common/editor.js";import{IInstantiationService as J}from"../../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as m,KeybindingsRegistry as u}from"../../../../../platform/keybinding/common/keybindingsRegistry.js";import{IListService as C,WorkbenchListFocusContextKey as F,WorkbenchTreeElementCanCollapse as k,WorkbenchTreeElementCanExpand as x}from"../../../../../platform/list/browser/listService.js";import{INotificationService as j}from"../../../../../platform/notification/common/notification.js";import{IStorageService as z,StorageScope as T,StorageTarget as U}from"../../../../../platform/storage/common/storage.js";import{ICodeEditorService as B}from"../../../../browser/services/codeEditorService.js";import{EditorOption as H}from"../../../../common/config/editorOptions.js";import{Position as G}from"../../../../common/core/position.js";import{Range as Q}from"../../../../common/core/range.js";import{EditorContextKeys as X}from"../../../../common/editorContextKeys.js";import{PeekContext as w,getOuterEditor as Y}from"../../../peekView/browser/peekView.js";import{OneReference as R}from"../referencesModel.js";import{LayoutData as Z,ReferenceWidget as $}from"./referencesWidget.js";const _=new V("referenceSearchVisible",!1,b.localize("referenceSearchVisible","Whether reference peek is visible, like 'Peek References' or 'Peek Definition'"));let h=class{constructor(e,i,t,o,n,d,y,a){this._defaultTreeKeyboardSupport=e;this._editor=i;this._editorService=o;this._notificationService=n;this._instantiationService=d;this._storageService=y;this._configurationService=a;this._referenceSearchVisible=_.bindTo(t)}static ID="editor.contrib.referencesController";_disposables=new L;_widget;_model;_peekMode;_requestIdPool=0;_ignoreModelChangeEvent=!1;_referenceSearchVisible;static get(e){return e.getContribution(h.ID)}dispose(){this._referenceSearchVisible.reset(),this._disposables.dispose(),this._widget?.dispose(),this._model?.dispose(),this._widget=void 0,this._model=void 0}toggleWidget(e,i,t){let o;if(this._widget&&(o=this._widget.position),this.closeWidget(),o&&e.containsPosition(o))return;this._peekMode=t,this._referenceSearchVisible.set(!0),this._disposables.add(this._editor.onDidChangeModelLanguage(()=>{this.closeWidget()})),this._disposables.add(this._editor.onDidChangeModel(()=>{this._ignoreModelChangeEvent||this.closeWidget()}));const n="peekViewLayout",d=Z.fromJSON(this._storageService.get(n,T.PROFILE,"{}"));this._widget=this._instantiationService.createInstance($,this._editor,this._defaultTreeKeyboardSupport,d),this._widget.setTitle(b.localize("labelLoading","Loading...")),this._widget.show(e),this._disposables.add(this._widget.onDidClose(()=>{i.cancel(),this._widget?(this._storageService.store(n,JSON.stringify(this._widget.layoutData),T.PROFILE,U.MACHINE),this._widget.isClosing||this.closeWidget(),this._widget=void 0):this.closeWidget()})),this._disposables.add(this._widget.onDidSelectReference(a=>{const{element:g,kind:S}=a;if(g)switch(S){case"open":(a.source!=="editor"||!this._configurationService.getValue("editor.stablePeek"))&&this.openReference(g,!1,!1);break;case"side":this.openReference(g,!0,!1);break;case"goto":t?this._gotoReference(g,!0):this.openReference(g,!1,!0);break}}));const y=++this._requestIdPool;i.then(a=>{if(y!==this._requestIdPool||!this._widget){a.dispose();return}return this._model?.dispose(),this._model=a,this._widget.setModel(this._model).then(()=>{if(this._widget&&this._model&&this._editor.hasModel()){this._model.isEmpty?this._widget.setMetaTitle(""):this._widget.setMetaTitle(b.localize("metaTitle.N","{0} ({1})",this._model.title,this._model.references.length));const g=this._editor.getModel().uri,S=new G(e.startLineNumber,e.startColumn),E=this._model.nearestReference(g,S);if(E)return this._widget.setSelection(E).then(()=>{this._widget&&this._editor.getOption(H.peekWidgetDefaultFocus)==="editor"&&this._widget.focusOnPreviewEditor()})}})},a=>{this._notificationService.error(a)})}changeFocusBetweenPreviewAndReferences(){this._widget&&(this._widget.isPreviewEditorFocused()?this._widget.focusOnReferenceTree():this._widget.focusOnPreviewEditor())}async goToNextOrPreviousReference(e){if(!this._editor.hasModel()||!this._model||!this._widget)return;const i=this._widget.position;if(!i)return;const t=this._model.nearestReference(this._editor.getModel().uri,i);if(!t)return;const o=this._model.nextOrPreviousReference(t,e),n=this._editor.hasTextFocus(),d=this._widget.isPreviewEditorFocused();await this._widget.setSelection(o),await this._gotoReference(o,!1),n?this._editor.focus():this._widget&&d&&this._widget.focusOnPreviewEditor()}async revealReference(e){!this._editor.hasModel()||!this._model||!this._widget||await this._widget.revealReference(e)}closeWidget(e=!0){this._widget?.dispose(),this._model?.dispose(),this._referenceSearchVisible.reset(),this._disposables.clear(),this._widget=void 0,this._model=void 0,e&&this._editor.focus(),this._requestIdPool+=1}_gotoReference(e,i){this._widget?.hide(),this._ignoreModelChangeEvent=!0;const t=Q.lift(e.range).collapseToStart();return this._editorService.openCodeEditor({resource:e.uri,options:{selection:t,selectionSource:I.JUMP,pinned:i}},this._editor).then(o=>{if(this._ignoreModelChangeEvent=!1,!o||!this._widget){this.closeWidget();return}if(this._editor===o)this._widget.show(t),this._widget.focusOnReferenceTree();else{const n=h.get(o),d=this._model.clone();this.closeWidget(),o.focus(),n?.toggleWidget(t,W(y=>Promise.resolve(d)),this._peekMode??!1)}},o=>{this._ignoreModelChangeEvent=!1,A(o)})}openReference(e,i,t){i||this.closeWidget();const{uri:o,range:n}=e;this._editorService.openCodeEditor({resource:o,options:{selection:n,selectionSource:I.JUMP,pinned:t}},this._editor,i)}};h=P([f(2,D),f(3,B),f(4,j),f(5,J),f(6,z),f(7,N)],h);function p(r,e){const i=Y(r);if(!i)return;const t=h.get(i);t&&e(t)}u.registerCommandAndKeybindingRule({id:"togglePeekWidgetFocus",weight:m.EditorContrib,primary:O(l.CtrlCmd|s.KeyK,s.F2),when:c.or(_,w.inPeekEditor),handler(r){p(r,e=>{e.changeFocusBetweenPreviewAndReferences()})}}),u.registerCommandAndKeybindingRule({id:"goToNextReference",weight:m.EditorContrib-10,primary:s.F4,secondary:[s.F12],when:c.or(_,w.inPeekEditor),handler(r){p(r,e=>{e.goToNextOrPreviousReference(!0)})}}),u.registerCommandAndKeybindingRule({id:"goToPreviousReference",weight:m.EditorContrib-10,primary:l.Shift|s.F4,secondary:[l.Shift|s.F12],when:c.or(_,w.inPeekEditor),handler(r){p(r,e=>{e.goToNextOrPreviousReference(!1)})}}),v.registerCommandAlias("goToNextReferenceFromEmbeddedEditor","goToNextReference"),v.registerCommandAlias("goToPreviousReferenceFromEmbeddedEditor","goToPreviousReference"),v.registerCommandAlias("closeReferenceSearchEditor","closeReferenceSearch"),v.registerCommand("closeReferenceSearch",r=>p(r,e=>e.closeWidget())),u.registerKeybindingRule({id:"closeReferenceSearch",weight:m.EditorContrib-101,primary:s.Escape,secondary:[l.Shift|s.Escape],when:c.and(w.inPeekEditor,c.not("config.editor.stablePeek"))}),u.registerKeybindingRule({id:"closeReferenceSearch",weight:m.WorkbenchContrib+50,primary:s.Escape,secondary:[l.Shift|s.Escape],when:c.and(_,c.not("config.editor.stablePeek"),c.or(X.editorTextFocus,q.negate()))}),u.registerCommandAndKeybindingRule({id:"revealReference",weight:m.WorkbenchContrib,primary:s.Enter,mac:{primary:s.Enter,secondary:[l.CtrlCmd|s.DownArrow]},when:c.and(_,F,k.negate(),x.negate()),handler(r){const i=r.get(C).lastFocusedList?.getFocus();Array.isArray(i)&&i[0]instanceof R&&p(r,t=>t.revealReference(i[0]))}}),u.registerCommandAndKeybindingRule({id:"openReferenceToSide",weight:m.EditorContrib,primary:l.CtrlCmd|s.Enter,mac:{primary:l.WinCtrl|s.Enter},when:c.and(_,F,k.negate(),x.negate()),handler(r){const i=r.get(C).lastFocusedList?.getFocus();Array.isArray(i)&&i[0]instanceof R&&p(r,t=>t.openReference(i[0],!0,!0))}}),v.registerCommand("openReference",r=>{const i=r.get(C).lastFocusedList?.getFocus();Array.isArray(i)&&i[0]instanceof R&&p(r,t=>t.openReference(i[0],!1,!0))});export{h as ReferencesController,_ as ctxReferenceSearchVisible};
