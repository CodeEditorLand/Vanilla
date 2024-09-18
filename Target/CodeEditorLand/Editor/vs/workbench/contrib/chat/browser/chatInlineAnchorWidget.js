var W=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var E=(u,e,t,r)=>{for(var i=r>1?void 0:r?q(e,t):e,a=u.length-1,f;a>=0;a--)(f=u[a])&&(i=(r?f(e,t,i):f(i))||i);return r&&i&&W(e,t,i),i},s=(u,e)=>(t,r)=>e(t,r,u);import*as m from"../../../../base/browser/dom.js";import{StandardMouseEvent as O}from"../../../../base/browser/mouseEvent.js";import{getDefaultHoverDelegate as V}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import"../../../../base/common/actions.js";import{Disposable as B}from"../../../../base/common/lifecycle.js";import{basename as X}from"../../../../base/common/resources.js";import"../../../../base/common/uri.js";import{ICodeEditorService as P}from"../../../../editor/browser/services/codeEditorService.js";import"../../../../editor/common/core/range.js";import{EditorContextKeys as C}from"../../../../editor/common/editorContextKeys.js";import{SymbolKinds as j}from"../../../../editor/common/languages.js";import{ILanguageService as J}from"../../../../editor/common/languages/language.js";import{getIconClasses as w}from"../../../../editor/common/services/getIconClasses.js";import{ILanguageFeaturesService as Q}from"../../../../editor/common/services/languageFeatures.js";import{IModelService as Y}from"../../../../editor/common/services/model.js";import{DefinitionAction as Z}from"../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";import*as p from"../../../../nls.js";import{createAndFillInContextMenuActions as ee}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as R,IMenuService as te,MenuId as h,registerAction2 as A}from"../../../../platform/actions/common/actions.js";import{ICommandService as oe}from"../../../../platform/commands/common/commands.js";import{IContextKeyService as ie}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as re}from"../../../../platform/contextview/browser/contextView.js";import{FileKind as F,IFileService as ne}from"../../../../platform/files/common/files.js";import{IHoverService as se}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as ae}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as ce}from"../../../../platform/label/common/label.js";import{fillEditorsDragData as de}from"../../../browser/dnd.js";import{ResourceContextKey as me}from"../../../common/contextkeys.js";import{ExplorerFolderContext as K}from"../../files/common/files.js";import"../common/annotations.js";import"../common/chatModel.js";import{IChatWidgetService as le}from"./chat.js";let b=class extends B{constructor(e,t,r,i,a,f,k,T,v,y,$,I){super();const l=this._register(r.createScoped(e));e.classList.add("chat-inline-anchor-widget","show-file-icons");let S,x,o,D,L;if(t.kind==="symbol"){o=t.symbol.location,D=h.ChatInlineSymbolAnchorContext,L=o,S=t.symbol.name,x=["codicon",...w(I,y,void 0,void 0,j.toIcon(t.symbol.kind))];const n=I.getModel(o.uri);if(n){const c=C.hasDefinitionProvider.bindTo(l),g=C.hasReferenceProvider.bindTo(l),d=()=>{n.isDisposed()||(c.set(v.definitionProvider.has(n)),g.set(v.definitionProvider.has(n)))};d(),this._register(v.definitionProvider.onDidChange(d)),this._register(v.referenceProvider.onDidChange(d))}}else{o=t,D=h.ChatInlineResourceAnchorContext,L=o.uri,this._register(new me(l,a,y,I)).set(o.uri);const c=T.getUriBasenameLabel(o.uri);S=o.range&&t.kind!=="symbol"?`${c}#${o.range.startLineNumber}-${o.range.endLineNumber}`:c;const g=o.uri.path.endsWith("/")?F.FOLDER:F.FILE;x=w(I,y,o.uri,g);const d=K.bindTo(l);a.stat(o.uri).then(_=>{d.set(_.isDirectory)}).catch(()=>{})}const M=m.$("span.icon");M.classList.add(...x),e.replaceChildren(M,m.$("span.icon-label",{},S));const H=o.range?`${o.range.startLineNumber}-${o.range.endLineNumber}`:"";e.setAttribute("data-href",o.uri.with({fragment:H}).toString()),this._register(m.addDisposableListener(e,m.EventType.CONTEXT_MENU,n=>{const c=new O(m.getWindow(n),n);m.EventHelper.stop(n,!0),i.showContextMenu({contextKeyService:l,getAnchor:()=>c,getActions:()=>{const g=$.getMenuActions(D,l,{arg:L}),d=[];return ee(g,d),d}})}));const z=T.getUriLabel(o.uri,{relative:!0});this._register(f.setupManagedHover(V("element"),e,z)),e.draggable=!0,this._register(m.addDisposableListener(e,"dragstart",n=>{k.invokeFunction(c=>de(c,[o.uri],n)),n.dataTransfer?.setDragImage(e,0,0)}))}};b=E([s(2,ie),s(3,re),s(4,ne),s(5,se),s(6,ae),s(7,ce),s(8,Q),s(9,J),s(10,te),s(11,Y)],b),A(class N extends R{static id="chat.inlineResourceAnchor.attachToContext";constructor(){super({id:N.id,title:{...p.localize2("actions.attach.label","Attach File as Context")},menu:[{id:h.ChatInlineResourceAnchorContext,group:"chat",order:1,when:K.negate()}]})}async run(e,t){const i=e.get(le).lastFocusedWidget;if(!i)return;const a={value:t,id:t.toString(),name:X(t),isFile:!0,isDynamic:!0};i.setContext(!0,a)}}),A(class G extends R{static id="chat.inlineSymbolAnchor.goToDefinition";constructor(){super({id:G.id,title:{...p.localize2("actions.goToDecl.label","Go to Definition"),mnemonicTitle:p.localize({key:"miGotoDefinition",comment:["&& denotes a mnemonic"]},"Go to &&Definition")},precondition:C.hasDefinitionProvider,menu:[{id:h.ChatInlineSymbolAnchorContext,group:"navigation",order:1.1}]})}async run(e,t){return await e.get(P).openCodeEditor({resource:t.uri,options:{selection:{startColumn:t.range.startColumn,startLineNumber:t.range.startLineNumber}}},null),new Z({openToSide:!1,openInPeek:!1,muteMessage:!0},{title:{value:"",original:""},id:"",precondition:void 0}).run(e)}}),A(class U extends R{static id="chat.inlineSymbolAnchor.goToReferences";constructor(){super({id:U.id,title:{...p.localize2("goToReferences.label","Go to References"),mnemonicTitle:p.localize({key:"miGotoReference",comment:["&& denotes a mnemonic"]},"Go to &&References")},precondition:C.hasReferenceProvider,menu:[{id:h.ChatInlineSymbolAnchorContext,group:"navigation",order:1.1}]})}async run(e,t){const r=e.get(P),i=e.get(oe);await r.openCodeEditor({resource:t.uri,options:{selection:{startColumn:t.range.startColumn,startLineNumber:t.range.startLineNumber}}},null),await i.executeCommand("editor.action.goToReferences")}});export{b as InlineAnchorWidget};
