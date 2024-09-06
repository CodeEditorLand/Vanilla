var C=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var g=(d,o,e,i)=>{for(var t=i>1?void 0:i?S(o,e):o,n=d.length-1,s;n>=0;n--)(s=d[n])&&(t=(i?s(o,e,t):s(t))||t);return i&&t&&C(o,e,t),t},p=(d,o)=>(e,i)=>o(e,i,d);import{getWindow as y}from"../../../../../vs/base/browser/dom.js";import{Orientation as l,Sizing as P,SplitView as D}from"../../../../../vs/base/browser/ui/splitview/splitview.js";import{asArray as L}from"../../../../../vs/base/common/arrays.js";import{Emitter as I,Event as f}from"../../../../../vs/base/common/event.js";import{Disposable as b,DisposableStore as E,dispose as V,toDisposable as z}from"../../../../../vs/base/common/lifecycle.js";import{IInstantiationService as O}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{TerminalLocation as w}from"../../../../../vs/platform/terminal/common/terminal.js";import{IViewDescriptorService as A,ViewContainerLocation as _}from"../../../../../vs/workbench/common/views.js";import{Direction as h,ITerminalConfigurationService as x,ITerminalInstanceService as R}from"../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{TerminalStatus as B}from"../../../../../vs/workbench/contrib/terminal/browser/terminalStatusList.js";import{TERMINAL_VIEW_ID as T}from"../../../../../vs/workbench/contrib/terminal/common/terminal.js";import{isHorizontal as u,IWorkbenchLayoutService as H,Position as c}from"../../../../../vs/workbench/services/layout/browser/layoutService.js";import{getPartByLocation as M}from"../../../../../vs/workbench/services/views/browser/viewsService.js";var N=(e=>(e[e.SplitPaneMinSize=80]="SplitPaneMinSize",e[e.ResizePartCellCount=4]="ResizePartCellCount",e))(N||{});class F extends b{constructor(e,i){super();this._container=e;this.orientation=i;this._width=this._container.offsetWidth,this._height=this._container.offsetHeight,this._createSplitView(),this._splitView.layout(this.orientation===l.HORIZONTAL?this._width:this._height)}_height;_width;_splitView;_splitViewDisposables=this._register(new E);_children=[];_terminalToPane=new Map;_onDidChange=f.None;get onDidChange(){return this._onDidChange}_createSplitView(){this._splitView=new D(this._container,{orientation:this.orientation}),this._splitViewDisposables.clear(),this._splitViewDisposables.add(this._splitView.onDidSashReset(()=>this._splitView.distributeViewSizes()))}split(e,i){this._addChild(e,i)}resizePane(e,i,t){if(this._children.length<=1)return;const n=[];for(let r=0;r<this._splitView.length;r++)n.push(this._splitView.getViewSize(r));const s=e!==this._children.length-1,a=s?e+1:e-1;(s&&i===h.Left||!s&&i===h.Right||s&&i===h.Up||!s&&i===h.Down)&&(t*=-1),n[e]+t<80?t=80-n[e]:n[a]-t<80&&(t=n[a]-80),n[e]+=t,n[a]-=t;for(let r=0;r<this._splitView.length-1;r++)this._splitView.resizeView(r,n[r])}resizePanes(e){if(this._children.length<=1)return;e[e.length-1]+=1-e.reduce((t,n)=>t+n,0);let i=0;for(let t=0;t<this._splitView.length;t++)i+=this._splitView.getViewSize(t);for(let t=0;t<this._splitView.length;t++)this._splitView.resizeView(t,i*e[t])}getPaneSize(e){const i=this._terminalToPane.get(e);if(!i)return 0;const t=this._children.indexOf(i);return this._splitView.getViewSize(t)}_addChild(e,i){const t=new Z(e,this.orientation===l.HORIZONTAL?this._height:this._width);t.orientation=this.orientation,typeof i=="number"?this._children.splice(i,0,t):this._children.push(t),this._terminalToPane.set(e,this._children[this._children.indexOf(t)]),this._withDisabledLayout(()=>this._splitView.addView(t,P.Distribute,i)),this.layout(this._width,this._height),this._onDidChange=f.any(...this._children.map(n=>n.onDidChange))}remove(e){let i=null;for(let t=0;t<this._children.length;t++)this._children[t].instance===e&&(i=t);i!==null&&(this._children.splice(i,1),this._terminalToPane.delete(e),this._splitView.removeView(i,P.Distribute),e.detachFromElement())}layout(e,i){this._width=e,this._height=i,this.orientation===l.HORIZONTAL?(this._children.forEach(t=>t.orthogonalLayout(i)),this._splitView.layout(e)):(this._children.forEach(t=>t.orthogonalLayout(e)),this._splitView.layout(i))}setOrientation(e){if(this.orientation!==e){for(this.orientation=e;this._container.children.length>0;)this._container.children[0].remove();this._splitViewDisposables.clear(),this._splitView.dispose(),this._createSplitView(),this._withDisabledLayout(()=>{this._children.forEach(i=>{i.orientation=e,this._splitView.addView(i,1)})})}}_withDisabledLayout(e){this._children.forEach(i=>i.instance.disableLayout=!0),e(),this._children.forEach(i=>i.instance.disableLayout=!1)}}class Z{constructor(o,e){this.instance=o;this.orthogonalSize=e;this.element=document.createElement("div"),this.element.className="terminal-split-pane",this.instance.attachToElement(this.element)}minimumSize=80;maximumSize=Number.MAX_VALUE;orientation;_onDidChange=f.None;get onDidChange(){return this._onDidChange}element;layout(o){!o||!this.orthogonalSize||(this.orientation===l.VERTICAL?this.instance.layout({width:this.orthogonalSize,height:o}):this.instance.layout({width:o,height:this.orthogonalSize}))}orthogonalLayout(o){this.orthogonalSize=o}}let v=class extends b{constructor(e,i,t,n,s,a,r){super();this._container=e;this._terminalConfigurationService=t;this._terminalInstanceService=n;this._layoutService=s;this._viewDescriptorService=a;this._instantiationService=r;i&&this.addInstance(i),this._container&&this.attachToElement(this._container),this._onPanelOrientationChanged.fire(this._terminalLocation===_.Panel&&u(this._panelPosition)?l.HORIZONTAL:l.VERTICAL),this._register(z(()=>{this._container&&this._groupElement&&(this._groupElement.remove(),this._groupElement=void 0)}))}_terminalInstances=[];_splitPaneContainer;_groupElement;_panelPosition=c.BOTTOM;_terminalLocation=_.Panel;_instanceDisposables=new Map;_activeInstanceIndex=-1;get terminalInstances(){return this._terminalInstances}_initialRelativeSizes;_visible=!1;_onDidDisposeInstance=this._register(new I);onDidDisposeInstance=this._onDidDisposeInstance.event;_onDidFocusInstance=this._register(new I);onDidFocusInstance=this._onDidFocusInstance.event;_onDidChangeInstanceCapability=this._register(new I);onDidChangeInstanceCapability=this._onDidChangeInstanceCapability.event;_onDisposed=this._register(new I);onDisposed=this._onDisposed.event;_onInstancesChanged=this._register(new I);onInstancesChanged=this._onInstancesChanged.event;_onDidChangeActiveInstance=this._register(new I);onDidChangeActiveInstance=this._onDidChangeActiveInstance.event;_onPanelOrientationChanged=this._register(new I);onPanelOrientationChanged=this._onPanelOrientationChanged.event;addInstance(e,i){let t;const n=i?this._terminalInstances.findIndex(s=>s.instanceId===i):this._activeInstanceIndex;"instanceId"in e?t=e:t=this._terminalInstanceService.createInstance(e,w.Panel),this._terminalInstances.length===0?(this._terminalInstances.push(t),this._activeInstanceIndex=0):this._terminalInstances.splice(n+1,0,t),this._initInstanceListeners(t),this._splitPaneContainer&&this._splitPaneContainer.split(t,n+1),this._onInstancesChanged.fire()}dispose(){this._terminalInstances=[],this._onInstancesChanged.fire(),super.dispose()}get activeInstance(){if(this._terminalInstances.length!==0)return this._terminalInstances[this._activeInstanceIndex]}getLayoutInfo(e){const i=this.terminalInstances.filter(n=>typeof n.persistentProcessId=="number"&&n.shouldPersist),t=i.map(n=>this._splitPaneContainer?.getPaneSize(n)||0).reduce((n,s)=>n+=s,0);return{isActive:e,activePersistentProcessId:this.activeInstance?this.activeInstance.persistentProcessId:void 0,terminals:i.map(n=>({relativeSize:t>0?this._splitPaneContainer.getPaneSize(n)/t:0,terminal:n.persistentProcessId||0}))}}_initInstanceListeners(e){this._instanceDisposables.set(e.instanceId,[e.onDisposed(i=>{this._onDidDisposeInstance.fire(i),this._handleOnDidDisposeInstance(i)}),e.onDidFocus(i=>{this._setActiveInstance(i),this._onDidFocusInstance.fire(i)}),e.capabilities.onDidAddCapabilityType(()=>this._onDidChangeInstanceCapability.fire(e)),e.capabilities.onDidRemoveCapabilityType(()=>this._onDidChangeInstanceCapability.fire(e))])}_handleOnDidDisposeInstance(e){this._removeInstance(e)}removeInstance(e){this._removeInstance(e)}_removeInstance(e){const i=this._terminalInstances.indexOf(e);if(i===-1)return;const t=e===this.activeInstance;if(this._terminalInstances.splice(i,1),t&&this._terminalInstances.length>0){const s=i<this._terminalInstances.length?i:this._terminalInstances.length-1;this.setActiveInstanceByIndex(s),this.activeInstance?.focus(!0)}else i<this._activeInstanceIndex&&this._activeInstanceIndex--;this._splitPaneContainer?.remove(e),this._terminalInstances.length===0?(this._onDisposed.fire(this),this.dispose()):this._onInstancesChanged.fire();const n=this._instanceDisposables.get(e.instanceId);n&&(V(n),this._instanceDisposables.delete(e.instanceId))}moveInstance(e,i,t){if(e=L(e),e.some(a=>!this.terminalInstances.includes(a)))return;const s=t==="before"?i:i+1;this._terminalInstances.splice(s,0,...e);for(const a of e){const r=t==="after"?this._terminalInstances.indexOf(a):this._terminalInstances.lastIndexOf(a);this._terminalInstances.splice(r,1)}if(this._splitPaneContainer)for(let a=0;a<e.length;a++){const r=e[a];this._splitPaneContainer.remove(r),this._splitPaneContainer.split(r,i+(t==="before"?a:0))}this._onInstancesChanged.fire()}_setActiveInstance(e){this.setActiveInstanceByIndex(this._getIndexFromId(e.instanceId))}_getIndexFromId(e){let i=-1;if(this.terminalInstances.forEach((t,n)=>{t.instanceId===e&&(i=n)}),i===-1)throw new Error(`Terminal with ID ${e} does not exist (has it already been disposed?)`);return i}setActiveInstanceByIndex(e,i){if(e<0||e>=this._terminalInstances.length)return;const t=this.activeInstance;this._activeInstanceIndex=e,(t!==this.activeInstance||i)&&(this._onInstancesChanged.fire(),this._onDidChangeActiveInstance.fire(this.activeInstance))}attachToElement(e){if(this._container=e,this._groupElement||(this._groupElement=document.createElement("div"),this._groupElement.classList.add("terminal-group")),this._container.appendChild(this._groupElement),!this._splitPaneContainer){this._panelPosition=this._layoutService.getPanelPosition(),this._terminalLocation=this._viewDescriptorService.getViewLocationById(T);const i=this._terminalLocation===_.Panel&&u(this._panelPosition)?l.HORIZONTAL:l.VERTICAL;this._splitPaneContainer=this._instantiationService.createInstance(F,this._groupElement,i),this.terminalInstances.forEach(t=>this._splitPaneContainer.split(t,this._activeInstanceIndex+1))}}get title(){if(this._terminalInstances.length===0)return"";let e=this.terminalInstances[0].title+this._getBellTitle(this.terminalInstances[0]);this.terminalInstances[0].description&&(e+=` (${this.terminalInstances[0].description})`);for(let i=1;i<this.terminalInstances.length;i++){const t=this.terminalInstances[i];t.title&&(e+=`, ${t.title+this._getBellTitle(t)}`,t.description&&(e+=` (${t.description})`))}return e}_getBellTitle(e){return this._terminalConfigurationService.config.enableBell&&e.statusList.statuses.some(i=>i.id===B.Bell)?"*":""}setVisible(e){this._visible=e,this._groupElement&&(this._groupElement.style.display=e?"":"none"),this.terminalInstances.forEach(i=>i.setVisible(e))}split(e){const i=this._terminalInstanceService.createInstance(e,w.Panel);return this.addInstance(i,e.parentTerminalId),this._setActiveInstance(i),i}addDisposable(e){this._register(e)}layout(e,i){if(this._splitPaneContainer){const t=this._layoutService.getPanelPosition(),n=this._viewDescriptorService.getViewLocationById(T);if(t!==this._panelPosition||n!==this._terminalLocation){const a=n===_.Panel&&u(t)?l.HORIZONTAL:l.VERTICAL;this._splitPaneContainer.setOrientation(a),this._panelPosition=t,this._terminalLocation=n,this._onPanelOrientationChanged.fire(this._splitPaneContainer.orientation)}this._splitPaneContainer.layout(e,i),this._initialRelativeSizes&&this._visible&&(this.resizePanes(this._initialRelativeSizes),this._initialRelativeSizes=void 0)}}focusPreviousPane(){const e=this._activeInstanceIndex===0?this._terminalInstances.length-1:this._activeInstanceIndex-1;this.setActiveInstanceByIndex(e)}focusNextPane(){const e=this._activeInstanceIndex===this._terminalInstances.length-1?0:this._activeInstanceIndex+1;this.setActiveInstanceByIndex(e)}_getPosition(){switch(this._terminalLocation){case _.Panel:return this._panelPosition;case _.Sidebar:return this._layoutService.getSideBarPosition();case _.AuxiliaryBar:return this._layoutService.getSideBarPosition()===c.LEFT?c.RIGHT:c.LEFT}}_getOrientation(){return u(this._getPosition())?l.HORIZONTAL:l.VERTICAL}resizePane(e){if(!this._splitPaneContainer)return;const i=e===h.Left||e===h.Right,t=this._getOrientation(),n=i&&t===l.VERTICAL||!i&&t===l.HORIZONTAL,s=this._terminalConfigurationService.getFont(y(this._groupElement)),a=i?s.charWidth:s.charHeight;if(a){let r=a*4;if(n){const m=this._getPosition();(m===c.LEFT&&e===h.Left||m===c.RIGHT&&e===h.Right||m===c.BOTTOM&&e===h.Down||m===c.TOP&&e===h.Up)&&(r*=-1),this._layoutService.resizePart(M(this._terminalLocation),r,r)}else this._splitPaneContainer.resizePane(this._activeInstanceIndex,e,r)}}resizePanes(e){if(!this._splitPaneContainer){this._initialRelativeSizes=e;return}this._splitPaneContainer.resizePanes(e)}};v=g([p(2,x),p(3,R),p(4,H),p(5,A),p(6,O)],v);export{v as TerminalGroup};