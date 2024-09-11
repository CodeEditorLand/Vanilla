import{CancellationToken as I}from"../../../base/common/cancellation.js";import{Emitter as d}from"../../../base/common/event.js";import{dispose as R}from"../../../base/common/lifecycle.js";import"./extHostCommands.js";import"./extHostWorkspace.js";import"vscode";import{MainContext as W}from"./extHost.protocol.js";import{URI as T}from"../../../base/common/uri.js";import{ThemeIcon as V,QuickInputButtons as E,QuickPickItemKind as w,InputBoxValidationSeverity as v}from"./extHostTypes.js";import{isCancellationError as Q}from"../../../base/common/errors.js";import"../../../platform/extensions/common/extensions.js";import{coalesce as y}from"../../../base/common/arrays.js";import c from"../../../base/common/severity.js";import{ThemeIcon as L}from"../../../base/common/themables.js";import{isProposedApiEnabled as P}from"../../services/extensions/common/extensions.js";import{MarkdownString as B}from"./extHostTypeConverters.js";function Ee(C,O,S){const u=C.getProxy(W.MainThreadQuickOpen);class H{_workspace;_commands;_onDidSelectItem;_validateInput;_sessions=new Map;_instances=0;constructor(e,t){this._workspace=e,this._commands=t}showQuickPick(e,t,i,n=I.None){this._onDidSelectItem=void 0;const s=Promise.resolve(t),p=++this._instances,h=u.$show(p,{title:i?.title,placeHolder:i?.placeHolder,matchOnDescription:i?.matchOnDescription,matchOnDetail:i?.matchOnDetail,ignoreFocusLost:i?.ignoreFocusOut,canPickMany:i?.canPickMany},n),f={},F=h.then(()=>f);return Promise.race([F,s]).then(m=>{if(m===f)return;const D=P(e,"quickPickItemTooltip");return s.then(k=>{const g=[];for(let a=0;a<k.length;a++){const r=k[a];if(typeof r=="string")g.push({label:r,handle:a});else if(r.kind===w.Separator)g.push({type:"separator",label:r.label});else{r.tooltip;const x=r.iconPath?_(r.iconPath):void 0;g.push({label:r.label,iconPath:x?.iconPath,iconClass:x?.iconClass,description:r.description,detail:r.detail,picked:r.picked,alwaysShow:r.alwaysShow,tooltip:D?B.fromStrict(r.tooltip):void 0,handle:a})}}return i&&typeof i.onDidSelectItem=="function"&&(this._onDidSelectItem=a=>{i.onDidSelectItem(k[a])}),u.$setItems(p,g),h.then(a=>{if(typeof a=="number")return k[a];if(Array.isArray(a))return a.map(r=>k[r])})})}).then(void 0,m=>{if(!Q(m))return u.$setError(p,m),Promise.reject(m)})}$onItemSelected(e){this._onDidSelectItem?.(e)}showInput(e,t=I.None){return this._validateInput=e?.validateInput,u.$input(e,typeof this._validateInput=="function",t).then(void 0,i=>{if(!Q(i))return Promise.reject(i)})}async $validateInput(e){if(!this._validateInput)return;const t=await this._validateInput(e);if(!t||typeof t=="string")return t;let i;switch(t.severity){case v.Info:i=c.Info;break;case v.Warning:i=c.Warning;break;case v.Error:i=c.Error;break;default:i=t.message?c.Error:c.Ignore;break}return{content:t.message,severity:i}}async showWorkspaceFolderPick(e,t=I.None){const i=await this._commands.executeCommand("_workbench.pickWorkspaceFolder",[e]);if(!i)return;const n=await this._workspace.getWorkspaceFolders2();if(n)return n.find(s=>s.uri.toString()===i.uri.toString())}createQuickPick(e){const t=new l(e,()=>this._sessions.delete(t._id));return this._sessions.set(t._id,t),t}createInputBox(e){const t=new $(e,()=>this._sessions.delete(t._id));return this._sessions.set(t._id,t),t}$onDidChangeValue(e,t){this._sessions.get(e)?._fireDidChangeValue(t)}$onDidAccept(e){this._sessions.get(e)?._fireDidAccept()}$onDidChangeActive(e,t){const i=this._sessions.get(e);i instanceof l&&i._fireDidChangeActive(t)}$onDidChangeSelection(e,t){const i=this._sessions.get(e);i instanceof l&&i._fireDidChangeSelection(t)}$onDidTriggerButton(e,t){this._sessions.get(e)?._fireDidTriggerButton(t)}$onDidTriggerItemButton(e,t,i){const n=this._sessions.get(e);n instanceof l&&n._fireDidTriggerItemButton(t,i)}$onDidHide(e){this._sessions.get(e)?._fireDidHide()}}class b{constructor(e,t){this._extension=e;this._onDidDispose=t}static _nextId=1;_id=l._nextId++;_title;_steps;_totalSteps;_visible=!1;_expectingHide=!1;_enabled=!0;_busy=!1;_ignoreFocusOut=!0;_value="";_placeholder;_buttons=[];_handlesToButtons=new Map;_onDidAcceptEmitter=new d;_onDidChangeValueEmitter=new d;_onDidTriggerButtonEmitter=new d;_onDidHideEmitter=new d;_updateTimeout;_pendingUpdate={id:this._id};_disposed=!1;_disposables=[this._onDidTriggerButtonEmitter,this._onDidHideEmitter,this._onDidAcceptEmitter,this._onDidChangeValueEmitter];get title(){return this._title}set title(e){this._title=e,this.update({title:e})}get step(){return this._steps}set step(e){this._steps=e,this.update({step:e})}get totalSteps(){return this._totalSteps}set totalSteps(e){this._totalSteps=e,this.update({totalSteps:e})}get enabled(){return this._enabled}set enabled(e){this._enabled=e,this.update({enabled:e})}get busy(){return this._busy}set busy(e){this._busy=e,this.update({busy:e})}get ignoreFocusOut(){return this._ignoreFocusOut}set ignoreFocusOut(e){this._ignoreFocusOut=e,this.update({ignoreFocusOut:e})}get value(){return this._value}set value(e){this._value=e,this.update({value:e})}get placeholder(){return this._placeholder}set placeholder(e){this._placeholder=e,this.update({placeholder:e})}onDidChangeValue=this._onDidChangeValueEmitter.event;onDidAccept=this._onDidAcceptEmitter.event;get buttons(){return this._buttons}set buttons(e){const t=P(this._extension,"quickInputButtonLocation");!t&&e.some(i=>i.location),this._buttons=e.slice(),this._handlesToButtons.clear(),e.forEach((i,n)=>{const s=i===E.Back?-1:n;this._handlesToButtons.set(s,i)}),this.update({buttons:e.map((i,n)=>({..._(i.iconPath),tooltip:i.tooltip,handle:i===E.Back?-1:n,location:t?i.location:void 0}))})}onDidTriggerButton=this._onDidTriggerButtonEmitter.event;show(){this._visible=!0,this._expectingHide=!0,this.update({visible:!0})}hide(){this._visible=!1,this.update({visible:!1})}onDidHide=this._onDidHideEmitter.event;_fireDidAccept(){this._onDidAcceptEmitter.fire()}_fireDidChangeValue(e){this._value=e,this._onDidChangeValueEmitter.fire(e)}_fireDidTriggerButton(e){const t=this._handlesToButtons.get(e);t&&this._onDidTriggerButtonEmitter.fire(t)}_fireDidHide(){this._expectingHide&&(this._expectingHide=this._visible,this._onDidHideEmitter.fire())}dispose(){this._disposed||(this._disposed=!0,this._fireDidHide(),this._disposables=R(this._disposables),this._updateTimeout&&(clearTimeout(this._updateTimeout),this._updateTimeout=void 0),this._onDidDispose(),u.$dispose(this._id))}update(e){if(!this._disposed){for(const t of Object.keys(e)){const i=e[t];this._pendingUpdate[t]=i===void 0?null:i}"visible"in this._pendingUpdate?(this._updateTimeout&&(clearTimeout(this._updateTimeout),this._updateTimeout=void 0),this.dispatchUpdate()):this._visible&&!this._updateTimeout&&(this._updateTimeout=setTimeout(()=>{this._updateTimeout=void 0,this.dispatchUpdate()},0))}}dispatchUpdate(){u.$createOrUpdate(this._pendingUpdate),this._pendingUpdate={id:this._id}}}function U(o){if(o instanceof V)return{id:o.id};const e=A(o),t=M(o);return{dark:typeof e=="string"?T.file(e):e,light:typeof t=="string"?T.file(t):t}}function M(o){return typeof o=="object"&&"light"in o?o.light:o}function A(o){return typeof o=="object"&&"dark"in o?o.dark:o}function _(o){const e=U(o);let t,i;return"id"in e?i=L.asClassName(e):t=e,{iconPath:t,iconClass:i}}class l extends b{_items=[];_handlesToItems=new Map;_itemsToHandles=new Map;_canSelectMany=!1;_matchOnDescription=!0;_matchOnDetail=!0;_sortByLabel=!0;_keepScrollPosition=!1;_activeItems=[];_onDidChangeActiveEmitter=new d;_selectedItems=[];_onDidChangeSelectionEmitter=new d;_onDidTriggerItemButtonEmitter=new d;constructor(e,t){super(e,t),this._disposables.push(this._onDidChangeActiveEmitter,this._onDidChangeSelectionEmitter,this._onDidTriggerItemButtonEmitter),this.update({type:"quickPick"})}get items(){return this._items}set items(e){this._items=e.slice(),this._handlesToItems.clear(),this._itemsToHandles.clear(),e.forEach((n,s)=>{this._handlesToItems.set(s,n),this._itemsToHandles.set(n,s)});const t=P(this._extension,"quickPickItemTooltip"),i=[];for(let n=0;n<e.length;n++){const s=e[n];if(s.kind===w.Separator)i.push({type:"separator",label:s.label});else{s.tooltip;const p=s.iconPath?_(s.iconPath):void 0;i.push({handle:n,label:s.label,iconPath:p?.iconPath,iconClass:p?.iconClass,description:s.description,detail:s.detail,picked:s.picked,alwaysShow:s.alwaysShow,tooltip:t?B.fromStrict(s.tooltip):void 0,buttons:s.buttons?.map((h,f)=>({..._(h.iconPath),tooltip:h.tooltip,handle:f}))})}}this.update({items:i})}get canSelectMany(){return this._canSelectMany}set canSelectMany(e){this._canSelectMany=e,this.update({canSelectMany:e})}get matchOnDescription(){return this._matchOnDescription}set matchOnDescription(e){this._matchOnDescription=e,this.update({matchOnDescription:e})}get matchOnDetail(){return this._matchOnDetail}set matchOnDetail(e){this._matchOnDetail=e,this.update({matchOnDetail:e})}get sortByLabel(){return this._sortByLabel}set sortByLabel(e){this._sortByLabel=e,this.update({sortByLabel:e})}get keepScrollPosition(){return this._keepScrollPosition}set keepScrollPosition(e){this._keepScrollPosition=e,this.update({keepScrollPosition:e})}get activeItems(){return this._activeItems}set activeItems(e){this._activeItems=e.filter(t=>this._itemsToHandles.has(t)),this.update({activeItems:this._activeItems.map(t=>this._itemsToHandles.get(t))})}onDidChangeActive=this._onDidChangeActiveEmitter.event;get selectedItems(){return this._selectedItems}set selectedItems(e){this._selectedItems=e.filter(t=>this._itemsToHandles.has(t)),this.update({selectedItems:this._selectedItems.map(t=>this._itemsToHandles.get(t))})}onDidChangeSelection=this._onDidChangeSelectionEmitter.event;_fireDidChangeActive(e){const t=y(e.map(i=>this._handlesToItems.get(i)));this._activeItems=t,this._onDidChangeActiveEmitter.fire(t)}_fireDidChangeSelection(e){const t=y(e.map(i=>this._handlesToItems.get(i)));this._selectedItems=t,this._onDidChangeSelectionEmitter.fire(t)}onDidTriggerItemButton=this._onDidTriggerItemButtonEmitter.event;_fireDidTriggerItemButton(e,t){const i=this._handlesToItems.get(e);if(!i||!i.buttons||!i.buttons.length)return;const n=i.buttons[t];n&&this._onDidTriggerItemButtonEmitter.fire({button:n,item:i})}}class $ extends b{_password=!1;_prompt;_valueSelection;_validationMessage;constructor(e,t){super(e,t),this.update({type:"inputBox"})}get password(){return this._password}set password(e){this._password=e,this.update({password:e})}get prompt(){return this._prompt}set prompt(e){this._prompt=e,this.update({prompt:e})}get valueSelection(){return this._valueSelection}set valueSelection(e){this._valueSelection=e,this.update({valueSelection:e})}get validationMessage(){return this._validationMessage}set validationMessage(e){this._validationMessage=e,e?typeof e=="string"?this.update({validationMessage:e,severity:c.Error}):this.update({validationMessage:e.message,severity:e.severity??c.Error}):this.update({validationMessage:void 0,severity:c.Ignore})}}return new H(O,S)}export{Ee as createExtHostQuickOpen};
