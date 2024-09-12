var k=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var A=(m,e,o,i)=>{for(var t=i>1?void 0:i?H(e,o):e,c=m.length-1,d;c>=0;c--)(d=m[c])&&(t=(i?d(e,o,t):d(t))||t);return i&&t&&k(e,o,t),t},a=(m,e)=>(o,i)=>e(o,i,m);import*as l from"../../../../base/browser/dom.js";import{StandardMouseEvent as U}from"../../../../base/browser/mouseEvent.js";import{getDefaultHoverDelegate as _}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{IconLabel as K}from"../../../../base/browser/ui/iconLabel/iconLabel.js";import"../../../../base/common/actions.js";import{Disposable as z}from"../../../../base/common/lifecycle.js";import"../../../../base/common/uri.js";import{ICodeEditorService as x}from"../../../../editor/browser/services/codeEditorService.js";import"../../../../editor/common/core/range.js";import{EditorContextKeys as p}from"../../../../editor/common/editorContextKeys.js";import{SymbolKinds as B}from"../../../../editor/common/languages.js";import{ILanguageService as F}from"../../../../editor/common/languages/language.js";import{getIconClasses as O}from"../../../../editor/common/services/getIconClasses.js";import{ILanguageFeaturesService as X}from"../../../../editor/common/services/languageFeatures.js";import{IModelService as j}from"../../../../editor/common/services/model.js";import{DefinitionAction as q}from"../../../../editor/contrib/gotoSymbol/browser/goToCommands.js";import*as v from"../../../../nls.js";import{createAndFillInContextMenuActions as J}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import{Action2 as R,IMenuService as Q,MenuId as I,registerAction2 as M}from"../../../../platform/actions/common/actions.js";import{ICommandService as V}from"../../../../platform/commands/common/commands.js";import{IContextKeyService as Y}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as Z}from"../../../../platform/contextview/browser/contextView.js";import{IHoverService as W}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as ee}from"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as oe}from"../../../../platform/label/common/label.js";import{fillEditorsDragData as re}from"../../../browser/dnd.js";import"../common/annotations.js";let b=class extends z{constructor(e,o,i,t,c,d,y,w,N,u,E){super();const f=this._register(N.createScoped(e));e.classList.add("chat-inline-anchor-widget","show-file-icons"),e.replaceChildren();const D=this._register(new K(e,{supportHighlights:!1,supportIcons:!0}));let r,h,C;if(o.kind==="symbol"){r=o.symbol.location,h=I.ChatInlineSymbolAnchorContext,C=r;const n=B.toIcon(o.symbol.kind);D.setLabel(`$(${n.id}) ${o.symbol.name}`,void 0,{});const s=y.getModel(r.uri);if(s){const S=p.hasDefinitionProvider.bindTo(f),g=p.hasReferenceProvider.bindTo(f),L=()=>{s.isDisposed()||(S.set(u.definitionProvider.has(s)),g.set(u.definitionProvider.has(s)))};L(),this._register(u.definitionProvider.onDidChange(L)),this._register(u.referenceProvider.onDidChange(L))}}else{r=o,h=I.ChatInlineResourceAnchorContext,C=r.uri;const n=c.getUriBasenameLabel(r.uri),s=r.range&&o.kind!=="symbol"?`${n}#${r.range.startLineNumber}-${r.range.endLineNumber}`:n;D.setLabel(s,void 0,{extraClasses:O(y,d,r.uri)})}const G=r.range?`${r.range.startLineNumber}-${r.range.endLineNumber}`:"";e.setAttribute("data-href",r.uri.with({fragment:G}).toString()),this._register(l.addDisposableListener(e,l.EventType.CONTEXT_MENU,n=>{const s=new U(l.getWindow(n),n);l.EventHelper.stop(n,!0),w.showContextMenu({contextKeyService:f,getAnchor:()=>s,getActions:()=>{const S=E.getMenuActions(h,f,{arg:C}),g=[];return J(S,g),g}})}));const $=c.getUriLabel(r.uri,{relative:!0});this._register(i.setupManagedHover(_("element"),e,$)),e.draggable=!0,this._register(l.addDisposableListener(e,"dragstart",n=>{t.invokeFunction(s=>re(s,[r.uri],n)),n.dataTransfer?.setDragImage(e,0,0)}))}};b=A([a(2,W),a(3,ee),a(4,oe),a(5,F),a(6,j),a(7,Z),a(8,Y),a(9,X),a(10,Q)],b),M(class T extends R{static id="chat.inlineSymbolAnchor.goToDefinition";constructor(){super({id:T.id,title:{...v.localize2("actions.goToDecl.label","Go to Definition"),mnemonicTitle:v.localize({key:"miGotoDefinition",comment:["&& denotes a mnemonic"]},"Go to &&Definition")},precondition:p.hasDefinitionProvider,menu:[{id:I.ChatInlineSymbolAnchorContext,group:"navigation",order:1.1}]})}async run(e,o){return await e.get(x).openCodeEditor({resource:o.uri,options:{selection:{startColumn:o.range.startColumn,startLineNumber:o.range.startLineNumber}}},null),new q({openToSide:!1,openInPeek:!1,muteMessage:!0},{title:{value:"",original:""},id:"",precondition:void 0}).run(e)}}),M(class P extends R{static id="chat.inlineSymbolAnchor.goToReferences";constructor(){super({id:P.id,title:{...v.localize2("goToReferences.label","Go to References"),mnemonicTitle:v.localize({key:"miGotoReference",comment:["&& denotes a mnemonic"]},"Go to &&References")},precondition:p.hasReferenceProvider,menu:[{id:I.ChatInlineSymbolAnchorContext,group:"navigation",order:1.1}]})}async run(e,o){const i=e.get(x),t=e.get(V);await i.openCodeEditor({resource:o.uri,options:{selection:{startColumn:o.range.startColumn,startLineNumber:o.range.startLineNumber}}},null),await t.executeCommand("editor.action.goToReferences")}});export{b as InlineAnchorWidget};