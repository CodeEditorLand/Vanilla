var I=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var p=(a,d,e,o)=>{for(var i=o>1?void 0:o?b(d,e):d,n=a.length-1,t;n>=0;n--)(t=a[n])&&(i=(o?t(d,e,i):t(i))||i);return o&&i&&I(d,e,i),i},s=(a,d)=>(e,o)=>d(e,o,a);import*as r from"../../../base/browser/dom.js";import{StandardKeyboardEvent as l}from"../../../base/browser/keyboardEvent.js";import{BaseActionViewItem as f}from"../../../base/browser/ui/actionbar/actionViewItems.js";import{DropdownMenuActionViewItem as m}from"../../../base/browser/ui/dropdown/dropdownActionViewItem.js";import"../../../base/common/actions.js";import"../../../base/common/event.js";import{KeyCode as h}from"../../../base/common/keyCodes.js";import"../../../base/common/keybindings.js";import{MenuEntryActionViewItem as g}from"./menuEntryActionViewItem.js";import"../common/actions.js";import{IContextKeyService as C}from"../../contextkey/common/contextkey.js";import{IKeybindingService as D}from"../../keybinding/common/keybinding.js";import{INotificationService as x}from"../../notification/common/notification.js";import{IThemeService as E}from"../../theme/common/themeService.js";import{IContextMenuService as K}from"../../contextview/browser/contextView.js";import{IAccessibilityService as M}from"../../accessibility/common/accessibility.js";import"../../../base/browser/ui/hover/hoverDelegate.js";let c=class extends f{constructor(e,o,i,n,t,v,u,_,y,A,w){super(null,e,{hoverDelegate:t?.hoverDelegate});this._options=t;this._contextMenuProvider=v;this._primaryAction=new g(e,{hoverDelegate:t?.hoverDelegate},u,_,y,A,v,w),t?.actionRunner&&(this._primaryAction.actionRunner=t.actionRunner),this._dropdown=new m(o,i,this._contextMenuProvider,{menuAsChild:t?.menuAsChild??!0,classNames:n?["codicon","codicon-chevron-down",n]:["codicon","codicon-chevron-down"],actionRunner:this._options?.actionRunner,keybindingProvider:this._options?.getKeyBinding,hoverDelegate:t?.hoverDelegate})}_primaryAction;_dropdown;_container=null;_dropdownContainer=null;get onDidChangeDropdownVisibility(){return this._dropdown.onDidChangeVisibility}setActionContext(e){super.setActionContext(e),this._primaryAction.setActionContext(e),this._dropdown.setActionContext(e)}render(e){this._container=e,super.render(this._container),this._container.classList.add("monaco-dropdown-with-primary");const o=r.$(".action-container");this._primaryAction.render(r.append(this._container,o)),this._dropdownContainer=r.$(".dropdown-action-container"),this._dropdown.render(r.append(this._container,this._dropdownContainer)),this._register(r.addDisposableListener(o,r.EventType.KEY_DOWN,i=>{const n=new l(i);n.equals(h.RightArrow)&&(this._primaryAction.element.tabIndex=-1,this._dropdown.focus(),n.stopPropagation())})),this._register(r.addDisposableListener(this._dropdownContainer,r.EventType.KEY_DOWN,i=>{const n=new l(i);n.equals(h.LeftArrow)&&(this._primaryAction.element.tabIndex=0,this._dropdown.setFocusable(!1),this._primaryAction.element?.focus(),n.stopPropagation())})),this.updateEnabled()}focus(e){e?this._dropdown.focus():(this._primaryAction.element.tabIndex=0,this._primaryAction.element.focus())}blur(){this._primaryAction.element.tabIndex=-1,this._dropdown.blur(),this._container.blur()}setFocusable(e){e?this._primaryAction.element.tabIndex=0:(this._primaryAction.element.tabIndex=-1,this._dropdown.setFocusable(!1))}updateEnabled(){const e=!this.action.enabled;this.element?.classList.toggle("disabled",e)}update(e,o,i){this._dropdown.dispose(),this._dropdown=new m(e,o,this._contextMenuProvider,{menuAsChild:!0,classNames:["codicon",i||"codicon-chevron-down"],actionRunner:this._options?.actionRunner,hoverDelegate:this._options?.hoverDelegate,keybindingProvider:this._options?.getKeyBinding}),this._dropdownContainer&&this._dropdown.render(this._dropdownContainer)}dispose(){this._primaryAction.dispose(),this._dropdown.dispose(),super.dispose()}};c=p([s(5,K),s(6,D),s(7,x),s(8,C),s(9,E),s(10,M)],c);export{c as DropdownWithPrimaryActionViewItem};
