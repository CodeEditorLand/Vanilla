import"../../../../vs/base/common/event.js";import"../../../../vs/base/common/lifecycle.js";import"../../../../vs/base/common/uri.js";import{createDecorator as t}from"../../../../vs/platform/instantiation/common/instantiation.js";var o=(r=>(r[r.Local=0]="Local",r[r.Remote=1]="Remote",r))(o||{});const l=t("workspaceTrustEnablementService"),T=t("workspaceTrustManagementService");var s=(e=>(e[e.Open=1]="Open",e[e.OpenInNewWindow=2]="OpenInNewWindow",e[e.Cancel=3]="Cancel",e))(s||{});const v=t("workspaceTrustRequestService");export{l as IWorkspaceTrustEnablementService,T as IWorkspaceTrustManagementService,v as IWorkspaceTrustRequestService,o as WorkspaceTrustScope,s as WorkspaceTrustUriResponse};
