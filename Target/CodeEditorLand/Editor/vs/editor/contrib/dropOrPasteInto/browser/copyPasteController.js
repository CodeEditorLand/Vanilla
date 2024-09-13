var Q=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var R=(D,y,e,t)=>{for(var i=t>1?void 0:t?U(y,e):y,r=D.length-1,a;r>=0;r--)(a=D[r])&&(i=(t?a(y,e,i):a(i))||i);return t&&i&&Q(y,e,i),i},v=(D,y)=>(e,t)=>y(e,t,D);import{addDisposableListener as T,getActiveDocument as j}from"../../../../base/browser/dom.js";import{coalesce as V}from"../../../../base/common/arrays.js";import{DeferredPromise as J,createCancelablePromise as x,raceCancellation as z}from"../../../../base/common/async.js";import{CancellationTokenSource as Y}from"../../../../base/common/cancellation.js";import{UriList as G,createStringDataTransferItem as X,matchesMimeType as Z}from"../../../../base/common/dataTransfer.js";import{CancellationError as $,isCancellationError as ee}from"../../../../base/common/errors.js";import{HierarchicalKind as b}from"../../../../base/common/hierarchicalKind.js";import{Disposable as te,DisposableStore as k}from"../../../../base/common/lifecycle.js";import{Mimes as M}from"../../../../base/common/mime.js";import*as ie from"../../../../base/common/platform.js";import{generateUuid as re}from"../../../../base/common/uuid.js";import{localize as C}from"../../../../nls.js";import{IClipboardService as ae}from"../../../../platform/clipboard/common/clipboardService.js";import{RawContextKey as oe}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as se}from"../../../../platform/instantiation/common/instantiation.js";import{IProgressService as ne,ProgressLocation as de}from"../../../../platform/progress/common/progress.js";import{IQuickInputService as le}from"../../../../platform/quickinput/common/quickInput.js";import{ClipboardEventUtils as ce}from"../../../browser/controller/editContext/textArea/textAreaEditContextInput.js";import{toExternalVSDataTransfer as pe,toVSDataTransfer as ue}from"../../../browser/dnd.js";import{IBulkEditService as me}from"../../../browser/services/bulkEditService.js";import{EditorOption as w}from"../../../common/config/editorOptions.js";import{Range as Pe}from"../../../common/core/range.js";import{Handler as fe}from"../../../common/editorCommon.js";import{DocumentPasteTriggerKind as N}from"../../../common/languages.js";import{ILanguageFeaturesService as he}from"../../../common/services/languageFeatures.js";import{CodeEditorStateFlag as I,EditorStateCancellationTokenSource as F}from"../../editorState/browser/editorState.js";import{InlineProgressManager as ge}from"../../inlineProgress/browser/inlineProgress.js";import{MessageController as q}from"../../message/browser/messageController.js";import{DefaultTextPasteOrDropEditProvider as H}from"./defaultProviders.js";import{createCombinedWorkspaceEdit as ye,sortEditsByYieldTo as ve}from"./edit.js";import{PostEditWidgetManager as Ce}from"./postEditWidget.js";const Ee="editor.changePasteType",Se=new oe("pasteWidgetVisible",!1,C("pasteWidgetVisible","Whether the paste widget is showing")),A="application/vnd.code.copyMetadata";let h=class extends te{constructor(e,t,i,r,a,n,o){super();this._bulkEditService=i;this._clipboardService=r;this._languageFeaturesService=a;this._quickInputService=n;this._progressService=o;this._editor=e;const s=e.getContainerDomNode();this._register(T(s,"copy",d=>this.handleCopy(d))),this._register(T(s,"cut",d=>this.handleCopy(d))),this._register(T(s,"paste",d=>this.handlePaste(d),!0)),this._pasteProgressManager=this._register(new ge("pasteIntoEditor",e,t)),this._postPasteWidgetManager=this._register(t.createInstance(Ce,"pasteIntoEditor",e,Se,{id:Ee,label:C("postPasteWidgetTitle","Show paste options...")}))}static ID="editor.contrib.copyPasteActionController";static get(e){return e.getContribution(h.ID)}static _currentCopyOperation;_editor;_currentPasteOperation;_pasteAsActionContext;_pasteProgressManager;_postPasteWidgetManager;changePasteType(){this._postPasteWidgetManager.tryShowSelector()}pasteAs(e){this._editor.focus();try{this._pasteAsActionContext={preferred:e},j().execCommand("paste")}finally{this._pasteAsActionContext=void 0}}clearWidgets(){this._postPasteWidgetManager.clear()}isPasteAsEnabled(){return this._editor.getOption(w.pasteAs).enabled}async finishedPaste(){await this._currentPasteOperation}handleCopy(e){if(!this._editor.hasTextFocus()||(this._clipboardService.clearInternalState?.(),!e.clipboardData||!this.isPasteAsEnabled()))return;const t=this._editor.getModel(),i=this._editor.getSelections();if(!t||!i?.length)return;const r=this._editor.getOption(w.emptySelectionClipboard);let a=i;const n=i.length===1&&i[0].isEmpty();if(n){if(!r)return;a=[new Pe(a[0].startLineNumber,1,a[0].startLineNumber,1+t.getLineLength(a[0].startLineNumber))]}const o=this._editor._getViewModel()?.getPlainTextToCopy(i,r,ie.isWindows),d={multicursorText:Array.isArray(o)?o:null,pasteOnNewLine:n,mode:null},l=this._languageFeaturesService.documentPasteEditProvider.ordered(t).filter(m=>!!m.prepareDocumentPaste);if(!l.length){this.setCopyMetadata(e.clipboardData,{defaultPastePayload:d});return}const u=ue(e.clipboardData),P=l.flatMap(m=>m.copyMimeTypes??[]),g=re();this.setCopyMetadata(e.clipboardData,{id:g,providerCopyMimeTypes:P,defaultPastePayload:d});const c=x(async m=>{const E=V(await Promise.all(l.map(async p=>{try{return await p.prepareDocumentPaste(t,a,u,m)}catch{return}})));E.reverse();for(const p of E)for(const[f,S]of p)u.replace(f,S);return u});h._currentCopyOperation?.dataTransferPromise.cancel(),h._currentCopyOperation={handle:g,dataTransferPromise:c}}async handlePaste(e){if(!e.clipboardData||!this._editor.hasTextFocus())return;q.get(this._editor)?.closeMessage(),this._currentPasteOperation?.cancel(),this._currentPasteOperation=void 0;const t=this._editor.getModel(),i=this._editor.getSelections();if(!i?.length||!t||this._editor.getOption(w.readOnly)||!this.isPasteAsEnabled()&&!this._pasteAsActionContext)return;const r=this.fetchCopyMetadata(e),a=pe(e.clipboardData);a.delete(A);const n=[...e.clipboardData.types,...r?.providerCopyMimeTypes??[],M.uriList],o=this._languageFeaturesService.documentPasteEditProvider.ordered(t).filter(s=>{const d=this._pasteAsActionContext?.preferred;return d&&s.providedPasteEditKinds&&!this.providerMatchesPreference(s,d)?!1:s.pasteMimeTypes?.some(l=>Z(l,n))});if(!o.length){this._pasteAsActionContext?.preferred&&this.showPasteAsNoEditMessage(i,this._pasteAsActionContext.preferred);return}e.preventDefault(),e.stopImmediatePropagation(),this._pasteAsActionContext?this.showPasteAsPick(this._pasteAsActionContext.preferred,o,i,a,r):this.doPasteInline(o,i,a,r,e)}showPasteAsNoEditMessage(e,t){q.get(this._editor)?.showMessage(C("pasteAsError","No paste edits for '{0}' found",t instanceof b?t.value:t.providerId),e[0].getStartPosition())}doPasteInline(e,t,i,r,a){const n=this._editor;if(!n.hasModel())return;const o=new F(n,I.Value|I.Selection,void 0),s=x(async d=>{const l=this._editor;if(!l.hasModel())return;const u=l.getModel(),P=new k,g=P.add(new Y(d));P.add(o.token.onCancellationRequested(()=>g.cancel()));const c=g.token;try{if(await this.mergeInDataFromCopy(i,r,c),c.isCancellationRequested)return;const m=e.filter(f=>this.isSupportedPasteProvider(f,i));if(!m.length||m.length===1&&m[0]instanceof H)return this.applyDefaultPasteHandler(i,r,c,a);const E={triggerKind:N.Automatic},p=await this.getPasteEdits(m,i,u,t,E,c);if(P.add(p),c.isCancellationRequested)return;if(p.edits.length===1&&p.edits[0].provider instanceof H)return this.applyDefaultPasteHandler(i,r,c,a);if(p.edits.length){const f=l.getOption(w.pasteAs).showPasteSelector==="afterPaste";return this._postPasteWidgetManager.applyEditAndShowIfNeeded(t,{activeEditIndex:0,allEdits:p.edits},f,(S,K)=>new Promise((B,O)=>{(async()=>{try{const _=S.provider.resolveDocumentPasteEdit?.(S,K),W=new J,L=_&&await this._pasteProgressManager.showWhile(t[0].getEndPosition(),C("resolveProcess","Resolving paste edit. Click to cancel"),Promise.race([W.p,_]),{cancel:()=>(W.cancel(),O(new $))},0);return L&&(S.additionalEdit=L.additionalEdit),B(S)}catch(_){return O(_)}})()}),c)}await this.applyDefaultPasteHandler(i,r,c,a)}finally{P.dispose(),this._currentPasteOperation===s&&(this._currentPasteOperation=void 0)}});this._pasteProgressManager.showWhile(t[0].getEndPosition(),C("pasteIntoEditorProgress","Running paste handlers. Click to cancel and do basic paste"),s,{cancel:async()=>{try{if(s.cancel(),o.token.isCancellationRequested)return;await this.applyDefaultPasteHandler(i,r,o.token,a)}finally{o.dispose()}}}).then(()=>{o.dispose()}),this._currentPasteOperation=s}showPasteAsPick(e,t,i,r,a){const n=x(async o=>{const s=this._editor;if(!s.hasModel())return;const d=s.getModel(),l=new k,u=l.add(new F(s,I.Value|I.Selection,void 0,o));try{if(await this.mergeInDataFromCopy(r,a,u.token),u.token.isCancellationRequested)return;let P=t.filter(p=>this.isSupportedPasteProvider(p,r,e));e&&(P=P.filter(p=>this.providerMatchesPreference(p,e)));const g={triggerKind:N.PasteAs,only:e&&e instanceof b?e:void 0};let c=l.add(await this.getPasteEdits(P,r,d,i,g,u.token));if(u.token.isCancellationRequested)return;if(e&&(c={edits:c.edits.filter(p=>e instanceof b?e.contains(p.kind):e.providerId===p.provider.id),dispose:c.dispose}),!c.edits.length){g.only&&this.showPasteAsNoEditMessage(i,g.only);return}let m;if(e?m=c.edits.at(0):m=(await this._quickInputService.pick(c.edits.map(f=>({label:f.title,description:f.kind?.value,edit:f})),{placeHolder:C("pasteAsPickerPlaceholder","Select Paste Action")}))?.edit,!m)return;const E=ye(d.uri,i,m);await this._bulkEditService.apply(E,{editor:this._editor})}finally{l.dispose(),this._currentPasteOperation===n&&(this._currentPasteOperation=void 0)}});this._progressService.withProgress({location:de.Window,title:C("pasteAsProgress","Running paste handlers")},()=>n)}setCopyMetadata(e,t){e.setData(A,JSON.stringify(t))}fetchCopyMetadata(e){if(!e.clipboardData)return;const t=e.clipboardData.getData(A);if(t)try{return JSON.parse(t)}catch{return}const[i,r]=ce.getTextData(e.clipboardData);if(r)return{defaultPastePayload:{mode:r.mode,multicursorText:r.multicursorText??null,pasteOnNewLine:!!r.isFromEmptySelection}}}async mergeInDataFromCopy(e,t,i){if(t?.id&&h._currentCopyOperation?.handle===t.id){const r=await h._currentCopyOperation.dataTransferPromise;if(i.isCancellationRequested)return;for(const[a,n]of r)e.replace(a,n)}if(!e.has(M.uriList)){const r=await this._clipboardService.readResources();if(i.isCancellationRequested)return;r.length&&e.append(M.uriList,X(G.create(r)))}}async getPasteEdits(e,t,i,r,a,n){const o=new k,s=await z(Promise.all(e.map(async l=>{try{const u=await l.provideDocumentPasteEdits?.(i,r,t,a,n);return u&&o.add(u),u?.edits?.map(P=>({...P,provider:l}))}catch(u){ee(u);return}})),n),d=V(s??[]).flat().filter(l=>!a.only||a.only.contains(l.kind));return{edits:ve(d),dispose:()=>o.dispose()}}async applyDefaultPasteHandler(e,t,i,r){const n=await(e.get(M.text)??e.get("text"))?.asString()??"";if(i.isCancellationRequested)return;const o={clipboardEvent:r,text:n,pasteOnNewLine:t?.defaultPastePayload.pasteOnNewLine??!1,multicursorText:t?.defaultPastePayload.multicursorText??null,mode:null};this._editor.trigger("keyboard",fe.Paste,o)}isSupportedPasteProvider(e,t,i){return e.pasteMimeTypes?.some(r=>t.matches(r))?!i||this.providerMatchesPreference(e,i):!1}providerMatchesPreference(e,t){return t instanceof b?e.providedPasteEditKinds?e.providedPasteEditKinds.some(i=>t.contains(i)):!0:e.id===t.providerId}};h=R([v(1,se),v(2,me),v(3,ae),v(4,he),v(5,le),v(6,ne)],h);export{h as CopyPasteController,Ee as changePasteTypeCommandId,Se as pasteWidgetVisibleCtx};
