import*as w from"../../../../../vs/base/browser/dom.js";import{Action as g,Separator as x}from"../../../../../vs/base/common/actions.js";import{CancellationToken as C}from"../../../../../vs/base/common/cancellation.js";import{generateUuid as A}from"../../../../../vs/base/common/uuid.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as v}from"../../../../../vs/editor/common/config/editorOptions.js";import{Range as u}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/languages.js";import{ITextModelService as S}from"../../../../../vs/editor/common/services/resolverService.js";import{DefinitionAction as k,SymbolNavigationAction as E,SymbolNavigationAnchor as I}from"../../../../../vs/editor/contrib/gotoSymbol/browser/goToCommands.js";import"../../../../../vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture.js";import"../../../../../vs/editor/contrib/inlayHints/browser/inlayHintsController.js";import{PeekContext as P}from"../../../../../vs/editor/contrib/peekView/browser/peekView.js";import{isIMenuItem as b,MenuId as L,MenuItemAction as N,MenuRegistry as R}from"../../../../../vs/platform/actions/common/actions.js";import{ICommandService as T}from"../../../../../vs/platform/commands/common/commands.js";import{IContextKeyService as D}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as O}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IInstantiationService as H}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{INotificationService as F,Severity as j}from"../../../../../vs/platform/notification/common/notification.js";async function de(o,n,r,t){const l=o.get(S),c=o.get(O),a=o.get(T),m=o.get(H),f=o.get(F);if(await t.item.resolve(C.None),!t.part.location)return;const s=t.part.location,i=[],p=new Set(R.getMenuItems(L.EditorContext).map(e=>b(e)?e.command.id:A()));for(const e of E.all())p.has(e.desc.id)&&i.push(new g(e.desc.id,N.label(e.desc,{renderShortTitle:!0}),void 0,!0,async()=>{const d=await l.createModelReference(s.uri);try{const M=new I(d.object.textEditorModel,u.getStartPosition(s.range)),h=t.item.anchor.range;await m.invokeFunction(e.runEditorCommand.bind(e),n,M,h)}finally{d.dispose()}}));if(t.part.command){const{command:e}=t.part;i.push(new x),i.push(new g(e.id,e.title,void 0,!0,async()=>{try{await a.executeCommand(e.id,...e.arguments??[])}catch(d){f.notify({severity:j.Error,source:t.item.provider.displayName,message:d})}}))}const y=n.getOption(v.useShadowDOM);c.showContextMenu({domForShadowRoot:y?n.getDomNode()??void 0:void 0,getAnchor:()=>{const e=w.getDomNodePagePosition(r);return{x:e.left,y:e.top+e.height+8}},getActions:()=>i,onHide:()=>{n.focus()},autoSelectFirstItem:!0})}async function fe(o,n,r,t){const c=await o.get(S).createModelReference(t.uri);await r.invokeWithinContext(async a=>{const m=n.hasSideBySideModifier,f=a.get(D),s=P.inPeekEditor.getValue(f),i=!m&&r.getOption(v.definitionLinkOpensInPeek)&&!s;return new k({openToSide:m,openInPeek:i,muteMessage:!0},{title:{value:"",original:""},id:"",precondition:void 0}).run(a,new I(c.object.textEditorModel,u.getStartPosition(t.range)),u.lift(t.range))}),c.dispose()}export{fe as goToDefinitionWithLocation,de as showGoToContextMenu};
