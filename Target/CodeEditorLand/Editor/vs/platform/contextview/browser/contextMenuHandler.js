import{$ as v,addDisposableListener as a,EventType as h,getActiveElement as m,getWindow as b,isAncestor as f,isHTMLElement as x}from"../../../base/browser/dom.js";import{StandardMouseEvent as w}from"../../../base/browser/mouseEvent.js";import{Menu as k}from"../../../base/browser/ui/menu/menu.js";import{ActionRunner as C}from"../../../base/common/actions.js";import{isCancellationError as S}from"../../../base/common/errors.js";import{combinedDisposable as M,DisposableStore as E}from"../../../base/common/lifecycle.js";import{defaultMenuStyles as A}from"../../theme/browser/defaultStyles.js";class G{constructor(e,r,o,c){this.contextViewService=e;this.telemetryService=r;this.notificationService=o;this.keybindingService=c}focusToReturn=null;lastContainer=null;block=null;blockDisposable=null;options={blockMouse:!0};configure(e){this.options=e}showContextMenu(e){const r=e.getActions();if(!r.length)return;this.focusToReturn=m();let o;const c=x(e.domForShadowRoot)?e.domForShadowRoot:void 0;this.contextViewService.showContextView({getAnchor:()=>e.getAnchor(),canRelayout:!1,anchorAlignment:e.anchorAlignment,anchorAxisAlignment:e.anchorAxisAlignment,render:t=>{this.lastContainer=t;const p=e.getMenuClassName?e.getMenuClassName():"";p&&(t.className+=" "+p),this.options.blockMouse&&(this.block=t.appendChild(v(".context-view-block")),this.block.style.position="fixed",this.block.style.cursor="initial",this.block.style.left="0",this.block.style.top="0",this.block.style.width="100%",this.block.style.height="100%",this.block.style.zIndex="-1",this.blockDisposable?.dispose(),this.blockDisposable=a(this.block,h.MOUSE_DOWN,i=>i.stopPropagation()));const n=new E,l=e.actionRunner||new C;l.onWillRun(i=>this.onActionRun(i,!e.skipTelemetry),this,n),l.onDidRun(this.onDidActionRun,this,n),o=new k(t,r,{actionViewItemProvider:e.getActionViewItem,context:e.getActionsContext?e.getActionsContext():null,actionRunner:l,getKeyBinding:e.getKeyBinding?e.getKeyBinding:i=>this.keybindingService.lookupKeybinding(i.id)},A),o.onDidCancel(()=>this.contextViewService.hideContextView(!0),null,n),o.onDidBlur(()=>this.contextViewService.hideContextView(!0),null,n);const u=b(t);return n.add(a(u,h.BLUR,()=>this.contextViewService.hideContextView(!0))),n.add(a(u,h.MOUSE_DOWN,i=>{if(i.defaultPrevented)return;const d=new w(u,i);let s=d.target;if(!d.rightButton){for(;s;){if(s===t)return;s=s.parentElement}this.contextViewService.hideContextView(!0)}})),M(n,o)},focus:()=>{o?.focus(!!e.autoSelectFirstItem)},onHide:t=>{e.onHide?.(!!t),this.block&&(this.block.remove(),this.block=null),this.blockDisposable?.dispose(),this.blockDisposable=null,this.lastContainer&&(m()===this.lastContainer||f(m(),this.lastContainer))&&this.focusToReturn?.focus(),this.lastContainer=null}},c,!!c)}onActionRun(e,r){r&&this.telemetryService.publicLog2("workbenchActionExecuted",{id:e.action.id,from:"contextMenu"}),this.contextViewService.hideContextView(!1)}onDidActionRun(e){e.error&&!S(e.error)&&this.notificationService.error(e.error)}}export{G as ContextMenuHandler};
