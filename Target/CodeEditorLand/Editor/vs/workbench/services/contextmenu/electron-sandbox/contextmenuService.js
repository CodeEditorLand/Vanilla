var D=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var v=(d,a,t,e)=>{for(var i=e>1?void 0:e?E(a,t):a,s=d.length-1,n;s>=0;s--)(n=d[s])&&(i=(e?n(a,t,i):n(i))||i);return e&&i&&D(a,t,i),i},m=(d,a)=>(t,e)=>a(t,e,d);import{ActionRunner as k,Separator as H,SubmenuAction as K}from"../../../../base/common/actions.js";import*as l from"../../../../base/browser/dom.js";import{IContextMenuService as T,IContextViewService as L}from"../../../../platform/contextview/browser/contextView.js";import{ITelemetryService as I}from"../../../../platform/telemetry/common/telemetry.js";import{IKeybindingService as M}from"../../../../platform/keybinding/common/keybinding.js";import{getZoomFactor as _}from"../../../../base/browser/browser.js";import{unmnemonicLabel as C}from"../../../../base/common/labels.js";import{INotificationService as g}from"../../../../platform/notification/common/notification.js";import"../../../../base/browser/contextmenu.js";import{createSingleCallFunction as F}from"../../../../base/common/functional.js";import"../../../../base/parts/contextmenu/common/contextmenu.js";import{popup as R}from"../../../../base/parts/contextmenu/electron-sandbox/contextmenu.js";import{hasNativeTitlebar as W}from"../../../../platform/window/common/window.js";import{isMacintosh as x,isWindows as N}from"../../../../base/common/platform.js";import{IConfigurationService as B}from"../../../../platform/configuration/common/configuration.js";import{ContextMenuMenuDelegate as P,ContextMenuService as Z}from"../../../../platform/contextview/browser/contextMenuService.js";import{InstantiationType as $,registerSingleton as O}from"../../../../platform/instantiation/common/extensions.js";import{stripIcons as S}from"../../../../base/common/iconLabels.js";import{coalesce as V}from"../../../../base/common/arrays.js";import{Emitter as b}from"../../../../base/common/event.js";import{AnchorAlignment as A,AnchorAxisAlignment as z,isAnchor as j}from"../../../../base/browser/ui/contextview/contextview.js";import{IMenuService as w}from"../../../../platform/actions/common/actions.js";import{IContextKeyService as y}from"../../../../platform/contextkey/common/contextkey.js";import{Disposable as q}from"../../../../base/common/lifecycle.js";let f=class{impl;get onDidShowContextMenu(){return this.impl.onDidShowContextMenu}get onDidHideContextMenu(){return this.impl.onDidHideContextMenu}constructor(a,t,e,i,s,n,o){!x&&!W(i)?this.impl=new Z(t,a,s,e,n,o):this.impl=new p(a,t,e,n,o)}dispose(){this.impl.dispose()}showContextMenu(a){this.impl.showContextMenu(a)}};f=v([m(0,g),m(1,I),m(2,M),m(3,B),m(4,L),m(5,w),m(6,y)],f);let p=class extends q{constructor(t,e,i,s,n){super();this.notificationService=t;this.telemetryService=e;this.keybindingService=i;this.menuService=s;this.contextKeyService=n}_onDidShowContextMenu=this._store.add(new b);onDidShowContextMenu=this._onDidShowContextMenu.event;_onDidHideContextMenu=this._store.add(new b);onDidHideContextMenu=this._onDidHideContextMenu.event;showContextMenu(t){t=P.transform(t,this.menuService,this.contextKeyService);const e=t.getActions();if(e.length){const i=F(()=>{t.onHide?.(!1),l.ModifierKeyEmitter.getInstance().resetKeyStatus(),this._onDidHideContextMenu.fire()}),s=this.createMenu(t,e,i),n=t.getAnchor();let o,r,u=_(l.isHTMLElement(n)?l.getWindow(n):l.getActiveWindow());if(l.isHTMLElement(n)){const c=l.getDomNodePagePosition(n);u*=l.getDomNodeZoomLevel(n),t.anchorAxisAlignment===z.HORIZONTAL?(t.anchorAlignment===A.LEFT?(o=c.left,r=c.top):(o=c.left+c.width,r=c.top),x||l.getWindow(n).screen.height-r<e.length*(N?45:32)&&(r+=c.height)):t.anchorAlignment===A.LEFT?(o=c.left,r=c.top+c.height):(o=c.left+c.width,r=c.top+c.height),x&&(r+=4/u)}else j(n)&&(o=n.x,r=n.y);typeof o=="number"&&(o=Math.floor(o*u)),typeof r=="number"&&(r=Math.floor(r*u)),R(s,{x:o,y:r,positioningItem:t.autoSelectFirstItem?0:void 0},()=>i()),this._onDidShowContextMenu.fire()}}createMenu(t,e,i,s=new Set){const n=t.actionRunner||new k;return V(e.map(o=>this.createMenuItem(t,o,n,i,s)))}createMenuItem(t,e,i,s,n){if(e instanceof H)return{type:"separator"};if(e instanceof K)return n.has(e.id)?void 0:{label:C(S(e.label)).trim(),submenu:this.createMenu(t,e.actions,s,new Set([...n,e.id]))};{let o;e.checked&&(typeof t.getCheckedActionsRepresentation=="function"?o=t.getCheckedActionsRepresentation(e):o="checkbox");const r={label:C(S(e.label)).trim(),checked:!!e.checked,type:o,enabled:!!e.enabled,click:c=>{s(),this.runAction(i,e,t,c)}},u=t.getKeyBinding?t.getKeyBinding(e):this.keybindingService.lookupKeybinding(e.id);if(u){const c=u.getElectronAccelerator();if(c)r.accelerator=c;else{const h=u.getLabel();h&&(r.label=`${r.label} [${h}]`)}}return r}}async runAction(t,e,i,s){i.skipTelemetry||this.telemetryService.publicLog2("workbenchActionExecuted",{id:e.id,from:"contextMenu"});const n=i.getActionsContext?i.getActionsContext(s):void 0,o=t.run(e,n);try{await o}catch(r){this.notificationService.error(r)}}};p=v([m(0,g),m(1,I),m(2,M),m(3,w),m(4,y)],p),O(T,f,$.Delayed);export{f as ContextMenuService};
