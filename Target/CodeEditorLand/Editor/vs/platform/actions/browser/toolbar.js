var D=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var b=(f,u,a,e)=>{for(var r=e>1?void 0:e?H(u,a):u,n=f.length-1,l;n>=0;n--)(l=f[n])&&(r=(e?l(u,a,r):l(r))||r);return e&&r&&D(u,a,r),r},c=(f,u)=>(a,e)=>u(a,e,f);import{addDisposableListener as L,getWindow as R}from"../../../base/browser/dom.js";import{StandardMouseEvent as G}from"../../../base/browser/mouseEvent.js";import{ToggleMenuAction as P,ToolBar as W}from"../../../base/browser/ui/toolbar/toolbar.js";import{Separator as A,toAction as x}from"../../../base/common/actions.js";import{coalesceInPlace as C}from"../../../base/common/arrays.js";import{intersection as z}from"../../../base/common/collections.js";import{BugIndicatingError as j}from"../../../base/common/errors.js";import{Emitter as F}from"../../../base/common/event.js";import{Iterable as N}from"../../../base/common/iterator.js";import{DisposableStore as q}from"../../../base/common/lifecycle.js";import{localize as O}from"../../../nls.js";import{ICommandService as E}from"../../commands/common/commands.js";import{IContextKeyService as T}from"../../contextkey/common/contextkey.js";import{IContextMenuService as w}from"../../contextview/browser/contextView.js";import{IKeybindingService as k}from"../../keybinding/common/keybinding.js";import{ITelemetryService as K}from"../../telemetry/common/telemetry.js";import{IMenuService as B,MenuItemAction as M,SubmenuItemAction as _}from"../common/actions.js";import{createConfigureKeybindingAction as J}from"../common/menuService.js";import{createAndFillInActionBarActions as Q}from"./menuEntryActionViewItem.js";var U=(e=>(e[e.NoHide=-1]="NoHide",e[e.Ignore=0]="Ignore",e[e.RenderInSecondaryGroup=1]="RenderInSecondaryGroup",e))(U||{});let I=class extends W{constructor(a,e,r,n,l,d,g,m){super(a,l,{getKeyBinding:o=>d.lookupKeybinding(o.id)??void 0,...e,allowContextMenu:!0,skipTelemetry:typeof e?.telemetrySource=="string"});this._options=e;this._menuService=r;this._contextKeyService=n;this._contextMenuService=l;this._keybindingService=d;this._commandService=g;const p=e?.telemetrySource;p&&this._store.add(this.actionBar.onDidRun(o=>m.publicLog2("workbenchActionExecuted",{id:o.action.id,from:p})))}_sessionDisposables=this._store.add(new q);setActions(a,e=[],r){this._sessionDisposables.clear();const n=a.slice(),l=e.slice(),d=[];let g=0;const m=[];let p=!1;if(this._options?.hiddenItemStrategy!==-1)for(let o=0;o<n.length;o++){const i=n[o];!(i instanceof M)&&!(i instanceof _)||i.hideActions&&(d.push(i.hideActions.toggle),i.hideActions.toggle.checked&&g++,i.hideActions.isHidden&&(p=!0,n[o]=void 0,this._options?.hiddenItemStrategy!==0&&(m[o]=i)))}if(this._options?.overflowBehavior!==void 0){const o=z(new Set(this._options.overflowBehavior.exempted),N.map(n,s=>s?.id)),i=this._options.overflowBehavior.maxItems-o.size;let t=0;for(let s=0;s<n.length;s++){const h=n[s];h&&(t++,!o.has(h.id)&&t>=i&&(n[s]=void 0,m[s]=h))}}C(n),C(m),super.setActions(n,A.join(m,l)),(d.length>0||n.length>0)&&this._sessionDisposables.add(L(this.getElement(),"contextmenu",o=>{const i=new G(R(this.getElement()),o),t=this.getItemAction(i.target);if(!t)return;i.preventDefault(),i.stopPropagation();const s=[];if(t instanceof M&&t.menuKeybinding)s.push(t.menuKeybinding);else if(!(t instanceof _||t instanceof P)){const v=!!this._keybindingService.lookupKeybinding(t.id);s.push(J(this._commandService,this._keybindingService,t.id,void 0,v))}if(d.length>0){let v=!1;if(g===1&&this._options?.hiddenItemStrategy===0){v=!0;for(let y=0;y<d.length;y++)if(d[y].checked){d[y]=x({id:t.id,label:t.label,checked:!0,enabled:!1,run(){}});break}}if(!v&&(t instanceof M||t instanceof _)){if(!t.hideActions)return;s.push(t.hideActions.hide)}else s.push(x({id:"label",label:O("hide","Hide"),enabled:!1,run(){}}))}const h=A.join(s,d);this._options?.resetMenu&&!r&&(r=[this._options.resetMenu]),p&&r&&(h.push(new A),h.push(x({id:"resetThisMenu",label:O("resetThisMenu","Reset Menu"),run:()=>this._menuService.resetHiddenStates(r)}))),h.length!==0&&this._contextMenuService.showContextMenu({getAnchor:()=>i,getActions:()=>h,menuId:this._options?.contextMenu,menuActionOptions:{renderShortTitle:!0,...this._options?.menuOptions},skipTelemetry:typeof this._options?.telemetrySource=="string",contextKeyService:this._contextKeyService})}))}};I=b([c(2,B),c(3,T),c(4,w),c(5,k),c(6,E),c(7,K)],I);let S=class extends I{_onDidChangeMenuItems=this._store.add(new F);onDidChangeMenuItems=this._onDidChangeMenuItems.event;constructor(u,a,e,r,n,l,d,g,m){super(u,{resetMenu:a,...e},r,n,l,d,g,m);const p=this._store.add(r.createMenu(a,n,{emitEventsForSubmenuChanges:!0})),o=()=>{const i=[],t=[];Q(p,e?.menuOptions,{primary:i,secondary:t},e?.toolbarOptions?.primaryGroup,e?.toolbarOptions?.shouldInlineSubmenu,e?.toolbarOptions?.useSeparatorsInPrimaryActions),u.classList.toggle("has-no-actions",i.length===0&&t.length===0),super.setActions(i,t)};this._store.add(p.onDidChange(()=>{o(),this._onDidChangeMenuItems.fire(this)})),o()}setActions(){throw new j("This toolbar is populated from a menu.")}};S=b([c(3,B),c(4,T),c(5,w),c(6,k),c(7,E),c(8,K)],S);export{U as HiddenItemStrategy,S as MenuWorkbenchToolBar,I as WorkbenchToolBar};
