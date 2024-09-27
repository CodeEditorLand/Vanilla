var O=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var F=(u,e,o,r)=>{for(var i=r>1?void 0:r?W(e,o):e,a=u.length-1,f;a>=0;a--)(f=u[a])&&(i=(r?f(e,o,i):f(i))||i);return r&&i&&O(e,o,i),i},s=(u,e)=>(o,r)=>e(o,r,u);import*as c from"../../../../base/browser/dom.js";import{StandardMouseEvent as B}from"../../../../base/browser/mouseEvent.js";import{getDefaultHoverDelegate as V}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import"../../../../base/common/actions.js";import{Lazy as X}from"../../../../base/common/lazy.js";import{Disposable as J}from"../../../../base/common/lifecycle.js";import"../../../../base/common/uri.js";import{generateUuid as Q}from"../../../../base/common/uuid.js";import{ICodeEditorService as E}from"../../../../editor/browser/services/codeEditorService.js";import"../../../../editor/common/core/range.js";import{EditorContextKeys as C}from"../../../../editor/common/editorContextKeys.js";import{SymbolKinds as Y}from"../../../../editor/common/languages.js";import{ILanguageService as Z}from"../../../../editor/common/languages/language.js";import{getIconClasses as U}from"../../../../editor/common/services/getIconClasses.js";import{ILanguageFeaturesService as ee}from"../../../../editor/common/services/languageFeatures.js";import{IModelService as oe}from"../../../../editor/common/services/model.js";import{DefinitionAction as te}from"../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";import*as h from"../../../../nls.js";import{createAndFillInContextMenuActions as ie}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as D,IMenuService as re,MenuId as p,registerAction2 as R}from"../../../../platform/actions/common/actions.js";import{ICommandService as ne}from"../../../../platform/commands/common/commands.js";import{IContextKeyService as se}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as ae}from"../../../../platform/contextview/browser/contextView.js";import{FileKind as K,IFileService as ce}from"../../../../platform/files/common/files.js";import{IHoverService as de}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as me}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as le}from"../../../../platform/label/common/label.js";import{ITelemetryService as ue}from"../../../../platform/telemetry/common/telemetry.js";import{fillEditorsDragData as fe}from"../../../browser/dnd.js";import{ResourceContextKey as ge}from"../../../common/contextkeys.js";import{ExplorerFolderContext as N}from"../../files/common/files.js";import"../common/annotations.js";import{IChatVariablesService as he}from"../common/chatVariables.js";import{IChatWidgetService as pe}from"./chat.js";let b=class extends J{constructor(e,o,r,i,a,f,_,T,v,S,$,I,M){super();const l=this._register(r.createScoped(e)),w=new X(Q);e.classList.add("chat-inline-anchor-widget","show-file-icons");let y,L,t,x,A;if(o.kind==="symbol"){t=o.symbol.location,x=p.ChatInlineSymbolAnchorContext,A=t,y=o.symbol.name,L=["codicon",...U(I,S,void 0,void 0,Y.toIcon(o.symbol.kind))];const n=I.getModel(t.uri);if(n){const d=C.hasDefinitionProvider.bindTo(l),g=C.hasReferenceProvider.bindTo(l),m=()=>{n.isDisposed()||(d.set(v.definitionProvider.has(n)),g.set(v.definitionProvider.has(n)))};m(),this._register(v.definitionProvider.onDidChange(m)),this._register(v.referenceProvider.onDidChange(m))}this._register(c.addDisposableListener(e,"click",()=>{M.publicLog2("chat.inlineAnchor.openSymbol",{anchorId:w.value})}))}else{t=o,x=p.ChatInlineResourceAnchorContext,A=t.uri,this._register(new ge(l,a,S,I)).set(t.uri);const d=T.getUriBasenameLabel(t.uri);y=t.range&&o.kind!=="symbol"?`${d}#${t.range.startLineNumber}-${t.range.endLineNumber}`:d;const g=t.uri.path.endsWith("/")?K.FOLDER:K.FILE;L=U(I,S,t.uri,g);const m=N.bindTo(l);a.stat(t.uri).then(q=>{m.set(q.isDirectory)}).catch(()=>{}),this._register(c.addDisposableListener(e,"click",()=>{M.publicLog2("chat.inlineAnchor.openResource",{anchorId:w.value})}))}const P=c.$("span.icon");P.classList.add(...L),e.replaceChildren(P,c.$("span.icon-label",{},y));const H=t.range?`${t.range.startLineNumber}-${t.range.endLineNumber}`:"";e.setAttribute("data-href",t.uri.with({fragment:H}).toString()),this._register(c.addDisposableListener(e,c.EventType.CONTEXT_MENU,n=>{const d=new B(c.getWindow(n),n);c.EventHelper.stop(n,!0),i.showContextMenu({contextKeyService:l,getAnchor:()=>d,getActions:()=>{const g=$.getMenuActions(x,l,{arg:A}),m=[];return ie(g,m),m}})}));const j=T.getUriLabel(t.uri,{relative:!0});this._register(f.setupManagedHover(V("element"),e,j)),e.draggable=!0,this._register(c.addDisposableListener(e,"dragstart",n=>{_.invokeFunction(d=>fe(d,[t.uri],n)),n.dataTransfer?.setDragImage(e,0,0)}))}};b=F([s(2,se),s(3,ae),s(4,ce),s(5,de),s(6,me),s(7,le),s(8,ee),s(9,Z),s(10,re),s(11,oe),s(12,ue)],b),R(class k extends D{static id="chat.inlineResourceAnchor.addFileToChat";constructor(){super({id:k.id,title:{...h.localize2("actions.attach.label","Add File to Chat")},menu:[{id:p.ChatInlineResourceAnchorContext,group:"chat",order:1,when:N.negate()}]})}async run(e,o){const r=e.get(pe),i=e.get(he),a=r.lastFocusedWidget;a&&i.attachContext("file",o,a.location)}}),R(class z extends D{static id="chat.inlineSymbolAnchor.goToDefinition";constructor(){super({id:z.id,title:{...h.localize2("actions.goToDecl.label","Go to Definition"),mnemonicTitle:h.localize({key:"miGotoDefinition",comment:["&& denotes a mnemonic"]},"Go to &&Definition")},precondition:C.hasDefinitionProvider,menu:[{id:p.ChatInlineSymbolAnchorContext,group:"navigation",order:1.1}]})}async run(e,o){return await e.get(E).openCodeEditor({resource:o.uri,options:{selection:{startColumn:o.range.startColumn,startLineNumber:o.range.startLineNumber}}},null),new te({openToSide:!1,openInPeek:!1,muteMessage:!0},{title:{value:"",original:""},id:"",precondition:void 0}).run(e)}}),R(class G extends D{static id="chat.inlineSymbolAnchor.goToReferences";constructor(){super({id:G.id,title:{...h.localize2("goToReferences.label","Go to References"),mnemonicTitle:h.localize({key:"miGotoReference",comment:["&& denotes a mnemonic"]},"Go to &&References")},precondition:C.hasReferenceProvider,menu:[{id:p.ChatInlineSymbolAnchorContext,group:"navigation",order:1.1}]})}async run(e,o){const r=e.get(E),i=e.get(ne);await r.openCodeEditor({resource:o.uri,options:{selection:{startColumn:o.range.startColumn,startLineNumber:o.range.startLineNumber}}},null),await i.executeCommand("editor.action.goToReferences")}});export{b as InlineAnchorWidget};
