var k=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var u=(i,r,s,e)=>{for(var o=e>1?void 0:e?y(r,s):r,n=i.length-1,c;n>=0;n--)(c=i[n])&&(o=(e?c(r,s,o):c(o))||o);return e&&o&&k(r,s,o),o},p=(i,r)=>(s,e)=>r(s,e,i);import"../../../../../vs/base/common/lifecycle.js";import{localize as f,localize2 as b}from"../../../../../vs/nls.js";import{Categories as x}from"../../../../../vs/platform/action/common/actionCommonCategories.js";import{Action2 as R,registerAction2 as h}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as A}from"../../../../../vs/platform/configuration/common/configuration.js";import{InstantiationType as l,registerSingleton as I}from"../../../../../vs/platform/instantiation/common/extensions.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{IProductService as P}from"../../../../../vs/platform/product/common/productService.js";import{Extensions as v}from"../../../../../vs/platform/quickinput/common/quickAccess.js";import{Registry as m}from"../../../../../vs/platform/registry/common/platform.js";import{Extensions as C}from"../../../../../vs/workbench/common/contributions.js";import{IssueQuickAccess as g}from"../../../../../vs/workbench/contrib/issue/browser/issueQuickAccess.js";import{IIssueFormService as Q,IssueType as S,IWorkbenchIssueService as d}from"../../../../../vs/workbench/contrib/issue/common/issue.js";import{BaseIssueContribution as E}from"../../../../../vs/workbench/contrib/issue/common/issue.contribution.js";import{NativeIssueService as D}from"../../../../../vs/workbench/contrib/issue/electron-sandbox/issueService.js";import{LifecyclePhase as W}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";import"../../../../../vs/workbench/contrib/issue/electron-sandbox/issueMainService.js";import"../../../../../vs/workbench/contrib/issue/browser/issueTroubleshoot.js";import{Extensions as w}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{NativeIssueFormService as T}from"../../../../../vs/workbench/contrib/issue/electron-sandbox/nativeIssueFormService.js";I(d,D,l.Delayed),I(Q,T,l.Delayed);let t=class extends E{constructor(r,s){super(r,s),r.reportIssueUrl&&this._register(h(a));let e;const o=()=>{e=m.as(v.Quickaccess).registerQuickAccessProvider({ctor:g,prefix:g.PREFIX,contextKey:"inReportIssuePicker",placeholder:f("tasksQuickAccessPlaceholder","Type the name of an extension to report on."),helpEntries:[{description:f("openIssueReporter","Open Issue Reporter"),commandId:"workbench.action.openIssueReporter"}]})};m.as(w.Configuration).registerConfiguration({properties:{"issueReporter.experimental.auxWindow":{type:"boolean",default:!0,description:"Enable the new experimental issue reporter in electron."}}}),this._register(s.onDidChangeConfiguration(n=>{!s.getValue("extensions.experimental.issueQuickAccess")&&e?(e.dispose(),e=void 0):e||o()})),s.getValue("extensions.experimental.issueQuickAccess")&&o()}};t=u([p(0,P),p(1,A)],t),m.as(C.Workbench).registerWorkbenchContribution(t,W.Restored);class a extends R{static ID="workbench.action.reportPerformanceIssueUsingReporter";constructor(){super({id:a.ID,title:b({key:"reportPerformanceIssue",comment:["Here, 'issue' means problem or bug"]},"Report Performance Issue..."),category:x.Help,f1:!0})}async run(r){return r.get(d).openReporter({issueType:S.PerformanceIssue})}}