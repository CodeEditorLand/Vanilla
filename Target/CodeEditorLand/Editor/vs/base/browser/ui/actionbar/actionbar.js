import{ActionRunner as g,Separator as d}from"../../../common/actions.js";import{Emitter as f}from"../../../common/event.js";import{KeyCode as a,KeyMod as b}from"../../../common/keyCodes.js";import{Disposable as w,DisposableMap as y,DisposableStore as A,dispose as m}from"../../../common/lifecycle.js";import*as I from"../../../common/types.js";import*as l from"../../dom.js";import{StandardKeyboardEvent as p}from"../../keyboardEvent.js";import{createInstantHoverDelegate as D}from"../hover/hoverDelegateFactory.js";import{ActionViewItem as R,BaseActionViewItem as u}from"./actionViewItems.js";import"./actionbar.css";var _=(e=>(e[e.HORIZONTAL=0]="HORIZONTAL",e[e.VERTICAL=1]="VERTICAL",e))(_||{});class H extends w{options;_hoverDelegate;_actionRunner;_actionRunnerDisposables=this._register(new A);_context;_orientation;_triggerKeys;viewItems;viewItemDisposables=this._register(new y);previouslyFocusedItem;focusedItem;focusTracker;triggerKeyDown=!1;focusable=!0;domNode;actionsList;_onDidBlur=this._register(new f);onDidBlur=this._onDidBlur.event;_onDidCancel=this._register(new f({onWillAddFirstListener:()=>this.cancelHasListener=!0}));onDidCancel=this._onDidCancel.event;cancelHasListener=!1;_onDidRun=this._register(new f);onDidRun=this._onDidRun.event;_onWillRun=this._register(new f);onWillRun=this._onWillRun.event;constructor(t,e={}){super(),this.options=e,this._context=e.context??null,this._orientation=this.options.orientation??0,this._triggerKeys={keyDown:this.options.triggerKeys?.keyDown??!1,keys:this.options.triggerKeys?.keys??[a.Enter,a.Space]},this._hoverDelegate=e.hoverDelegate??this._register(D()),this.options.actionRunner?this._actionRunner=this.options.actionRunner:(this._actionRunner=new g,this._actionRunnerDisposables.add(this._actionRunner)),this._actionRunnerDisposables.add(this._actionRunner.onDidRun(r=>this._onDidRun.fire(r))),this._actionRunnerDisposables.add(this._actionRunner.onWillRun(r=>this._onWillRun.fire(r))),this.viewItems=[],this.focusedItem=void 0,this.domNode=document.createElement("div"),this.domNode.className="monaco-action-bar";let i,s;switch(this._orientation){case 0:i=[a.LeftArrow],s=[a.RightArrow];break;case 1:i=[a.UpArrow],s=[a.DownArrow],this.domNode.className+=" vertical";break}this._register(l.addDisposableListener(this.domNode,l.EventType.KEY_DOWN,r=>{const o=new p(r);let n=!0;const h=typeof this.focusedItem=="number"?this.viewItems[this.focusedItem]:void 0;i&&(o.equals(i[0])||o.equals(i[1]))?n=this.focusPrevious():s&&(o.equals(s[0])||o.equals(s[1]))?n=this.focusNext():o.equals(a.Escape)&&this.cancelHasListener?this._onDidCancel.fire():o.equals(a.Home)?n=this.focusFirst():o.equals(a.End)?n=this.focusLast():o.equals(a.Tab)&&h instanceof u&&h.trapsArrowNavigation?n=this.focusNext(void 0,!0):this.isTriggerKeyEvent(o)?this._triggerKeys.keyDown?this.doTrigger(o):this.triggerKeyDown=!0:n=!1,n&&(o.preventDefault(),o.stopPropagation())})),this._register(l.addDisposableListener(this.domNode,l.EventType.KEY_UP,r=>{const o=new p(r);this.isTriggerKeyEvent(o)?(!this._triggerKeys.keyDown&&this.triggerKeyDown&&(this.triggerKeyDown=!1,this.doTrigger(o)),o.preventDefault(),o.stopPropagation()):(o.equals(a.Tab)||o.equals(b.Shift|a.Tab)||o.equals(a.UpArrow)||o.equals(a.DownArrow)||o.equals(a.LeftArrow)||o.equals(a.RightArrow))&&this.updateFocusedItem()})),this.focusTracker=this._register(l.trackFocus(this.domNode)),this._register(this.focusTracker.onDidBlur(()=>{(l.getActiveElement()===this.domNode||!l.isAncestor(l.getActiveElement(),this.domNode))&&(this._onDidBlur.fire(),this.previouslyFocusedItem=this.focusedItem,this.focusedItem=void 0,this.triggerKeyDown=!1)})),this._register(this.focusTracker.onDidFocus(()=>this.updateFocusedItem())),this.actionsList=document.createElement("ul"),this.actionsList.className="actions-container",this.options.highlightToggledItems&&this.actionsList.classList.add("highlight-toggled"),this.actionsList.setAttribute("role",this.options.ariaRole||"toolbar"),this.options.ariaLabel&&this.actionsList.setAttribute("aria-label",this.options.ariaLabel),this.domNode.appendChild(this.actionsList),t.appendChild(this.domNode)}refreshRole(){this.length()>=1?this.actionsList.setAttribute("role",this.options.ariaRole||"toolbar"):this.actionsList.setAttribute("role","presentation")}setAriaLabel(t){t?this.actionsList.setAttribute("aria-label",t):this.actionsList.removeAttribute("aria-label")}setFocusable(t){if(this.focusable=t,this.focusable){const e=this.viewItems.find(i=>i instanceof u&&i.isEnabled());e instanceof u&&e.setFocusable(!0)}else this.viewItems.forEach(e=>{e instanceof u&&e.setFocusable(!1)})}isTriggerKeyEvent(t){let e=!1;return this._triggerKeys.keys.forEach(i=>{e=e||t.equals(i)}),e}updateFocusedItem(){for(let t=0;t<this.actionsList.children.length;t++){const e=this.actionsList.children[t];if(l.isAncestor(l.getActiveElement(),e)){this.focusedItem=t,this.viewItems[this.focusedItem]?.showHover?.();break}}}get context(){return this._context}set context(t){this._context=t,this.viewItems.forEach(e=>e.setActionContext(t))}get actionRunner(){return this._actionRunner}set actionRunner(t){this._actionRunner=t,this._actionRunnerDisposables.clear(),this._actionRunnerDisposables.add(this._actionRunner.onDidRun(e=>this._onDidRun.fire(e))),this._actionRunnerDisposables.add(this._actionRunner.onWillRun(e=>this._onWillRun.fire(e))),this.viewItems.forEach(e=>e.actionRunner=t)}getContainer(){return this.domNode}hasAction(t){return this.viewItems.findIndex(e=>e.action.id===t.id)!==-1}getAction(t){if(typeof t=="number")return this.viewItems[t]?.action;if(l.isHTMLElement(t)){for(;t.parentElement!==this.actionsList;){if(!t.parentElement)return;t=t.parentElement}for(let e=0;e<this.actionsList.childNodes.length;e++)if(this.actionsList.childNodes[e]===t)return this.viewItems[e].action}}push(t,e={}){const i=Array.isArray(t)?t:[t];let s=I.isNumber(e.index)?e.index:null;i.forEach(r=>{const o=document.createElement("li");o.className="action-item",o.setAttribute("role","presentation");let n;const h={hoverDelegate:this._hoverDelegate,...e,isTabList:this.options.ariaRole==="tablist"};this.options.actionViewItemProvider&&(n=this.options.actionViewItemProvider(r,h)),n||(n=new R(this.context,r,h)),this.options.allowContextMenu||this.viewItemDisposables.set(n,l.addDisposableListener(o,l.EventType.CONTEXT_MENU,v=>{l.EventHelper.stop(v,!0)})),n.actionRunner=this._actionRunner,n.setActionContext(this.context),n.render(o),this.focusable&&n instanceof u&&this.viewItems.length===0&&n.setFocusable(!0),s===null||s<0||s>=this.actionsList.children.length?(this.actionsList.appendChild(o),this.viewItems.push(n)):(this.actionsList.insertBefore(o,this.actionsList.children[s]),this.viewItems.splice(s,0,n),s++)}),typeof this.focusedItem=="number"&&this.focus(this.focusedItem),this.refreshRole()}getWidth(t){if(t>=0&&t<this.actionsList.children.length){const e=this.actionsList.children.item(t);if(e)return e.clientWidth}return 0}getHeight(t){if(t>=0&&t<this.actionsList.children.length){const e=this.actionsList.children.item(t);if(e)return e.clientHeight}return 0}pull(t){t>=0&&t<this.viewItems.length&&(this.actionsList.childNodes[t].remove(),this.viewItemDisposables.deleteAndDispose(this.viewItems[t]),m(this.viewItems.splice(t,1)),this.refreshRole())}clear(){this.isEmpty()||(this.viewItems=m(this.viewItems),this.viewItemDisposables.clearAndDisposeAll(),l.clearNode(this.actionsList),this.refreshRole())}length(){return this.viewItems.length}isEmpty(){return this.viewItems.length===0}focus(t){let e=!1,i;if(t===void 0?e=!0:typeof t=="number"?i=t:typeof t=="boolean"&&(e=t),e&&typeof this.focusedItem>"u"){const s=this.viewItems.findIndex(r=>r.isEnabled());this.focusedItem=s===-1?void 0:s,this.updateFocus(void 0,void 0,!0)}else i!==void 0&&(this.focusedItem=i),this.updateFocus(void 0,void 0,!0)}focusFirst(){return this.focusedItem=this.length()-1,this.focusNext(!0)}focusLast(){return this.focusedItem=0,this.focusPrevious(!0)}focusNext(t,e){if(typeof this.focusedItem>"u")this.focusedItem=this.viewItems.length-1;else if(this.viewItems.length<=1)return!1;const i=this.focusedItem;let s;do{if(!t&&this.options.preventLoopNavigation&&this.focusedItem+1>=this.viewItems.length)return this.focusedItem=i,!1;this.focusedItem=(this.focusedItem+1)%this.viewItems.length,s=this.viewItems[this.focusedItem]}while(this.focusedItem!==i&&(this.options.focusOnlyEnabledItems&&!s.isEnabled()||s.action.id===d.ID));return this.updateFocus(void 0,void 0,e),!0}focusPrevious(t){if(typeof this.focusedItem>"u")this.focusedItem=0;else if(this.viewItems.length<=1)return!1;const e=this.focusedItem;let i;do{if(this.focusedItem=this.focusedItem-1,this.focusedItem<0){if(!t&&this.options.preventLoopNavigation)return this.focusedItem=e,!1;this.focusedItem=this.viewItems.length-1}i=this.viewItems[this.focusedItem]}while(this.focusedItem!==e&&(this.options.focusOnlyEnabledItems&&!i.isEnabled()||i.action.id===d.ID));return this.updateFocus(!0),!0}updateFocus(t,e,i=!1){typeof this.focusedItem>"u"&&this.actionsList.focus({preventScroll:e}),this.previouslyFocusedItem!==void 0&&this.previouslyFocusedItem!==this.focusedItem&&this.viewItems[this.previouslyFocusedItem]?.blur();const s=this.focusedItem!==void 0?this.viewItems[this.focusedItem]:void 0;if(s){let r=!0;I.isFunction(s.focus)||(r=!1),this.options.focusOnlyEnabledItems&&I.isFunction(s.isEnabled)&&!s.isEnabled()&&(r=!1),s.action.id===d.ID&&(r=!1),r?(i||this.previouslyFocusedItem!==this.focusedItem)&&(s.focus(t),this.previouslyFocusedItem=this.focusedItem):(this.actionsList.focus({preventScroll:e}),this.previouslyFocusedItem=void 0),r&&s.showHover?.()}}doTrigger(t){if(typeof this.focusedItem>"u")return;const e=this.viewItems[this.focusedItem];if(e instanceof u){const i=e._context===null||e._context===void 0?t:e._context;this.run(e._action,i)}}async run(t,e){await this._actionRunner.run(t,e)}dispose(){this._context=void 0,this.viewItems=m(this.viewItems),this.getContainer().remove(),super.dispose()}}function V(c){if(!c.length)return c;let t=-1;for(let i=0;i<c.length;i++)if(c[i].id!==d.ID){t=i;break}if(t===-1)return[];c=c.slice(t);for(let i=c.length-1;i>=0&&c[i].id===d.ID;i--)c.splice(i,1);let e=!1;for(let i=c.length-1;i>=0;i--){const s=c[i].id===d.ID;s&&!e?c.splice(i,1):s?s&&(e=!1):e=!0}return c}export{H as ActionBar,_ as ActionsOrientation,V as prepareActions};
