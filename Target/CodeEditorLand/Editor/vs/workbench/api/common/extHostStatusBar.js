import{StatusBarAlignment as r,Disposable as u,ThemeColor as l,asStatusBarItemIdentifier as _}from"./extHostTypes.js";import{MainContext as g}from"./extHost.protocol.js";import{localize as h}from"../../../nls.js";import"./extHostCommands.js";import{DisposableStore as p}from"../../../base/common/lifecycle.js";import"../../../platform/extensions/common/extensions.js";import{MarkdownString as f}from"./extHostTypeConverters.js";import{isNumber as b}from"../../../base/common/types.js";class a{static ID_GEN=0;static ALLOWED_BACKGROUND_COLORS=new Map([["statusBarItem.errorBackground",new l("statusBarItem.errorForeground")],["statusBarItem.warningBackground",new l("statusBarItem.warningForeground")]]);#t;#e;_entryId;_extension;_id;_alignment;_priority;_disposed=!1;_visible;_text="";_tooltip;_name;_color;_backgroundColor;_latestCommandRegistration;_staleCommandRegistrations=new p;_command;_timeoutHandle;_accessibilityInformation;constructor(t,e,i,s,o,m=r.Left,d){if(this.#t=t,this.#e=e,o&&s){this._entryId=_(s.identifier,o);const n=i.get(this._entryId);n&&(m=n.alignLeft?r.Left:r.Right,d=n.priority,this._visible=!0,this.name=n.name,this.text=n.text,this.tooltip=n.tooltip,this.command=n.command,this.accessibilityInformation=n.accessibilityInformation)}else this._entryId=String(a.ID_GEN++);this._extension=s,this._id=o,this._alignment=m,this._priority=this.validatePriority(d)}validatePriority(t){if(b(t))return t===Number.POSITIVE_INFINITY?Number.MAX_VALUE:t===Number.NEGATIVE_INFINITY?-Number.MAX_VALUE:t}get id(){return this._id??this._extension.identifier.value}get alignment(){return this._alignment}get priority(){return this._priority}get text(){return this._text}get name(){return this._name}get tooltip(){return this._tooltip}get color(){return this._color}get backgroundColor(){return this._backgroundColor}get command(){return this._command?.fromApi}get accessibilityInformation(){return this._accessibilityInformation}set text(t){this._text=t,this.update()}set name(t){this._name=t,this.update()}set tooltip(t){this._tooltip=t,this.update()}set color(t){this._color=t,this.update()}set backgroundColor(t){t&&!a.ALLOWED_BACKGROUND_COLORS.has(t.id)&&(t=void 0),this._backgroundColor=t,this.update()}set command(t){this._command?.fromApi!==t&&(this._latestCommandRegistration&&this._staleCommandRegistrations.add(this._latestCommandRegistration),this._latestCommandRegistration=new p,typeof t=="string"?this._command={fromApi:t,internal:this.#e.toInternal({title:"",command:t},this._latestCommandRegistration)}:t?this._command={fromApi:t,internal:this.#e.toInternal(t,this._latestCommandRegistration)}:this._command=void 0,this.update())}set accessibilityInformation(t){this._accessibilityInformation=t,this.update()}show(){this._visible=!0,this.update()}hide(){clearTimeout(this._timeoutHandle),this._visible=!1,this.#t.$disposeEntry(this._entryId)}update(){this._disposed||!this._visible||(clearTimeout(this._timeoutHandle),this._timeoutHandle=setTimeout(()=>{this._timeoutHandle=void 0;let t;this._extension?this._id?t=`${this._extension.identifier.value}.${this._id}`:t=this._extension.identifier.value:t=this._id;let e;this._name?e=this._name:e=h("extensionLabel","{0} (Extension)",this._extension.displayName||this._extension.name);let i=this._color;this._backgroundColor&&(i=a.ALLOWED_BACKGROUND_COLORS.get(this._backgroundColor.id));const s=f.fromStrict(this._tooltip);this.#t.$setEntry(this._entryId,t,this._extension?.identifier.value,e,this._text,s,this._command?.internal,i,this._backgroundColor,this._alignment===r.Left,this._priority,this._accessibilityInformation),this._staleCommandRegistrations.clear()},0))}dispose(){this.hide(),this._disposed=!0}}class v{_item;_messages=[];constructor(t){this._item=t.createStatusBarEntry(void 0,"status.extensionMessage",r.Left,Number.MIN_VALUE),this._item.name=h("status.extensionMessage","Extension Status")}dispose(){this._messages.length=0,this._item.dispose()}setMessage(t){const e={message:t};return this._messages.unshift(e),this._update(),new u(()=>{const i=this._messages.indexOf(e);i>=0&&(this._messages.splice(i,1),this._update())})}_update(){this._messages.length>0?(this._item.text=this._messages[0].message,this._item.show()):this._item.hide()}}class k{_proxy;_commands;_statusMessage;_existingItems=new Map;constructor(t,e){this._proxy=t.getProxy(g.MainThreadStatusBar),this._commands=e,this._statusMessage=new v(this)}$acceptStaticEntries(t){for(const e of t)this._existingItems.set(e.entryId,e)}createStatusBarEntry(t,e,i,s){return new a(this._proxy,this._commands,this._existingItems,t,e,i,s)}setStatusBarMessage(t,e){const i=this._statusMessage.setMessage(t);let s;return typeof e=="number"?s=setTimeout(()=>i.dispose(),e):typeof e<"u"&&e.then(()=>i.dispose(),()=>i.dispose()),new u(()=>{i.dispose(),clearTimeout(s)})}}export{k as ExtHostStatusBar,a as ExtHostStatusBarEntry};
