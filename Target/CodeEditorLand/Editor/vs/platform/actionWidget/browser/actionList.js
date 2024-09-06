var T=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var g=(s,i,t,e)=>{for(var n=e>1?void 0:e?k(i,t):i,l=s.length-1,r;l>=0;l--)(r=s[l])&&(n=(e?r(i,t,n):r(n))||n);return e&&n&&T(i,t,n),n},u=(s,i)=>(t,e)=>i(t,e,s);import*as A from"../../../../vs/base/browser/dom.js";import{KeybindingLabel as x}from"../../../../vs/base/browser/ui/keybindingLabel/keybindingLabel.js";import"../../../../vs/base/browser/ui/list/list.js";import{List as w}from"../../../../vs/base/browser/ui/list/listWidget.js";import{CancellationTokenSource as H}from"../../../../vs/base/common/cancellation.js";import{Codicon as S}from"../../../../vs/base/common/codicons.js";import"../../../../vs/base/common/keybindings.js";import{Disposable as C}from"../../../../vs/base/common/lifecycle.js";import{OS as E}from"../../../../vs/base/common/platform.js";import{ThemeIcon as b}from"../../../../vs/base/common/themables.js";import"vs/css!./actionWidget";import{localize as h}from"../../../../vs/nls.js";import{IContextViewService as M}from"../../../../vs/platform/contextview/browser/contextView.js";import{IKeybindingService as v}from"../../../../vs/platform/keybinding/common/keybinding.js";import{defaultListStyles as D}from"../../../../vs/platform/theme/browser/defaultStyles.js";import{asCssVariable as N}from"../../../../vs/platform/theme/common/colorRegistry.js";const P="acceptSelectedCodeAction",K="previewSelectedCodeAction";var F=(t=>(t.Action="action",t.Header="header",t))(F||{});class V{get templateId(){return"header"}renderTemplate(i){i.classList.add("group-header");const t=document.createElement("span");return i.append(t),{container:i,text:t}}renderElement(i,t,e){e.text.textContent=i.group?.title??""}disposeTemplate(i){}}let a=class{constructor(i,t){this._supportsPreview=i;this._keybindingService=t}get templateId(){return"action"}renderTemplate(i){i.classList.add(this.templateId);const t=document.createElement("div");t.className="icon",i.append(t);const e=document.createElement("span");e.className="title",i.append(e);const n=new x(i,E);return{container:i,icon:t,text:e,keybinding:n}}renderElement(i,t,e){if(i.group?.icon?(e.icon.className=b.asClassName(i.group.icon),i.group.icon.color&&(e.icon.style.color=N(i.group.icon.color.id))):(e.icon.className=b.asClassName(S.lightBulb),e.icon.style.color="var(--vscode-editorLightBulb-foreground)"),!i.item||!i.label)return;e.text.textContent=I(i.label),e.keybinding.set(i.keybinding),A.setVisibility(!!i.keybinding,e.keybinding.element);const n=this._keybindingService.lookupKeybinding(P)?.getLabel(),l=this._keybindingService.lookupKeybinding(K)?.getLabel();e.container.classList.toggle("option-disabled",i.disabled),i.disabled?e.container.title=i.label:n&&l?this._supportsPreview&&i.canPreview?e.container.title=h({key:"label-preview",comment:['placeholders are keybindings, e.g "F2 to Apply, Shift+F2 to Preview"']},"{0} to Apply, {1} to Preview",n,l):e.container.title=h({key:"label",comment:['placeholder is a keybinding, e.g "F2 to Apply"']},"{0} to Apply",n):e.container.title=""}disposeTemplate(i){i.keybinding.dispose()}};a=g([u(1,v)],a);class R extends UIEvent{constructor(){super("acceptSelectedAction")}}class y extends UIEvent{constructor(){super("previewSelectedAction")}}function W(s){if(s.kind==="action")return s.label}let p=class extends C{constructor(t,e,n,l,r,f){super();this._delegate=l;this._contextViewService=r;this._keybindingService=f;this.domNode=document.createElement("div"),this.domNode.classList.add("actionList");const c={getHeight:o=>o.kind==="header"?this._headerLineHeight:this._actionLineHeight,getTemplateId:o=>o.kind};this._list=this._register(new w(t,this.domNode,c,[new a(e,this._keybindingService),new V],{keyboardSupport:!1,typeNavigationEnabled:!0,keyboardNavigationLabelProvider:{getKeyboardNavigationLabel:W},accessibilityProvider:{getAriaLabel:o=>{if(o.kind==="action"){let d=o.label?I(o?.label):"";return o.disabled&&(d=h({key:"customQuickFixWidget.labels",comment:["Action widget labels for accessibility."]},"{0}, Disabled Reason: {1}",d,o.disabled)),d}return null},getWidgetAriaLabel:()=>h({key:"customQuickFixWidget",comment:["An action widget option"]},"Action Widget"),getRole:o=>o.kind==="action"?"option":"separator",getWidgetRole:()=>"listbox"}})),this._list.style(D),this._register(this._list.onMouseClick(o=>this.onListClick(o))),this._register(this._list.onMouseOver(o=>this.onListHover(o))),this._register(this._list.onDidChangeFocus(()=>this.onFocus())),this._register(this._list.onDidChangeSelection(o=>this.onListSelection(o))),this._allMenuItems=n,this._list.splice(0,this._list.length,this._allMenuItems),this._list.length&&this.focusNext()}domNode;_list;_actionLineHeight=28;_headerLineHeight=28;_allMenuItems;cts=this._register(new H);focusCondition(t){return!t.disabled&&t.kind==="action"}hide(t){this._delegate.onHide(t),this.cts.cancel(),this._contextViewService.hideContextView()}layout(t){const e=this._allMenuItems.filter(o=>o.kind==="header").length,l=this._allMenuItems.length*this._actionLineHeight+e*this._headerLineHeight-e*this._actionLineHeight;this._list.layout(l);let r=t;if(this._allMenuItems.length>=50)r=380;else{const o=this._allMenuItems.map((d,L)=>{const m=this.domNode.ownerDocument.getElementById(this._list.getElementID(L));if(m){m.style.width="auto";const _=m.getBoundingClientRect().width;return m.style.width="",_}return 0});r=Math.max(...o,t)}const c=Math.min(l,this.domNode.ownerDocument.body.clientHeight*.7);return this._list.layout(c,r),this.domNode.style.height=`${c}px`,this._list.domFocus(),r}focusPrevious(){this._list.focusPrevious(1,!0,void 0,this.focusCondition)}focusNext(){this._list.focusNext(1,!0,void 0,this.focusCondition)}acceptSelected(t){const e=this._list.getFocus();if(e.length===0)return;const n=e[0],l=this._list.element(n);if(!this.focusCondition(l))return;const r=t?new y:new R;this._list.setSelection([n],r)}onListSelection(t){if(!t.elements.length)return;const e=t.elements[0];e.item&&this.focusCondition(e)?this._delegate.onSelect(e.item,t.browserEvent instanceof y):this._list.setSelection([])}onFocus(){const t=this._list.getFocus();if(t.length===0)return;const e=t[0],n=this._list.element(e);this._delegate.onFocus?.(n.item)}async onListHover(t){const e=t.element;if(e&&e.item&&this.focusCondition(e)){if(this._delegate.onHover&&!e.disabled&&e.kind==="action"){const n=await this._delegate.onHover(e.item,this.cts.token);e.canPreview=n?n.canPreview:void 0}t.index&&this._list.splice(t.index,1,[e])}this._list.setFocus(typeof t.index=="number"?[t.index]:[])}onListClick(t){t.element&&this.focusCondition(t.element)&&this._list.setFocus([])}};p=g([u(4,M),u(5,v)],p);function I(s){return s.replace(/\r\n|\r|\n/g," ")}export{p as ActionList,F as ActionListItemKind,P as acceptSelectedActionCommand,K as previewSelectedActionCommand};
