import*as a from"assert";import*as k from"../../../../../base/browser/dom.js";import{HighlightedLabel as E}from"../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";import{DisposableStore as p}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as T}from"../../../../../base/test/common/utils.js";import"../../../../../platform/instantiation/test/common/instantiationServiceMock.js";import{Scope as L,StackFrame as M,Thread as q,Variable as y}from"../../common/debugModel.js";import{MockDebugService as N,MockSession as F}from"../common/mockDebug.js";import{workbenchInstantiationService as H}from"../../../../test/browser/workbenchTestServices.js";import{IHoverService as R}from"../../../../../platform/hover/browser/hover.js";import{NullHoverService as B}from"../../../../../platform/hover/test/browser/nullHoverService.js";import{IDebugService as $}from"../../common/debug.js";import{VariablesRenderer as b}from"../../browser/variablesView.js";import{LinkDetector as j}from"../../browser/linkDetector.js";import{TestConfigurationService as v}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{IConfigurationService as S}from"../../../../../platform/configuration/common/configuration.js";const i=k.$;function g(t,n,e){const o=new F,r=new q(o,"mockthread",1),s={startLineNumber:1,startColumn:1,endLineNumber:void 0,endColumn:void 0},w=new M(r,1,null,"app.js","normal",s,0,!0),x=new L(w,1,"local",1,!1,10,10),l={element:new y(o,1,x,2,"foo","bar.foo",void 0,0,0,void 0,{},"string"),depth:0,visibleChildrenCount:1,visibleChildIndex:-1,collapsible:!1,collapsed:!1,visible:!0,filterData:void 0,children:[]},C=i("."),m=i("."),u=i("."),c=i("."),d=t.add(new E(m)),h=i("."),D=i("."),I=t.add(new p),V=t.add(new p),f={expression:C,name:m,type:u,value:c,label:d,lazyButton:h,inputBoxContainer:D,elementDisposable:I,templateDisposable:V,currentElement:void 0};n.renderElement(l,0,f),a.strictEqual(c.textContent,""),a.strictEqual(d.element.textContent,"foo"),l.element.value="xpto",n.renderElement(l,0,f),a.strictEqual(c.textContent,"xpto"),a.strictEqual(u.textContent,e?"string =":""),a.strictEqual(d.element.textContent,e?"foo: ":"foo =")}suite("Debug - Variable Debug View",()=>{const t=T();let n,e,o,r;setup(()=>{e=H(void 0,t),o=e.createInstance(j);const s=new N;e.stub(R,B),s.getViewModel=()=>({focusedStackFrame:void 0,getSelectedExpression:()=>{}}),s.getViewModel().getSelectedExpression=()=>{},e.stub($,s)}),test("variable expressions with display type",()=>{r=new v({debug:{showVariableTypes:!0}}),e.stub(S,r),n=e.createInstance(b,o),g(t,n,!0)}),test("variable expressions",()=>{r=new v({debug:{showVariableTypes:!1}}),e.stub(S,r),n=e.createInstance(b,o),g(t,n,!1)})});
