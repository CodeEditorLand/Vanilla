import"../../../../../vs/base/common/uri.js";import"../../../../../vs/base/parts/sandbox/common/sandboxTypes.js";import{createDecorator as r}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/platform/issue/common/issue.js";var o=(e=>(e[e.Bug=0]="Bug",e[e.PerformanceIssue=1]="PerformanceIssue",e[e.FeatureRequest=2]="FeatureRequest",e))(o||{}),t=(e=>(e.VSCode="vscode",e.Extension="extension",e.Marketplace="marketplace",e))(t||{});const g=r("issueFormService"),u=r("workbenchIssueService"),p=r("workbenchProcessService");export{g as IIssueFormService,u as IWorkbenchIssueService,p as IWorkbenchProcessService,t as IssueSource,o as IssueType};
