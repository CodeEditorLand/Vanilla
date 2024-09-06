var I=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var m=(a,r,e,o)=>{for(var i=o>1?void 0:o?b(r,e):r,n=a.length-1,c;n>=0;n--)(c=a[n])&&(i=(o?c(r,e,i):c(i))||i);return o&&i&&I(r,e,i),i},s=(a,r)=>(e,o)=>r(e,o,a);import*as t from"../../../../vs/base/browser/dom.js";import{StandardKeyboardEvent as l}from"../../../../vs/base/browser/keyboardEvent.js";import{BaseActionViewItem as f}from"../../../../vs/base/browser/ui/actionbar/actionViewItems.js";import{DropdownMenuActionViewItem as h}from"../../../../vs/base/browser/ui/dropdown/dropdownActionViewItem.js";import"../../../../vs/base/browser/ui/hover/hoverDelegate.js";import"../../../../vs/base/common/actions.js";import"../../../../vs/base/common/event.js";import"../../../../vs/base/common/keybindings.js";import{KeyCode as v}from"../../../../vs/base/common/keyCodes.js";import{IAccessibilityService as g}from"../../../../vs/platform/accessibility/common/accessibility.js";import{MenuEntryActionViewItem as C}from"../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import"../../../../vs/platform/actions/common/actions.js";import{IContextKeyService as D}from"../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../vs/platform/contextview/browser/contextView.js";import{IKeybindingService as x}from"../../../../vs/platform/keybinding/common/keybinding.js";import{INotificationService as E}from"../../../../vs/platform/notification/common/notification.js";import{IThemeService as K}from"../../../../vs/platform/theme/common/themeService.js";let p=class extends f{constructor(e,o,i,n,c,d,u,_,A,w,y){super(null,e,{hoverDelegate:d?.hoverDelegate});this._contextMenuProvider=c;this._options=d;this._primaryAction=new C(e,{hoverDelegate:d?.hoverDelegate},u,_,A,w,c,y),d?.actionRunner&&(this._primaryAction.actionRunner=d.actionRunner),this._dropdown=new h(o,i,this._contextMenuProvider,{menuAsChild:d?.menuAsChild??!0,classNames:n?["codicon","codicon-chevron-down",n]:["codicon","codicon-chevron-down"],actionRunner:this._options?.actionRunner,keybindingProvider:this._options?.getKeyBinding,hoverDelegate:d?.hoverDelegate})}_primaryAction;_dropdown;_container=null;_dropdownContainer=null;get onDidChangeDropdownVisibility(){return this._dropdown.onDidChangeVisibility}setActionContext(e){super.setActionContext(e),this._primaryAction.setActionContext(e),this._dropdown.setActionContext(e)}render(e){this._container=e,super.render(this._container),this._container.classList.add("monaco-dropdown-with-primary");const o=t.$(".action-container");this._primaryAction.render(t.append(this._container,o)),this._dropdownContainer=t.$(".dropdown-action-container"),this._dropdown.render(t.append(this._container,this._dropdownContainer)),this._register(t.addDisposableListener(o,t.EventType.KEY_DOWN,i=>{const n=new l(i);n.equals(v.RightArrow)&&(this._primaryAction.element.tabIndex=-1,this._dropdown.focus(),n.stopPropagation())})),this._register(t.addDisposableListener(this._dropdownContainer,t.EventType.KEY_DOWN,i=>{const n=new l(i);n.equals(v.LeftArrow)&&(this._primaryAction.element.tabIndex=0,this._dropdown.setFocusable(!1),this._primaryAction.element?.focus(),n.stopPropagation())})),this.updateEnabled()}focus(e){e?this._dropdown.focus():(this._primaryAction.element.tabIndex=0,this._primaryAction.element.focus())}blur(){this._primaryAction.element.tabIndex=-1,this._dropdown.blur(),this._container.blur()}setFocusable(e){e?this._primaryAction.element.tabIndex=0:(this._primaryAction.element.tabIndex=-1,this._dropdown.setFocusable(!1))}updateEnabled(){const e=!this.action.enabled;this.element?.classList.toggle("disabled",e)}update(e,o,i){this._dropdown.dispose(),this._dropdown=new h(e,o,this._contextMenuProvider,{menuAsChild:!0,classNames:["codicon",i||"codicon-chevron-down"],actionRunner:this._options?.actionRunner,hoverDelegate:this._options?.hoverDelegate,keybindingProvider:this._options?.getKeyBinding}),this._dropdownContainer&&this._dropdown.render(this._dropdownContainer)}dispose(){this._primaryAction.dispose(),this._dropdown.dispose(),super.dispose()}};p=m([s(6,x),s(7,E),s(8,D),s(9,K),s(10,g)],p);export{p as DropdownWithPrimaryActionViewItem};