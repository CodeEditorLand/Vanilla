var g=Object.defineProperty;var l=Object.getOwnPropertyDescriptor;var p=(t,r,e,i)=>{for(var o=i>1?void 0:i?l(r,e):r,n=t.length-1,m;n>=0;n--)(m=t[n])&&(o=(i?m(r,e,o):m(o))||o);return i&&o&&g(r,e,o),o},a=(t,r)=>(e,i)=>r(e,i,t);import*as y from"../../../../../vs/nls.js";import{CommandsRegistry as I}from"../../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as d}from"../../../../../vs/platform/configuration/common/configuration.js";import{Extensions as C}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{InstantiationType as u,registerSingleton as f}from"../../../../../vs/platform/instantiation/common/extensions.js";import{IProductService as S}from"../../../../../vs/platform/product/common/productService.js";import{Registry as c}from"../../../../../vs/platform/registry/common/platform.js";import{Extensions as b}from"../../../../../vs/workbench/common/contributions.js";import{IssueFormService as R}from"../../../../../vs/workbench/contrib/issue/browser/issueFormService.js";import{BrowserIssueService as h}from"../../../../../vs/workbench/contrib/issue/browser/issueService.js";import"../../../../../vs/workbench/contrib/issue/browser/issueTroubleshoot.js";import{IIssueFormService as v,IWorkbenchIssueService as x}from"../../../../../vs/workbench/contrib/issue/common/issue.js";import{BaseIssueContribution as k}from"../../../../../vs/workbench/contrib/issue/common/issue.contribution.js";import{LifecyclePhase as w}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";let s=class extends k{constructor(r,e){super(r,e),c.as(C.Configuration).registerConfiguration({properties:{"issueReporter.experimental.webReporter":{type:"boolean",default:r.quality!=="stable",description:"Enable experimental issue reporter for web."}}})}};s=p([a(0,S),a(1,d)],s),c.as(b.Workbench).registerWorkbenchContribution(s,w.Restored),f(x,h,u.Delayed),f(v,R,u.Delayed),I.registerCommand("_issues.getSystemStatus",t=>y.localize("statusUnsupported","The --status argument is not yet supported in browsers."));
