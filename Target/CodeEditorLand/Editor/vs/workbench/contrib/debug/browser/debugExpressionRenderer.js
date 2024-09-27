var S=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var I=(c,t,e,n)=>{for(var i=n>1?void 0:n?k(t,e):t,s=c.length-1,o;s>=0;s--)(o=c[s])&&(i=(n?o(t,e,i):o(i))||i);return n&&i&&S(t,e,i),i},d=(c,t)=>(e,n)=>t(e,n,c);import*as l from"../../../../base/browser/dom.js";import"../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";import{getDefaultHoverDelegate as E}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{DisposableStore as H}from"../../../../base/common/lifecycle.js";import"../../../../base/common/observable.js";import{CommandsRegistry as T,ICommandService as A}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as N}from"../../../../platform/configuration/common/configuration.js";import{IHoverService as R}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as w}from"../../../../platform/instantiation/common/instantiation.js";import{observableConfigValue as _}from"../../../../platform/observable/common/platformObservableUtils.js";import"../common/debug.js";import{Expression as g,ExpressionContainer as y,Variable as V}from"../common/debugModel.js";import{ReplEvaluationResult as U}from"../common/replModel.js";import"./baseDebugView.js";import{handleANSIOutput as L}from"./debugANSIHandling.js";import{COPY_EVALUATE_PATH_ID as $,COPY_VALUE_ID as z}from"./debugCommands.js";import{DebugLinkHoverBehavior as C,LinkDetector as B}from"./linkDetector.js";const P=1024,M=/^(true|false)$/i,F=/^(['"]).*\1$/;let p=class{constructor(t,e,n,i){this.commandService=t;this.hoverService=i;this.linkDetector=n.createInstance(B),this.displayType=_("debug.showVariableTypes",!1,e)}displayType;linkDetector;renderVariable(t,e,n={}){const i=this.displayType.get();if(e.available){t.type.textContent="";let o=e.name;e.value&&typeof e.name=="string"&&(e.type&&i?(o+=": ",t.type.textContent=e.type+" ="):o+=" ="),t.label.set(o,n.highlights,e.type&&!i?e.type:e.name),t.name.classList.toggle("virtual",e.presentationHint?.kind==="virtual"),t.name.classList.toggle("internal",e.presentationHint?.visibility==="internal")}else e.value&&typeof e.name=="string"&&e.name&&t.label.set(":");t.expression.classList.toggle("lazy",!!e.presentationHint?.lazy);const s=[{id:z,args:[e,[e]]}];return e.evaluateName&&s.push({id:$,args:[{variable:e}]}),this.renderValue(t.value,e,{showChanged:n.showChanged,maxValueLength:P,hover:{commands:s},colorize:!0,session:e.getSession()})}renderValue(t,e,n={}){const i=new H,s=!!n.session?.rememberedCapabilities?.supportsANSIStyling;let o=typeof e=="string"?e:e.value;t.className="value",o===null||(e instanceof g||e instanceof V||e instanceof U)&&!e.available?(t.classList.add("unavailable"),o!==g.DEFAULT_VALUE&&t.classList.add("error")):(typeof e!="string"&&n.showChanged&&e.valueChanged&&o!==g.DEFAULT_VALUE&&(t.className="value changed",e.valueChanged=!1),n.colorize&&typeof e!="string"&&(e.type==="number"||e.type==="boolean"||e.type==="string"?t.classList.add(e.type):isNaN(+o)?M.test(o)?t.classList.add("boolean"):F.test(o)&&t.classList.add("string"):t.classList.add("number"))),n.maxValueLength&&o&&o.length>n.maxValueLength&&(o=o.substring(0,n.maxValueLength)+"..."),o||(o="");const a=n.session??(e instanceof y?e.getSession():void 0),D=n.hover===!1?{type:C.Rich,store:i}:{type:C.None};l.clearNode(t);const v=n.locationReference??(e instanceof y&&e.valueLocationReference);let h=this.linkDetector;if(v&&a&&(h=this.linkDetector.makeReferencedLinkDetector(v,a)),s?t.appendChild(L(o,h,a?a.root:void 0)):t.appendChild(h.linkify(o,!1,a?.root,!0,D)),n.hover!==!1){const{commands:b=[]}=n.hover||{};i.add(this.hoverService.setupManagedHover(E("mouse"),t,()=>{const r=l.$("div"),f=l.$("div.hover-row"),m=l.append(f,l.$("div.hover-contents")),u=l.append(m,l.$("pre.debug-var-hover-pre"));return s?u.appendChild(L(o,this.linkDetector,a?a.root:void 0)):u.textContent=o,r.appendChild(f),r},{actions:b.map(({id:r,args:f})=>{const m=T.getCommand(r)?.metadata?.description;return{label:typeof m=="string"?m:m?m.value:r,commandId:r,run:()=>this.commandService.executeCommand(r,...f)}})}))}return i}};p=I([d(0,A),d(1,N),d(2,w),d(3,R)],p);export{p as DebugExpressionRenderer};
