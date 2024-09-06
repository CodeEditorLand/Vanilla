var V=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var E=(e,o,t,a)=>{for(var u=a>1?void 0:a?_(o,t):o,v=e.length-1,p;v>=0;v--)(p=e[v])&&(u=(a?p(o,t,u):p(u))||u);return a&&u&&V(o,t,u),u},s=(e,o)=>(t,a)=>o(t,a,e);import{getZoomLevel as h}from"../../../../base/browser/browser.js";import{mainWindow as B}from"../../../../base/browser/window.js";import{ipcRenderer as b}from"../../../../base/parts/sandbox/electron-sandbox/globals.js";import{IMenuService as z,MenuId as G}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as q}from"../../../../platform/configuration/common/configuration.js";import{IContextKeyService as Z}from"../../../../platform/contextkey/common/contextkey.js";import{IExtensionManagementService as J}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{ExtensionIdentifier as R,ExtensionIdentifierSet as Q,ExtensionType as D}from"../../../../platform/extensions/common/extensions.js";import{InstantiationType as X,registerSingleton as Y}from"../../../../platform/instantiation/common/extensions.js";import{IIssueMainService as ee}from"../../../../platform/issue/common/issue.js";import{buttonBackground as C,buttonForeground as M,buttonHoverBackground as T,foreground as w,inputActiveOptionBorder as A,inputBackground as F,inputBorder as W,inputForeground as U,inputValidationErrorBackground as L,inputValidationErrorBorder as O,inputValidationErrorForeground as K,scrollbarSliderActiveBackground as j,scrollbarSliderBackground as re,scrollbarSliderHoverBackground as H,textLinkActiveForeground as P,textLinkForeground as $}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as ne}from"../../../../platform/theme/common/themeService.js";import{IWorkspaceTrustManagementService as oe}from"../../../../platform/workspace/common/workspaceTrust.js";import{SIDE_BAR_BACKGROUND as y}from"../../../common/theme.js";import{IWorkbenchAssignmentService as te}from"../../../services/assignment/common/assignmentService.js";import{IAuthenticationService as ie}from"../../../services/authentication/common/authentication.js";import{IWorkbenchExtensionEnablementService as se}from"../../../services/extensionManagement/common/extensionManagement.js";import{IIntegrityService as ae}from"../../../services/integrity/common/integrity.js";import{IIssueFormService as ue,IWorkbenchIssueService as ce}from"../common/issue.js";let I=class{constructor(o,t,a,u,v,p,S,f,c,k,g,m){this.issueMainService=o;this.issueFormService=t;this.themeService=a;this.extensionManagementService=u;this.extensionEnablementService=v;this.workspaceTrustManagementService=p;this.experimentService=S;this.authenticationService=f;this.integrityService=c;this.menuService=k;this.contextKeyService=g;this.configurationService=m;b.on("vscode:triggerReporterMenu",async(i,n)=>{const d=n.extensionId;this.menuService.getMenuActions(G.IssueReporter,this.contextKeyService,{renderShortTitle:!0}).flatMap(l=>l[1]).forEach(async l=>{try{l.item&&"source"in l.item&&l.item.source?.id===d&&(this.extensionIdentifierSet.add(d),await l.run())}catch(N){console.error(N)}}),this.extensionIdentifierSet.has(d)||b.send(`vscode:triggerReporterMenuResponse:${d}`,void 0)})}extensionIdentifierSet=new Q;async openReporter(o={}){const t=[],a=[],u=o;try{const m=(await this.extensionManagementService.getInstalled()).filter(i=>this.extensionEnablementService.isEnabled(i)||o.extensionId&&i.identifier.id===o.extensionId);t.push(...m.map(i=>{const{manifest:n}=i,d=n.contributes?Object.keys(n.contributes):[],x=!n.main&&!n.browser&&d.length===1&&d[0]==="themes",l=i.type===D.System;return{name:n.name,publisher:n.publisher,version:n.version,repositoryUrl:n.repository&&n.repository.url,bugsUrl:n.bugs&&n.bugs.url,displayName:n.displayName,id:i.identifier.id,data:o.data,uri:o.uri,isTheme:x,isBuiltin:l,extensionData:"Extensions data loading"}})),a.push(...m.map(i=>{const{manifest:n}=i,d=n.contributes?Object.keys(n.contributes):[],x=!n.main&&!n.browser&&d.length===1&&d[0]==="themes",l=i.type===D.System;return{name:n.name,publisher:n.publisher,version:n.version,repositoryUrl:n.repository&&n.repository.url,bugsUrl:n.bugs&&n.bugs.url,displayName:n.displayName,id:i.identifier.id,data:o.data,uri:o.uri,isTheme:x,isBuiltin:l,extensionData:"Extensions data loading"}}))}catch(g){t.push({name:"Workbench Issue Service",publisher:"Unknown",version:"0.0.0",repositoryUrl:void 0,bugsUrl:void 0,extensionData:"Extensions data loading",displayName:`Extensions not loaded: ${g}`,id:"workbench.issue",isTheme:!1,isBuiltin:!0}),a.push({name:"Workbench Issue Service",publisher:"Unknown",version:"0.0.0",repositoryUrl:void 0,bugsUrl:void 0,extensionData:"Extensions data loading",displayName:`Extensions not loaded: ${g}`,id:"workbench.issue",isTheme:!1,isBuiltin:!0})}const v=await this.experimentService.getCurrentExperiments();let p="";try{p=(await this.authenticationService.getSessions("github")).filter(i=>i.scopes.includes("repo"))[0]?.accessToken}catch{}let S=!1;try{S=!(await this.integrityService.isPure()).isPure}catch{}const f=this.themeService.getColorTheme(),c=Object.assign({styles:de(f),zoomLevel:h(B),enabledExtensions:t,experiments:v?.join(`
`),restrictedMode:!this.workspaceTrustManagementService.isWorkspaceTrusted(),isUnsupported:S,githubAccessToken:p},o),k=Object.assign({styles:le(f),zoomLevel:h(B),enabledExtensions:a,experiments:v?.join(`
`),restrictedMode:!this.workspaceTrustManagementService.isWorkspaceTrusted(),isUnsupported:S,githubAccessToken:p},u);return c.extensionId&&(t.some(m=>R.equals(m.id,c.extensionId))||console.error(`Extension with ID ${c.extensionId} does not exist.`)),c.extensionId&&this.extensionIdentifierSet.has(c.extensionId)&&(b.send(`vscode:triggerReporterMenuResponse:${c.extensionId}`,c),this.extensionIdentifierSet.delete(new R(c.extensionId))),this.configurationService.getValue("issueReporter.experimental.auxWindow")?this.issueFormService.openReporter(c):this.issueMainService.openReporter(k)}};I=E([s(0,ee),s(1,ue),s(2,ne),s(3,J),s(4,se),s(5,oe),s(6,te),s(7,ie),s(8,ae),s(9,z),s(10,Z),s(11,q)],I);function de(e){return{backgroundColor:r(e,y),color:r(e,w),textLinkColor:r(e,$),textLinkActiveForeground:r(e,P),inputBackground:r(e,F),inputForeground:r(e,U),inputBorder:r(e,W),inputActiveBorder:r(e,A),inputErrorBorder:r(e,O),inputErrorBackground:r(e,L),inputErrorForeground:r(e,K),buttonBackground:r(e,C),buttonForeground:r(e,M),buttonHoverBackground:r(e,T),sliderActiveColor:r(e,j),sliderBackgroundColor:r(e,y),sliderHoverColor:r(e,H)}}function le(e){return{backgroundColor:r(e,y),color:r(e,w),textLinkColor:r(e,$),textLinkActiveForeground:r(e,P),inputBackground:r(e,F),inputForeground:r(e,U),inputBorder:r(e,W),inputActiveBorder:r(e,A),inputErrorBorder:r(e,O),inputErrorBackground:r(e,L),inputErrorForeground:r(e,K),buttonBackground:r(e,C),buttonForeground:r(e,M),buttonHoverBackground:r(e,T),sliderActiveColor:r(e,j),sliderBackgroundColor:r(e,re),sliderHoverColor:r(e,H)}}function r(e,o){const t=e.getColor(o);return t?t.toString():void 0}Y(ce,I,X.Delayed);export{I as NativeIssueService,de as getIssueReporterStyles,le as oldGetIssueReporterStyles};
