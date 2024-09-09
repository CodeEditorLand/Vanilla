var H=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var I=(p,t,o,e)=>{for(var i=e>1?void 0:e?B(t,o):t,n=p.length-1,a;n>=0;n--)(a=p[n])&&(i=(e?a(t,o,i):a(i))||i);return e&&i&&H(t,o,i),i},g=(p,t)=>(o,e)=>t(o,e,p);import*as s from"../../../../base/browser/dom.js";import"../../../../base/browser/keyboardEvent.js";import{ActionBar as z}from"../../../../base/browser/ui/actionbar/actionbar.js";import{HighlightedLabel as M}from"../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";import{getDefaultHoverDelegate as y}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{InputBox as w}from"../../../../base/browser/ui/inputbox/inputBox.js";import"../../../../base/browser/ui/tree/tree.js";import{Codicon as V}from"../../../../base/common/codicons.js";import{createMatches as k}from"../../../../base/common/filters.js";import{createSingleCallFunction as N}from"../../../../base/common/functional.js";import{KeyCode as b}from"../../../../base/common/keyCodes.js";import{DisposableStore as L,dispose as A,toDisposable as _}from"../../../../base/common/lifecycle.js";import{ThemeIcon as R}from"../../../../base/common/themables.js";import{localize as F}from"../../../../nls.js";import{CommandsRegistry as P}from"../../../../platform/commands/common/commands.js";import{IContextViewService as U}from"../../../../platform/contextview/browser/contextView.js";import{IHoverService as $}from"../../../../platform/hover/browser/hover.js";import{defaultInputBoxStyles as K}from"../../../../platform/theme/browser/defaultStyles.js";import{COPY_EVALUATE_PATH_ID as G,COPY_VALUE_ID as W}from"./debugCommands.js";import{DebugLinkHoverBehavior as x}from"./linkDetector.js";import{IDebugService as D}from"../common/debug.js";import{Expression as h,ExpressionContainer as T,Variable as S}from"../common/debugModel.js";import{IDebugVisualizerService as Y}from"../common/debugVisualizers.js";import{ReplEvaluationResult as q}from"../common/replModel.js";const X=1024,j=/^(true|false)$/i,J=/^(['"]).*\1$/,u=s.$;function Ne(p){const t=u(".");return t.classList.add("debug-view-content"),p.appendChild(t),t}function Q(p,t,o,e,i){let n=typeof t=="string"?t:t.value;o.className="value",n===null||(t instanceof h||t instanceof S||t instanceof q)&&!t.available?(o.classList.add("unavailable"),n!==h.DEFAULT_VALUE&&o.classList.add("error")):(typeof t!="string"&&e.showChanged&&t.valueChanged&&n!==h.DEFAULT_VALUE&&(o.className="value changed",t.valueChanged=!1),e.colorize&&typeof t!="string"&&(t.type==="number"||t.type==="boolean"||t.type==="string"?o.classList.add(t.type):isNaN(+n)?j.test(n)?o.classList.add("boolean"):J.test(n)&&o.classList.add("string"):o.classList.add("number"))),e.maxValueLength&&n&&n.length>e.maxValueLength&&(n=n.substring(0,e.maxValueLength)+"..."),n||(n="");const a=t instanceof T?t.getSession():void 0,c=e.hover===!1?{type:x.Rich,store:p}:{type:x.None};if(t instanceof T&&t.valueLocationReference!==void 0&&a&&e.linkDetector?(o.textContent="",o.appendChild(e.linkDetector.linkifyLocation(n,t.valueLocationReference,a,c))):e.linkDetector?(o.textContent="",o.appendChild(e.linkDetector.linkify(n,!1,a?a.root:void 0,!0,c))):o.textContent=n,e.hover!==!1){const{commands:l=[],commandService:d}=e.hover||{};p.add(i.setupManagedHover(y("mouse"),o,()=>{const r=s.$("div"),m=s.$("div.hover-row"),f=s.append(m,s.$("div.hover-contents")),C=s.append(f,s.$("pre.debug-var-hover-pre"));return C.textContent=n,r.appendChild(m),r},{actions:l.map(({id:r,args:m})=>{const f=P.getCommand(r)?.metadata?.description;return{label:typeof f=="string"?f:f?f.value:r,commandId:r,run:()=>d.executeCommand(r,...m)}})}))}}function Ae(p,t,o,e,i,n,a,c,l){if(e.available){i.type.textContent="";let r=e.name;e.value&&typeof e.name=="string"&&(e.type&&l?(r+=": ",i.type.textContent=e.type+" ="):r+=" ="),i.label.set(r,a,e.type&&!l?e.type:e.name),i.name.classList.toggle("virtual",e.presentationHint?.kind==="virtual"),i.name.classList.toggle("internal",e.presentationHint?.visibility==="internal")}else e.value&&typeof e.name=="string"&&e.name&&i.label.set(":");i.expression.classList.toggle("lazy",!!e.presentationHint?.lazy);const d=[{id:W,args:[e,[e]]}];e.evaluateName&&d.push({id:G,args:[{variable:e}]}),Q(p,e,i.value,{showChanged:n,maxValueLength:X,hover:{commands:d,commandService:t},colorize:!0,linkDetector:c},o)}let v=class{constructor(t,o){this.debugService=t;this.debugVisualizer=o}async getChildren(t){const o=this.debugService.getViewModel(),e=await this.doGetChildren(t);return Promise.all(e.map(async i=>{const n=o.getVisualizedExpression(i);if(typeof n=="string"){const a=await this.debugVisualizer.getVisualizedNodeFor(n,i);if(a)return o.setVisualizedExpression(i,a),a}else if(n)return n;return i}))}};v=I([g(0,D),g(1,Y)],v);let E=class{constructor(t,o,e){this.debugService=t;this.contextViewService=o;this.hoverService=e}renderTemplate(t){const o=new L,e=s.append(t,u(".expression")),i=s.append(e,u("span.name")),n=s.append(e,u("span.lazy-button"));n.classList.add(...R.asClassNameArray(V.eye)),o.add(this.hoverService.setupManagedHover(y("mouse"),n,F("debug.lazyButton.tooltip","Click to expand")));const a=s.append(e,u("span.type")),c=s.append(e,u("span.value")),l=o.add(new M(i)),d=s.append(e,u(".inputBoxContainer"));let r;this.renderActionBar&&(s.append(e,u(".span.actionbar-spacer")),r=o.add(new z(e)));const m={expression:e,name:i,type:a,value:c,label:l,inputBoxContainer:d,actionBar:r,elementDisposable:new L,templateDisposable:o,lazyButton:n,currentElement:void 0};return o.add(s.addDisposableListener(n,s.EventType.CLICK,()=>{m.currentElement&&this.debugService.getViewModel().evaluateLazyExpression(m.currentElement)})),m}renderExpressionElement(t,o,e){e.currentElement=t,this.renderExpression(o.element,e,k(o.filterData)),e.actionBar&&this.renderActionBar(e.actionBar,t,e);const i=this.debugService.getViewModel().getSelectedExpression();if(t===i?.expression||t instanceof S&&t.errorMessage){const n=this.getInputBoxOptions(t,!!i?.settingWatch);n&&e.elementDisposable.add(this.renderInputBox(e.name,e.value,e.inputBoxContainer,n))}}renderInputBox(t,o,e,i){t.style.display="none",o.style.display="none",e.style.display="initial",s.clearNode(e);const n=new w(e,this.contextViewService,{...i,inputBoxStyles:K});n.value=i.initialValue,n.focus(),n.select();const a=N((l,d)=>{t.style.display="",o.style.display="",e.style.display="none";const r=n.value;A(c),d&&(this.debugService.getViewModel().setSelectedExpression(void 0,!1),i.onFinish(r,l))}),c=[n,s.addStandardDisposableListener(n.inputElement,s.EventType.KEY_DOWN,l=>{const d=l.equals(b.Escape),r=l.equals(b.Enter);(d||r)&&(l.preventDefault(),l.stopPropagation(),a(r,!0))}),s.addDisposableListener(n.inputElement,s.EventType.BLUR,()=>{a(!0,!0)}),s.addDisposableListener(n.inputElement,s.EventType.CLICK,l=>{l.preventDefault(),l.stopPropagation()})];return _(()=>{a(!1,!1)})}disposeElement(t,o,e){e.elementDisposable.clear()}disposeTemplate(t){t.elementDisposable.dispose(),t.templateDisposable.dispose()}};E=I([g(0,D),g(1,U),g(2,$)],E);export{v as AbstractExpressionDataSource,E as AbstractExpressionsRenderer,Q as renderExpressionValue,Ae as renderVariable,Ne as renderViewTree};
