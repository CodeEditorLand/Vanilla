var S=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var y=(c,t,e,n)=>{for(var i=n>1?void 0:n?k(t,e):t,s=c.length-1,o;s>=0;s--)(o=c[s])&&(i=(n?o(t,e,i):o(i))||i);return n&&i&&S(t,e,i),i},p=(c,t)=>(e,n)=>t(e,n,c);import*as l from"../../../../base/browser/dom.js";import{getDefaultHoverDelegate as E}from"../../../../base/browser/ui/hover/hoverDelegateFactory.js";import{DisposableStore as H}from"../../../../base/common/lifecycle.js";import{CommandsRegistry as T,ICommandService as w}from"../../../../platform/commands/common/commands.js";import{IConfigurationService as A}from"../../../../platform/configuration/common/configuration.js";import{IHoverService as N}from"../../../../platform/hover/browser/hover.js";import{IInstantiationService as R}from"../../../../platform/instantiation/common/instantiation.js";import{observableConfigValue as _}from"../../../../platform/observable/common/platformObservableUtils.js";import{Expression as g,ExpressionContainer as I,Variable as V}from"../common/debugModel.js";import{ReplEvaluationResult as U}from"../common/replModel.js";import{handleANSIOutput as L}from"./debugANSIHandling.js";import{COPY_EVALUATE_PATH_ID as $,COPY_VALUE_ID as z}from"./debugCommands.js";import{DebugLinkHoverBehavior as b,LinkDetector as j}from"./linkDetector.js";const B=1024,P=/^(true|false)$/i,M=/^(['"]).*\1$/;let f=class{constructor(t,e,n,i){this.commandService=t;this.hoverService=i;this.linkDetector=n.createInstance(j),this.displayType=_("debug.showVariableTypes",!1,e)}displayType;linkDetector;renderVariable(t,e,n={}){const i=this.displayType.get();if(e.available){t.type.textContent="";let o=e.name;e.value&&typeof e.name=="string"&&(e.type&&i?(o+=": ",t.type.textContent=e.type+" ="):o+=" ="),t.label.set(o,n.highlights,e.type&&!i?e.type:e.name),t.name.classList.toggle("virtual",e.presentationHint?.kind==="virtual"),t.name.classList.toggle("internal",e.presentationHint?.visibility==="internal")}else e.value&&typeof e.name=="string"&&e.name&&t.label.set(":");t.expression.classList.toggle("lazy",!!e.presentationHint?.lazy);const s=[{id:z,args:[e,[e]]}];return e.evaluateName&&s.push({id:$,args:[{variable:e}]}),this.renderValue(t.value,e,{showChanged:n.showChanged,maxValueLength:B,hover:{commands:s},colorize:!0,session:e.getSession()})}renderValue(t,e,n={}){const i=new H,s=!!n.session?.capabilities.supportsANSIStyling;let o=typeof e=="string"?e:e.value;t.className="value",o===null||(e instanceof g||e instanceof V||e instanceof U)&&!e.available?(t.classList.add("unavailable"),o!==g.DEFAULT_VALUE&&t.classList.add("error")):(typeof e!="string"&&n.showChanged&&e.valueChanged&&o!==g.DEFAULT_VALUE&&(t.className="value changed",e.valueChanged=!1),n.colorize&&typeof e!="string"&&(e.type==="number"||e.type==="boolean"||e.type==="string"?t.classList.add(e.type):isNaN(+o)?P.test(o)?t.classList.add("boolean"):M.test(o)&&t.classList.add("string"):t.classList.add("number"))),n.maxValueLength&&o&&o.length>n.maxValueLength&&(o=o.substring(0,n.maxValueLength)+"..."),o||(o="");const a=n.session??(e instanceof I?e.getSession():void 0),D=n.hover===!1?{type:b.Rich,store:i}:{type:b.None};l.clearNode(t);const u=n.locationReference??(e instanceof I&&e.valueLocationReference);let h=this.linkDetector;if(u&&a&&(h=this.linkDetector.makeReferencedLinkDetector(u,a)),s?t.appendChild(L(o,h,a?a.root:void 0)):t.appendChild(h.linkify(o,!1,a?.root,!0,D)),n.hover!==!1){const{commands:C=[]}=n.hover||{};i.add(this.hoverService.setupManagedHover(E("mouse"),t,()=>{const r=l.$("div"),d=l.$("div.hover-row"),m=l.append(d,l.$("div.hover-contents")),v=l.append(m,l.$("pre.debug-var-hover-pre"));return s?v.appendChild(L(o,this.linkDetector,a?a.root:void 0)):v.textContent=o,r.appendChild(d),r},{actions:C.map(({id:r,args:d})=>{const m=T.getCommand(r)?.metadata?.description;return{label:typeof m=="string"?m:m?m.value:r,commandId:r,run:()=>this.commandService.executeCommand(r,...d)}})}))}return i}};f=y([p(0,w),p(1,A),p(2,R),p(3,N)],f);export{f as DebugExpressionRenderer};
