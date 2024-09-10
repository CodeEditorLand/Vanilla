var T=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var b=(g,e,t,n)=>{for(var r=n>1?void 0:n?k(e,t):e,c=g.length-1,i;c>=0;c--)(i=g[c])&&(r=(n?i(e,t,r):i(r))||r);return n&&r&&T(e,t,r),r},l=(g,e)=>(t,n)=>e(t,n,g);import*as I from"../../../../base/browser/dom.js";import{ActionViewItem as S}from"../../../../base/browser/ui/actionbar/actionViewItems.js";import{Separator as x,SubmenuAction as M}from"../../../../base/common/actions.js";import{KeyCode as w,KeyMod as O}from"../../../../base/common/keyCodes.js";import{DisposableStore as D}from"../../../../base/common/lifecycle.js";import{isIOS as C}from"../../../../base/common/platform.js";import{MouseTargetType as h}from"../../../browser/editorBrowser.js";import{EditorAction as V,EditorContributionInstantiation as K,registerEditorAction as z,registerEditorContribution as P}from"../../../browser/editorExtensions.js";import{EditorOption as p}from"../../../common/config/editorOptions.js";import{ScrollType as R}from"../../../common/editorCommon.js";import{EditorContextKeys as N}from"../../../common/editorContextKeys.js";import*as d from"../../../../nls.js";import{IMenuService as B,SubmenuItemAction as F}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as W}from"../../../../platform/contextkey/common/contextkey.js";import{IContextMenuService as L,IContextViewService as H}from"../../../../platform/contextview/browser/contextView.js";import{IKeybindingService as X}from"../../../../platform/keybinding/common/keybinding.js";import{KeybindingWeight as Y}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{IConfigurationService as $}from"../../../../platform/configuration/common/configuration.js";import{IWorkspaceContextService as j,isStandaloneEditorWorkspace as G}from"../../../../platform/workspace/common/workspace.js";let u=class{constructor(e,t,n,r,c,i,s,a){this._contextMenuService=t;this._contextViewService=n;this._contextKeyService=r;this._keybindingService=c;this._menuService=i;this._configurationService=s;this._workspaceContextService=a;this._editor=e,this._toDispose.add(this._editor.onContextMenu(o=>this._onContextMenu(o))),this._toDispose.add(this._editor.onMouseWheel(o=>{if(this._contextMenuIsBeingShownCount>0){const m=this._contextViewService.getContextViewElement(),v=o.srcElement;v.shadowRoot&&I.getShadowRoot(m)===v.shadowRoot||this._contextViewService.hideContextView()}})),this._toDispose.add(this._editor.onKeyDown(o=>{this._editor.getOption(p.contextmenu)&&o.keyCode===w.ContextMenu&&(o.preventDefault(),o.stopPropagation(),this.showContextMenu())}))}static ID="editor.contrib.contextmenu";static get(e){return e.getContribution(u.ID)}_toDispose=new D;_contextMenuIsBeingShownCount=0;_editor;_onContextMenu(e){if(!this._editor.hasModel())return;if(!this._editor.getOption(p.contextmenu)){this._editor.focus(),e.target.position&&!this._editor.getSelection().containsPosition(e.target.position)&&this._editor.setPosition(e.target.position);return}if(e.target.type===h.OVERLAY_WIDGET||e.target.type===h.CONTENT_TEXT&&e.target.detail.injectedText)return;if(e.event.preventDefault(),e.event.stopPropagation(),e.target.type===h.SCROLLBAR)return this._showScrollbarContextMenu(e.event);if(e.target.type!==h.CONTENT_TEXT&&e.target.type!==h.CONTENT_EMPTY&&e.target.type!==h.TEXTAREA)return;if(this._editor.focus(),e.target.position){let n=!1;for(const r of this._editor.getSelections())if(r.containsPosition(e.target.position)){n=!0;break}n||this._editor.setPosition(e.target.position)}let t=null;e.target.type!==h.TEXTAREA&&(t=e.event),this.showContextMenu(t)}showContextMenu(e){if(!this._editor.getOption(p.contextmenu)||!this._editor.hasModel())return;const t=this._getMenuActions(this._editor.getModel(),this._editor.contextMenuId);t.length>0&&this._doShowContextMenu(t,e)}_getMenuActions(e,t){const n=[],r=this._menuService.getMenuActions(t,this._contextKeyService,{arg:e.uri});for(const c of r){const[,i]=c;let s=0;for(const a of i)if(a instanceof F){const o=this._getMenuActions(e,a.item.submenu);o.length>0&&(n.push(new M(a.id,a.label,o)),s++)}else n.push(a),s++;s&&n.push(new x)}return n.length&&n.pop(),n}_doShowContextMenu(e,t=null){if(!this._editor.hasModel())return;const n=this._editor.getOption(p.hover);this._editor.updateOptions({hover:{enabled:!1}});let r=t;if(!r){this._editor.revealPosition(this._editor.getPosition(),R.Immediate),this._editor.render();const i=this._editor.getScrolledVisiblePosition(this._editor.getPosition()),s=I.getDomNodePagePosition(this._editor.getDomNode()),a=s.left+i.left,o=s.top+i.top+i.height;r={x:a,y:o}}const c=this._editor.getOption(p.useShadowDOM)&&!C;this._contextMenuIsBeingShownCount++,this._contextMenuService.showContextMenu({domForShadowRoot:c?this._editor.getOverflowWidgetsDomNode()??this._editor.getDomNode():void 0,getAnchor:()=>r,getActions:()=>e,getActionViewItem:i=>{const s=this._keybindingFor(i);if(s)return new S(i,i,{label:!0,keybinding:s.getLabel(),isMenu:!0});const a=i;return typeof a.getActionViewItem=="function"?a.getActionViewItem():new S(i,i,{icon:!0,label:!0,isMenu:!0})},getKeyBinding:i=>this._keybindingFor(i),onHide:i=>{this._contextMenuIsBeingShownCount--,this._editor.updateOptions({hover:n})}})}_showScrollbarContextMenu(e){if(!this._editor.hasModel()||G(this._workspaceContextService.getWorkspace()))return;const t=this._editor.getOption(p.minimap);let n=0;const r=o=>({id:`menu-action-${++n}`,label:o.label,tooltip:"",class:void 0,enabled:typeof o.enabled>"u"?!0:o.enabled,checked:o.checked,run:o.run}),c=(o,m)=>new M(`menu-action-${++n}`,o,m,void 0),i=(o,m,v,y,E)=>{if(!m)return r({label:o,enabled:m,run:()=>{}});const A=f=>()=>{this._configurationService.updateValue(v,f)},_=[];for(const f of E)_.push(r({label:f.label,checked:y===f.value,run:A(f.value)}));return c(o,_)},s=[];s.push(r({label:d.localize("context.minimap.minimap","Minimap"),checked:t.enabled,run:()=>{this._configurationService.updateValue("editor.minimap.enabled",!t.enabled)}})),s.push(new x),s.push(r({label:d.localize("context.minimap.renderCharacters","Render Characters"),enabled:t.enabled,checked:t.renderCharacters,run:()=>{this._configurationService.updateValue("editor.minimap.renderCharacters",!t.renderCharacters)}})),s.push(i(d.localize("context.minimap.size","Vertical size"),t.enabled,"editor.minimap.size",t.size,[{label:d.localize("context.minimap.size.proportional","Proportional"),value:"proportional"},{label:d.localize("context.minimap.size.fill","Fill"),value:"fill"},{label:d.localize("context.minimap.size.fit","Fit"),value:"fit"}])),s.push(i(d.localize("context.minimap.slider","Slider"),t.enabled,"editor.minimap.showSlider",t.showSlider,[{label:d.localize("context.minimap.slider.mouseover","Mouse Over"),value:"mouseover"},{label:d.localize("context.minimap.slider.always","Always"),value:"always"}]));const a=this._editor.getOption(p.useShadowDOM)&&!C;this._contextMenuIsBeingShownCount++,this._contextMenuService.showContextMenu({domForShadowRoot:a?this._editor.getDomNode():void 0,getAnchor:()=>e,getActions:()=>s,onHide:o=>{this._contextMenuIsBeingShownCount--,this._editor.focus()}})}_keybindingFor(e){return this._keybindingService.lookupKeybinding(e.id)}dispose(){this._contextMenuIsBeingShownCount>0&&this._contextViewService.hideContextView(),this._toDispose.dispose()}};u=b([l(1,L),l(2,H),l(3,W),l(4,X),l(5,B),l(6,$),l(7,j)],u);class q extends V{constructor(){super({id:"editor.action.showContextMenu",label:d.localize("action.showContextMenu.label","Show Editor Context Menu"),alias:"Show Editor Context Menu",precondition:void 0,kbOpts:{kbExpr:N.textInputFocus,primary:O.Shift|w.F10,weight:Y.EditorContrib}})}run(e,t){u.get(t)?.showContextMenu()}}P(u.ID,u,K.BeforeFirstInteraction),z(q);export{u as ContextMenuController};
