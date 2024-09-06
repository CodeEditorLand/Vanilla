var x=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var h=(l,n,e,t)=>{for(var i=t>1?void 0:t?M(n,e):n,o=l.length-1,a;o>=0;o--)(a=l[o])&&(i=(t?a(n,e,i):a(i))||i);return t&&i&&x(n,e,i),i},s=(l,n)=>(e,t)=>n(e,t,l);import{h as b}from"../../../../../vs/base/browser/dom.js";import{KeybindingLabel as O,unthemedKeybindingLabelOptions as B}from"../../../../../vs/base/browser/ui/keybindingLabel/keybindingLabel.js";import{Separator as E}from"../../../../../vs/base/common/actions.js";import{equals as I}from"../../../../../vs/base/common/arrays.js";import{Disposable as S,toDisposable as D}from"../../../../../vs/base/common/lifecycle.js";import{autorun as g,autorunWithStore as K,derived as L,observableFromEvent as V}from"../../../../../vs/base/common/observable.js";import{OS as W}from"../../../../../vs/base/common/platform.js";import"vs/css!./inlineEditHintsWidget";import{ContentWidgetPositionPreference as A}from"../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as k}from"../../../../../vs/editor/common/config/editorOptions.js";import{Position as N}from"../../../../../vs/editor/common/core/position.js";import{PositionAffinity as G}from"../../../../../vs/editor/common/model.js";import"../../../../../vs/editor/contrib/inlineEdit/browser/ghostTextWidget.js";import{createAndFillInActionBarActions as F,MenuEntryActionViewItem as j}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{WorkbenchToolBar as q}from"../../../../../vs/platform/actions/browser/toolbar.js";import{IMenuService as T,MenuId as w,MenuItemAction as C}from"../../../../../vs/platform/actions/common/actions.js";import{ICommandService as R}from"../../../../../vs/platform/commands/common/commands.js";import{IContextKeyService as P}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as X}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IInstantiationService as _}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as $}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{ITelemetryService as J}from"../../../../../vs/platform/telemetry/common/telemetry.js";let u=class extends S{constructor(e,t,i){super();this.editor=e;this.model=t;this.instantiationService=i;this._register(K((o,a)=>{if(!this.model.read(o)||!this.alwaysShowToolbar.read(o))return;const r=a.add(this.instantiationService.createInstance(d,this.editor,!0,this.position));e.addContentWidget(r),a.add(D(()=>e.removeContentWidget(r)))}))}alwaysShowToolbar=V(this,this.editor.onDidChangeConfiguration,()=>this.editor.getOption(k.inlineEdit).showToolbar==="always");sessionPosition=void 0;position=L(this,e=>{const t=this.model.read(e)?.model.ghostText.read(e);if(!this.alwaysShowToolbar.read(e)||!t||t.parts.length===0)return this.sessionPosition=void 0,null;const i=t.parts[0].column;this.sessionPosition&&this.sessionPosition.lineNumber!==t.lineNumber&&(this.sessionPosition=void 0);const o=new N(t.lineNumber,Math.min(i,this.sessionPosition?.column??Number.MAX_SAFE_INTEGER));return this.sessionPosition=o,o})};u=h([s(2,_)],u);let d=class extends S{constructor(e,t,i,o,a,m){super();this.editor=e;this.withBorder=t;this._position=i;this._contextKeyService=a;this._menuService=m;this.toolBar=this._register(o.createInstance(c,this.nodes.toolBar,this.editor,w.InlineEditToolbar,{menuOptions:{renderShortTitle:!0},toolbarOptions:{primaryGroup:r=>r.startsWith("primary")},actionViewItemProvider:(r,p)=>{if(r instanceof C)return o.createInstance(Q,r,void 0)},telemetrySource:"InlineEditToolbar"})),this._register(this.toolBar.onDidChangeDropdownVisibility(r=>{d._dropDownVisible=r})),this._register(g(r=>{this._position.read(r),this.editor.layoutContentWidget(this)})),this._register(g(r=>{const p=[];for(const[y,v]of this.inlineCompletionsActionsMenus.getActions())for(const f of v)f instanceof C&&p.push(f);p.length>0&&p.unshift(new E),this.toolBar.setAdditionalSecondaryActions(p)}))}static _dropDownVisible=!1;static get dropDownVisible(){return this._dropDownVisible}static id=0;id=`InlineEditHintsContentWidget${d.id++}`;allowEditorOverflow=!0;suppressMouseDown=!1;nodes=b("div.inlineEditHints",{className:this.withBorder?".withBorder":""},[b("div@toolBar")]);toolBar;inlineCompletionsActionsMenus=this._register(this._menuService.createMenu(w.InlineEditActions,this._contextKeyService));getId(){return this.id}getDomNode(){return this.nodes.root}getPosition(){return{position:this._position.get(),preference:[A.ABOVE,A.BELOW],positionAffinity:G.LeftOfInjectedText}}};d=h([s(3,_),s(4,P),s(5,T)],d);class Q extends j{updateLabel(){const n=this._keybindingService.lookupKeybinding(this._action.id,this._contextKeyService);if(!n)return super.updateLabel();if(this.label){const e=b("div.keybinding").root;this._register(new O(e,W,{disableTitle:!0,...B})).set(n),this.label.textContent=this._action.label,this.label.appendChild(e),this.label.classList.add("inlineEditStatusBarItemLabel")}}updateTooltip(){}}let c=class extends q{constructor(e,t,i,o,a,m,r,p,y,v){super(e,{resetMenu:i,...o},a,m,r,p,y,v);this.editor=t;this.menuId=i;this.options2=o;this.menuService=a;this.contextKeyService=m;this._store.add(this.menu.onDidChange(()=>this.updateToolbar())),this._store.add(this.editor.onDidChangeCursorPosition(()=>this.updateToolbar())),this.updateToolbar()}menu=this._store.add(this.menuService.createMenu(this.menuId,this.contextKeyService,{emitEventsForSubmenuChanges:!0}));additionalActions=[];prependedPrimaryActions=[];updateToolbar(){const e=[],t=[];F(this.menu,this.options2?.menuOptions,{primary:e,secondary:t},this.options2?.toolbarOptions?.primaryGroup,this.options2?.toolbarOptions?.shouldInlineSubmenu,this.options2?.toolbarOptions?.useSeparatorsInPrimaryActions),t.push(...this.additionalActions),e.unshift(...this.prependedPrimaryActions),this.setActions(e,t)}setPrependedPrimaryActions(e){I(this.prependedPrimaryActions,e,(t,i)=>t===i)||(this.prependedPrimaryActions=e,this.updateToolbar())}setAdditionalSecondaryActions(e){I(this.additionalActions,e,(t,i)=>t===i)||(this.additionalActions=e,this.updateToolbar())}};c=h([s(4,T),s(5,P),s(6,X),s(7,$),s(8,R),s(9,J)],c);export{c as CustomizedMenuWorkbenchToolBar,d as InlineEditHintsContentWidget,u as InlineEditHintsWidget};