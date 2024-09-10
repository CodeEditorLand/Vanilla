var k=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var u=(i,r,s,e)=>{for(var o=e>1?void 0:e?y(r,s):r,n=i.length-1,c;n>=0;n--)(c=i[n])&&(o=(e?c(r,s,o):c(o))||o);return e&&o&&k(r,s,o),o},p=(i,r)=>(s,e)=>r(s,e,i);import{localize as f,localize2 as b}from"../../../../nls.js";import{registerAction2 as x,Action2 as R}from"../../../../platform/actions/common/actions.js";import{IWorkbenchIssueService as l,IssueType as h,IIssueFormService as A}from"../common/issue.js";import{BaseIssueContribution as P}from"../common/issue.contribution.js";import{IProductService as v}from"../../../../platform/product/common/productService.js";import{Registry as m}from"../../../../platform/registry/common/platform.js";import{Extensions as C}from"../../../common/contributions.js";import{LifecyclePhase as Q}from"../../../services/lifecycle/common/lifecycle.js";import{Categories as S}from"../../../../platform/action/common/actionCommonCategories.js";import{IConfigurationService as E}from"../../../../platform/configuration/common/configuration.js";import{Extensions as D}from"../../../../platform/quickinput/common/quickAccess.js";import{IssueQuickAccess as I}from"../browser/issueQuickAccess.js";import{registerSingleton as g,InstantiationType as d}from"../../../../platform/instantiation/common/extensions.js";import{NativeIssueService as W}from"./issueService.js";import"./issueMainService.js";import"../browser/issueTroubleshoot.js";import{Extensions as w}from"../../../../platform/configuration/common/configurationRegistry.js";import{NativeIssueFormService as T}from"./nativeIssueFormService.js";g(l,W,d.Delayed),g(A,T,d.Delayed);let t=class extends P{constructor(r,s){super(r,s),r.reportIssueUrl&&this._register(x(a));let e;const o=()=>{e=m.as(D.Quickaccess).registerQuickAccessProvider({ctor:I,prefix:I.PREFIX,contextKey:"inReportIssuePicker",placeholder:f("tasksQuickAccessPlaceholder","Type the name of an extension to report on."),helpEntries:[{description:f("openIssueReporter","Open Issue Reporter"),commandId:"workbench.action.openIssueReporter"}]})};m.as(w.Configuration).registerConfiguration({properties:{"issueReporter.experimental.auxWindow":{type:"boolean",default:!0,description:"Enable the new experimental issue reporter in electron."}}}),this._register(s.onDidChangeConfiguration(n=>{!s.getValue("extensions.experimental.issueQuickAccess")&&e?(e.dispose(),e=void 0):e||o()})),s.getValue("extensions.experimental.issueQuickAccess")&&o()}};t=u([p(0,v),p(1,E)],t),m.as(C.Workbench).registerWorkbenchContribution(t,Q.Restored);class a extends R{static ID="workbench.action.reportPerformanceIssueUsingReporter";constructor(){super({id:a.ID,title:b({key:"reportPerformanceIssue",comment:["Here, 'issue' means problem or bug"]},"Report Performance Issue..."),category:S.Help,f1:!0})}async run(r){return r.get(l).openReporter({issueType:h.PerformanceIssue})}}
