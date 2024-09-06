import*as I from"../../../../../vs/base/browser/browser.js";import*as u from"../../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as p}from"../../../../../vs/base/browser/keyboardEvent.js";import{StandardMouseEvent as g}from"../../../../../vs/base/browser/mouseEvent.js";import{EventType as w,Gesture as S}from"../../../../../vs/base/browser/touch.js";import{cleanMnemonic as y,HorizontalDirection as m,Menu as R,MENU_ESCAPED_MNEMONIC_REGEX as M,MENU_MNEMONIC_REGEX as O,VerticalDirection as b}from"../../../../../vs/base/browser/ui/menu/menu.js";import{ActionRunner as U,Separator as F,SubmenuAction as D}from"../../../../../vs/base/common/actions.js";import{asArray as N}from"../../../../../vs/base/common/arrays.js";import{RunOnceScheduler as _}from"../../../../../vs/base/common/async.js";import{Codicon as A}from"../../../../../vs/base/common/codicons.js";import{Emitter as L}from"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/keybindings.js";import{KeyCode as c,KeyMod as C,ScanCode as V,ScanCodeUtils as W}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as K,DisposableStore as H,dispose as P}from"../../../../../vs/base/common/lifecycle.js";import{isMacintosh as x}from"../../../../../vs/base/common/platform.js";import*as E from"../../../../../vs/base/common/strings.js";import{ThemeIcon as X}from"../../../../../vs/base/common/themables.js";import"vs/css!./menubar";import{mainWindow as z}from"../../../../../vs/base/browser/window.js";import*as T from"../../../../../vs/nls.js";const f=u.$;var k=(o=>(o[o.HIDDEN=0]="HIDDEN",o[o.VISIBLE=1]="VISIBLE",o[o.FOCUSED=2]="FOCUSED",o[o.OPEN=3]="OPEN",o))(k||{});class h extends K{constructor(e,s,o){super();this.container=e;this.options=s;this.menuStyle=o;this.container.setAttribute("role","menubar"),this.isCompact&&this.container.classList.add("compact"),this.menus=[],this.mnemonics=new Map,this._focusState=1,this._onVisibilityChange=this._register(new L),this._onFocusStateChange=this._register(new L),this.createOverflowMenu(),this.menuUpdater=this._register(new _(()=>this.update(),200)),this.actionRunner=this.options.actionRunner??this._register(new U),this._register(this.actionRunner.onWillRun(()=>{this.setUnfocusedState()})),this._register(u.ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled,this)),this._register(u.addDisposableListener(this.container,u.EventType.KEY_DOWN,r=>{const i=new p(r);let t=!0;const a=r.key?r.key.toLocaleLowerCase():"",l=x&&!this.isCompact;if(i.equals(c.LeftArrow)||l&&i.equals(c.Tab|C.Shift))this.focusPrevious();else if(i.equals(c.RightArrow)||l&&i.equals(c.Tab))this.focusNext();else if(i.equals(c.Escape)&&this.isFocused&&!this.isOpen)this.setUnfocusedState();else if(!this.isOpen&&!i.ctrlKey&&this.options.enableMnemonics&&this.mnemonicsInUse&&this.mnemonics.has(a)){const d=this.mnemonics.get(a);this.onMenuTriggered(d,!1)}else t=!1;!this.isCompact&&(i.equals(c.Tab|C.Shift)||i.equals(c.Tab))&&i.preventDefault(),t&&(i.preventDefault(),i.stopPropagation())}));const n=u.getWindow(this.container);this._register(u.addDisposableListener(n,u.EventType.MOUSE_DOWN,()=>{this.isFocused&&this.setUnfocusedState()})),this._register(u.addDisposableListener(this.container,u.EventType.FOCUS_IN,r=>{const i=r;i.relatedTarget&&(this.container.contains(i.relatedTarget)||(this.focusToReturn=i.relatedTarget))})),this._register(u.addDisposableListener(this.container,u.EventType.FOCUS_OUT,r=>{const i=r;i.relatedTarget?i.relatedTarget&&!this.container.contains(i.relatedTarget)&&(this.focusToReturn=void 0,this.setUnfocusedState()):this.setUnfocusedState()})),this._register(u.addDisposableListener(n,u.EventType.KEY_DOWN,r=>{if(!this.options.enableMnemonics||!r.altKey||r.ctrlKey||r.defaultPrevented)return;const i=r.key.toLocaleLowerCase();if(!this.mnemonics.has(i))return;this.mnemonicsInUse=!0,this.updateMnemonicVisibility(!0);const t=this.mnemonics.get(i);this.onMenuTriggered(t,!1)})),this.setUnfocusedState()}static OVERFLOW_INDEX=-1;menus;overflowMenu;focusedMenu;focusToReturn;menuUpdater;_mnemonicsInUse=!1;openedViaKeyboard=!1;awaitingAltRelease=!1;ignoreNextMouseUp=!1;mnemonics;updatePending=!1;_focusState;actionRunner;_onVisibilityChange;_onFocusStateChange;numMenusShown=0;overflowLayoutScheduled=void 0;menuDisposables=this._register(new H);push(e){N(e).forEach(o=>{const n=this.menus.length,r=y(o.label),i=O.exec(o.label);if(i){const t=i[1]?i[1]:i[3];this.registerMnemonic(this.menus.length,t)}if(this.isCompact)this.menus.push(o);else{const t=f("div.menubar-menu-button",{role:"menuitem",tabindex:-1,"aria-label":r,"aria-haspopup":!0}),a=f("div.menubar-menu-title",{role:"none","aria-hidden":!0});t.appendChild(a),this.container.insertBefore(t,this.overflowMenu.buttonElement),this.updateLabels(a,t,o.label),this._register(u.addDisposableListener(t,u.EventType.KEY_UP,l=>{const d=new p(l);let v=!0;(d.equals(c.DownArrow)||d.equals(c.Enter))&&!this.isOpen?(this.focusedMenu={index:n},this.openedViaKeyboard=!0,this.focusState=3):v=!1,v&&(d.preventDefault(),d.stopPropagation())})),this._register(S.addTarget(t)),this._register(u.addDisposableListener(t,w.Tap,l=>{this.isOpen&&this.focusedMenu&&this.focusedMenu.holder&&u.isAncestor(l.initialTarget,this.focusedMenu.holder)||(this.ignoreNextMouseUp=!1,this.onMenuTriggered(n,!0),l.preventDefault(),l.stopPropagation())})),this._register(u.addDisposableListener(t,u.EventType.MOUSE_DOWN,l=>{if(!new g(u.getWindow(t),l).leftButton){l.preventDefault();return}this.isOpen?this.ignoreNextMouseUp=!1:(this.ignoreNextMouseUp=!0,this.onMenuTriggered(n,!0)),l.preventDefault(),l.stopPropagation()})),this._register(u.addDisposableListener(t,u.EventType.MOUSE_UP,l=>{l.defaultPrevented||(this.ignoreNextMouseUp?this.ignoreNextMouseUp=!1:this.isFocused&&this.onMenuTriggered(n,!0))})),this._register(u.addDisposableListener(t,u.EventType.MOUSE_ENTER,()=>{this.isOpen&&!this.isCurrentMenu(n)?(t.focus(),this.cleanupCustomMenu(),this.showCustomMenu(n,!1)):this.isFocused&&!this.isOpen&&(this.focusedMenu={index:n},t.focus())})),this.menus.push({label:o.label,actions:o.actions,buttonElement:t,titleElement:a})}})}createOverflowMenu(){const e=this.isCompact?T.localize("mAppMenu","Application Menu"):T.localize("mMore","More"),s=f("div.menubar-menu-button",{role:"menuitem",tabindex:this.isCompact?0:-1,"aria-label":e,"aria-haspopup":!0}),o=f("div.menubar-menu-title.toolbar-toggle-more"+X.asCSSSelector(A.menuBarMore),{role:"none","aria-hidden":!0});s.appendChild(o),this.container.appendChild(s),s.style.visibility="hidden",this._register(u.addDisposableListener(s,u.EventType.KEY_UP,n=>{const r=new p(n);let i=!0;const t=[c.Enter];this.isCompact?(t.push(c.Space),this.options.compactMode?.horizontal===m.Right?t.push(c.RightArrow):this.options.compactMode?.horizontal===m.Left&&t.push(c.LeftArrow)):t.push(c.DownArrow),t.some(a=>r.equals(a))&&!this.isOpen?(this.focusedMenu={index:h.OVERFLOW_INDEX},this.openedViaKeyboard=!0,this.focusState=3):i=!1,i&&(r.preventDefault(),r.stopPropagation())})),this._register(S.addTarget(s)),this._register(u.addDisposableListener(s,w.Tap,n=>{this.isOpen&&this.focusedMenu&&this.focusedMenu.holder&&u.isAncestor(n.initialTarget,this.focusedMenu.holder)||(this.ignoreNextMouseUp=!1,this.onMenuTriggered(h.OVERFLOW_INDEX,!0),n.preventDefault(),n.stopPropagation())})),this._register(u.addDisposableListener(s,u.EventType.MOUSE_DOWN,n=>{if(!new g(u.getWindow(s),n).leftButton){n.preventDefault();return}this.isOpen?this.ignoreNextMouseUp=!1:(this.ignoreNextMouseUp=!0,this.onMenuTriggered(h.OVERFLOW_INDEX,!0)),n.preventDefault(),n.stopPropagation()})),this._register(u.addDisposableListener(s,u.EventType.MOUSE_UP,n=>{n.defaultPrevented||(this.ignoreNextMouseUp?this.ignoreNextMouseUp=!1:this.isFocused&&this.onMenuTriggered(h.OVERFLOW_INDEX,!0))})),this._register(u.addDisposableListener(s,u.EventType.MOUSE_ENTER,()=>{this.isOpen&&!this.isCurrentMenu(h.OVERFLOW_INDEX)?(this.overflowMenu.buttonElement.focus(),this.cleanupCustomMenu(),this.showCustomMenu(h.OVERFLOW_INDEX,!1)):this.isFocused&&!this.isOpen&&(this.focusedMenu={index:h.OVERFLOW_INDEX},s.focus())})),this.overflowMenu={buttonElement:s,titleElement:o,label:"More",actions:[]}}updateMenu(e){const s=this.menus.filter(o=>o.label===e.label);s&&s.length&&(s[0].actions=e.actions)}dispose(){super.dispose(),this.menus.forEach(e=>{e.titleElement?.remove(),e.buttonElement?.remove()}),this.overflowMenu.titleElement.remove(),this.overflowMenu.buttonElement.remove(),P(this.overflowLayoutScheduled),this.overflowLayoutScheduled=void 0}blur(){this.setUnfocusedState()}getWidth(){if(!this.isCompact&&this.menus){const e=this.menus[0].buttonElement.getBoundingClientRect().left;return(this.hasOverflow?this.overflowMenu.buttonElement.getBoundingClientRect().right:this.menus[this.menus.length-1].buttonElement.getBoundingClientRect().right)-e}return 0}getHeight(){return this.container.clientHeight}toggleFocus(){!this.isFocused&&this.options.visibility!=="hidden"?(this.mnemonicsInUse=!0,this.focusedMenu={index:this.numMenusShown>0?0:h.OVERFLOW_INDEX},this.focusState=2):this.isOpen||this.setUnfocusedState()}updateOverflowAction(){if(!this.menus||!this.menus.length)return;const e="overflow-menu-only";this.container.classList.toggle(e,!1);const s=this.container.offsetWidth;let o=0,n=this.isCompact;const r=this.numMenusShown;this.numMenusShown=0;const i=this.menus.filter(t=>t.buttonElement!==void 0&&t.titleElement!==void 0);for(const t of i){if(!n){const a=t.buttonElement.offsetWidth;o+a>s?n=!0:(o+=a,this.numMenusShown++,this.numMenusShown>r&&(t.buttonElement.style.visibility="visible"))}n&&(t.buttonElement.style.visibility="hidden")}if(this.numMenusShown-1<=i.length/4){for(const t of i)t.buttonElement.style.visibility="hidden";n=!0,this.numMenusShown=0,o=0}if(this.isCompact){this.overflowMenu.actions=[];for(let a=this.numMenusShown;a<this.menus.length;a++)this.overflowMenu.actions.push(new D(`menubar.submenu.${this.menus[a].label}`,this.menus[a].label,this.menus[a].actions||[]));const t=this.options.getCompactMenuActions?.();t&&t.length&&(this.overflowMenu.actions.push(new F),this.overflowMenu.actions.push(...t)),this.overflowMenu.buttonElement.style.visibility="visible"}else if(n){for(;o+this.overflowMenu.buttonElement.offsetWidth>s&&this.numMenusShown>0;){this.numMenusShown--;const t=i[this.numMenusShown].buttonElement.offsetWidth;i[this.numMenusShown].buttonElement.style.visibility="hidden",o-=t}this.overflowMenu.actions=[];for(let t=this.numMenusShown;t<i.length;t++)this.overflowMenu.actions.push(new D(`menubar.submenu.${i[t].label}`,i[t].label,i[t].actions||[]));this.overflowMenu.buttonElement.nextElementSibling!==i[this.numMenusShown].buttonElement&&(this.overflowMenu.buttonElement.remove(),this.container.insertBefore(this.overflowMenu.buttonElement,i[this.numMenusShown].buttonElement)),this.overflowMenu.buttonElement.style.visibility="visible"}else this.overflowMenu.buttonElement.remove(),this.container.appendChild(this.overflowMenu.buttonElement),this.overflowMenu.buttonElement.style.visibility="hidden";this.container.classList.toggle(e,this.numMenusShown===0)}updateLabels(e,s,o){const n=y(o);if(this.options.enableMnemonics){const i=E.escape(o);M.lastIndex=0;let t=M.exec(i);for(;t&&t[1];)t=M.exec(i);const a=l=>l.replace(/&amp;&amp;/g,"&amp;");t?(e.innerText="",e.append(E.ltrim(a(i.substr(0,t.index))," "),f("mnemonic",{"aria-hidden":"true"},t[3]),E.rtrim(a(i.substr(t.index+t[0].length))," "))):e.innerText=a(i).trim()}else e.innerText=n.replace(/&&/g,"&");const r=O.exec(o);if(r){const i=r[1]?r[1]:r[3];this.options.enableMnemonics?s.setAttribute("aria-keyshortcuts","Alt+"+i.toLocaleLowerCase()):s.removeAttribute("aria-keyshortcuts")}}update(e){if(e&&(this.options=e),this.isFocused){this.updatePending=!0;return}this.menus.forEach(s=>{!s.buttonElement||!s.titleElement||this.updateLabels(s.titleElement,s.buttonElement,s.label)}),this.overflowLayoutScheduled||(this.overflowLayoutScheduled=u.scheduleAtNextAnimationFrame(u.getWindow(this.container),()=>{this.updateOverflowAction(),this.overflowLayoutScheduled=void 0})),this.setUnfocusedState()}registerMnemonic(e,s){this.mnemonics.set(s.toLocaleLowerCase(),e)}hideMenubar(){this.container.style.display!=="none"&&(this.container.style.display="none",this._onVisibilityChange.fire(!1))}showMenubar(){this.container.style.display!=="flex"&&(this.container.style.display="flex",this._onVisibilityChange.fire(!0),this.updateOverflowAction())}get focusState(){return this._focusState}set focusState(e){if(this._focusState>=2&&e<2&&this.updatePending&&(this.menuUpdater.schedule(),this.updatePending=!1),e===this._focusState)return;const s=this.isVisible,o=this.isOpen,n=this.isFocused;switch(this._focusState=e,e){case 0:s&&this.hideMenubar(),o&&this.cleanupCustomMenu(),n&&(this.focusedMenu=void 0,this.focusToReturn&&(this.focusToReturn.focus(),this.focusToReturn=void 0));break;case 1:s||this.showMenubar(),o&&this.cleanupCustomMenu(),n&&(this.focusedMenu&&(this.focusedMenu.index===h.OVERFLOW_INDEX?this.overflowMenu.buttonElement.blur():this.menus[this.focusedMenu.index].buttonElement?.blur()),this.focusedMenu=void 0,this.focusToReturn&&(this.focusToReturn.focus(),this.focusToReturn=void 0));break;case 2:s||this.showMenubar(),o&&this.cleanupCustomMenu(),this.focusedMenu&&(this.focusedMenu.index===h.OVERFLOW_INDEX?this.overflowMenu.buttonElement.focus():this.menus[this.focusedMenu.index].buttonElement?.focus());break;case 3:s||this.showMenubar(),this.focusedMenu&&(this.cleanupCustomMenu(),this.showCustomMenu(this.focusedMenu.index,this.openedViaKeyboard));break}this._focusState=e,this._onFocusStateChange.fire(this.focusState>=2)}get isVisible(){return this.focusState>=1}get isFocused(){return this.focusState>=2}get isOpen(){return this.focusState>=3}get hasOverflow(){return this.isCompact||this.numMenusShown<this.menus.length}get isCompact(){return this.options.compactMode!==void 0}setUnfocusedState(){this.options.visibility==="toggle"||this.options.visibility==="hidden"?this.focusState=0:this.options.visibility==="classic"&&I.isFullscreen(z)?this.focusState=0:this.focusState=1,this.ignoreNextMouseUp=!1,this.mnemonicsInUse=!1,this.updateMnemonicVisibility(!1)}focusPrevious(){if(!this.focusedMenu||this.numMenusShown===0)return;let e=(this.focusedMenu.index-1+this.numMenusShown)%this.numMenusShown;this.focusedMenu.index===h.OVERFLOW_INDEX?e=this.numMenusShown-1:this.focusedMenu.index===0&&this.hasOverflow&&(e=h.OVERFLOW_INDEX),e!==this.focusedMenu.index&&(this.isOpen?(this.cleanupCustomMenu(),this.showCustomMenu(e)):this.isFocused&&(this.focusedMenu.index=e,e===h.OVERFLOW_INDEX?this.overflowMenu.buttonElement.focus():this.menus[e].buttonElement?.focus()))}focusNext(){if(!this.focusedMenu||this.numMenusShown===0)return;let e=(this.focusedMenu.index+1)%this.numMenusShown;this.focusedMenu.index===h.OVERFLOW_INDEX?e=0:this.focusedMenu.index===this.numMenusShown-1&&(e=h.OVERFLOW_INDEX),e!==this.focusedMenu.index&&(this.isOpen?(this.cleanupCustomMenu(),this.showCustomMenu(e)):this.isFocused&&(this.focusedMenu.index=e,e===h.OVERFLOW_INDEX?this.overflowMenu.buttonElement.focus():this.menus[e].buttonElement?.focus()))}updateMnemonicVisibility(e){this.menus&&this.menus.forEach(s=>{if(s.titleElement&&s.titleElement.children.length){const o=s.titleElement.children.item(0);o&&(o.style.textDecoration=this.options.alwaysOnMnemonics||e?"underline":"")}})}get mnemonicsInUse(){return this._mnemonicsInUse}set mnemonicsInUse(e){this._mnemonicsInUse=e}get shouldAltKeyFocus(){return x?!1:!this.options.disableAltFocus||this.options.visibility==="toggle"}get onVisibilityChange(){return this._onVisibilityChange.event}get onFocusStateChange(){return this._onFocusStateChange.event}onMenuTriggered(e,s){this.isOpen?this.isCurrentMenu(e)?this.setUnfocusedState():(this.cleanupCustomMenu(),this.showCustomMenu(e,this.openedViaKeyboard)):(this.focusedMenu={index:e},this.openedViaKeyboard=!s,this.focusState=3)}onModifierKeyToggled(e){const s=!e.altKey&&!e.ctrlKey&&!e.shiftKey&&!e.metaKey;this.options.visibility!=="hidden"&&(e.event&&this.shouldAltKeyFocus&&W.toEnum(e.event.code)===V.AltLeft&&e.event.preventDefault(),this.isFocused&&e.lastKeyPressed==="alt"&&e.altKey&&(this.setUnfocusedState(),this.mnemonicsInUse=!1,this.awaitingAltRelease=!0),s&&e.lastKeyPressed==="alt"&&e.lastKeyReleased==="alt"&&(this.awaitingAltRelease||(!this.isFocused&&this.shouldAltKeyFocus?(this.mnemonicsInUse=!0,this.focusedMenu={index:this.numMenusShown>0?0:h.OVERFLOW_INDEX},this.focusState=2):this.isOpen||this.setUnfocusedState())),!e.altKey&&e.lastKeyReleased==="alt"&&(this.awaitingAltRelease=!1),this.options.enableMnemonics&&this.menus&&!this.isOpen&&this.updateMnemonicVisibility(!this.awaitingAltRelease&&e.altKey||this.mnemonicsInUse))}isCurrentMenu(e){return this.focusedMenu?this.focusedMenu.index===e:!1}cleanupCustomMenu(){this.focusedMenu&&(this.focusedMenu.index===h.OVERFLOW_INDEX?this.overflowMenu.buttonElement.focus():this.menus[this.focusedMenu.index].buttonElement?.focus(),this.focusedMenu.holder&&(this.focusedMenu.holder.parentElement?.classList.remove("open"),this.focusedMenu.holder.remove()),this.focusedMenu.widget?.dispose(),this.focusedMenu={index:this.focusedMenu.index}),this.menuDisposables.clear()}showCustomMenu(e,s=!0){const o=e>=this.numMenusShown?h.OVERFLOW_INDEX:e,n=o===h.OVERFLOW_INDEX?this.overflowMenu:this.menus[o];if(!n.actions||!n.buttonElement||!n.titleElement)return;const r=f("div.menubar-menu-items-holder",{title:""});n.buttonElement.classList.add("open");const i=n.titleElement.getBoundingClientRect(),t=u.getDomNodeZoomLevel(n.titleElement);if(this.options.compactMode?.horizontal===m.Right)r.style.left=`${i.left+this.container.clientWidth}px`;else if(this.options.compactMode?.horizontal===m.Left){const d=u.getWindow(this.container).innerWidth;r.style.right=`${d-i.left}px`,r.style.left="auto"}else r.style.left=`${i.left*t}px`;this.options.compactMode?.vertical===b.Above?r.style.top=`${i.top-this.menus.length*30+this.container.clientHeight}px`:this.options.compactMode?.vertical===b.Below?r.style.top=`${i.top}px`:r.style.top=`${i.bottom*t}px`,n.buttonElement.appendChild(r);const a={getKeyBinding:this.options.getKeybinding,actionRunner:this.actionRunner,enableMnemonics:this.options.alwaysOnMnemonics||this.mnemonicsInUse&&this.options.enableMnemonics,ariaLabel:n.buttonElement.getAttribute("aria-label")??void 0,expandDirection:this.isCompact?this.options.compactMode:{horizontal:m.Right,vertical:b.Below},useEventAsContext:!0},l=this.menuDisposables.add(new R(r,n.actions,a,this.menuStyle));this.menuDisposables.add(l.onDidCancel(()=>{this.focusState=2})),o!==e?l.trigger(e-this.numMenusShown):l.focus(s),this.focusedMenu={index:o,holder:r,widget:l}}}export{h as MenuBar};
