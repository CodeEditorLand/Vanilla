var g=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var v=(c,a,s,n)=>{for(var t=n>1?void 0:n?y(a,s):a,r=c.length-1,i;r>=0;r--)(i=c[r])&&(t=(n?i(a,s,t):i(t))||t);return n&&t&&g(a,s,t),t},f=(c,a)=>(s,n)=>a(s,n,c);import{$ as e,reset as b}from"../../../../base/browser/dom.js";import{CancellationError as S}from"../../../../base/common/errors.js";import"../../../../base/common/product.js";import{URI as M}from"../../../../base/common/uri.js";import{localize as m}from"../../../../nls.js";import{isRemoteDiagnosticError as E}from"../../../../platform/diagnostics/common/diagnostics.js";import{IProcessMainService as w}from"../../../../platform/issue/common/issue.js";import{INativeHostService as T}from"../../../../platform/native/common/native.js";import{IThemeService as H}from"../../../../platform/theme/common/themeService.js";import{applyZoom as P}from"../../../../platform/window/electron-sandbox/window.js";import{BaseIssueReporterService as R}from"../browser/baseIssueReporterService.js";import"../browser/issueReporterModel.js";import{IIssueFormService as x,IssueType as I}from"../common/issue.js";const U=7500;let h=class extends R{constructor(s,n,t,r,i,o,l,p,d){super(s,n,t,r,i,!1,l,d);this.nativeHostService=o;this.processMainService=p,this.processMainService.$getSystemInfo().then(u=>{this.issueReporterModel.update({systemInfo:u}),this.receivedSystemInfo=!0,this.updateSystemInfo(this.issueReporterModel.getData()),this.updatePreviewButtonState()}),this.data.issueType===I.PerformanceIssue&&this.processMainService.$getPerformanceInfo().then(u=>{this.updatePerformanceInfo(u)}),this.setEventHandlers(),P(this.data.zoomLevel,this.window),this.updateExperimentsInfo(this.data.experiments),this.updateRestrictedMode(this.data.restrictedMode),this.updateUnsupportedMode(this.data.isUnsupported)}processMainService;setEventHandlers(){super.setEventHandlers(),this.addEventListener("issue-type","change",s=>{const n=parseInt(s.target.value);this.issueReporterModel.update({issueType:n}),n===I.PerformanceIssue&&!this.receivedPerformanceInfo&&this.processMainService.$getPerformanceInfo().then(r=>{this.updatePerformanceInfo(r)});const t=this.getElementById("issue-title");t&&(t.placeholder=m("undefinedPlaceholder","Please enter a title")),this.updatePreviewButtonState(),this.setSourceOptions(),this.render()})}async submitToGitHub(s,n,t){const r=`https://api.github.com/repos/${t.owner}/${t.repositoryName}/issues`,i={method:"POST",body:JSON.stringify({title:s,body:n}),headers:new Headers({"Content-Type":"application/json",Authorization:`Bearer ${this.data.githubAccessToken}`})},o=await fetch(r,i);if(!o.ok)return console.error("Invalid GitHub URL provided."),!1;const l=await o.json();return await this.nativeHostService.openExternal(l.html_url),this.close(),!0}async createIssue(){const s=this.issueReporterModel.getData().selectedExtension;if(this.nonGitHubIssueUrl){const d=this.getExtensionBugsUrl();if(d)return this.hasBeenSubmitted=!0,await this.nativeHostService.openExternal(d),!0}if(!this.validateInputs()){const d=this.window.document.getElementsByClassName("invalid-input");return d.length&&d[0].focus(),this.addEventListener("issue-title","input",u=>{this.validateInput("issue-title")}),this.addEventListener("description","input",u=>{this.validateInput("description")}),this.addEventListener("issue-source","change",u=>{this.validateInput("issue-source")}),this.issueReporterModel.fileOnExtension()&&this.addEventListener("extension-selector","change",u=>{this.validateInput("extension-selector"),this.validateInput("description")}),!1}this.hasBeenSubmitted=!0;const t=this.getElementById("issue-title").value,r=this.issueReporterModel.serialize();let i=this.getIssueUrl();if(!i)return console.error("No issue url found"),!1;s?.uri&&(i=M.revive(s.uri).toString());const o=this.parseGitHubUrl(i),l=this.getIssueUrlWithTitle(this.getElementById("issue-title").value,i);let p=l+`&body=${encodeURIComponent(r)}`;if(p.length>U)try{p=await this.writeToClipboard(l,r)}catch{return console.error("Writing to clipboard failed"),!1}else if(this.data.githubAccessToken&&o)return this.submitToGitHub(t,r,o);return await this.nativeHostService.openExternal(p),!0}async writeToClipboard(s,n){if(!await this.issueFormService.showClipboardDialog())throw new S;return await this.nativeHostService.writeClipboardText(n),s+`&body=${encodeURIComponent(m("pasteData","We have written the needed data into your clipboard because it was too large to send. Please paste."))}`}updateSystemInfo(s){const n=this.window.document.querySelector(".block-system .block-info");if(n){const t=s.systemInfo,r=e("table",void 0,e("tr",void 0,e("td",void 0,"CPUs"),e("td",void 0,t.cpus||"")),e("tr",void 0,e("td",void 0,"GPU Status"),e("td",void 0,Object.keys(t.gpuStatus).map(i=>`${i}: ${t.gpuStatus[i]}`).join(`
`))),e("tr",void 0,e("td",void 0,"Load (avg)"),e("td",void 0,t.load||"")),e("tr",void 0,e("td",void 0,"Memory (System)"),e("td",void 0,t.memory)),e("tr",void 0,e("td",void 0,"Process Argv"),e("td",void 0,t.processArgs)),e("tr",void 0,e("td",void 0,"Screen Reader"),e("td",void 0,t.screenReader)),e("tr",void 0,e("td",void 0,"VM"),e("td",void 0,t.vmHint)));b(n,r),t.remoteData.forEach(i=>{if(n.appendChild(e("hr")),E(i)){const o=e("table",void 0,e("tr",void 0,e("td",void 0,"Remote"),e("td",void 0,i.hostName)),e("tr",void 0,e("td",void 0,""),e("td",void 0,i.errorMessage)));n.appendChild(o)}else{const o=e("table",void 0,e("tr",void 0,e("td",void 0,"Remote"),e("td",void 0,i.latency?`${i.hostName} (latency: ${i.latency.current.toFixed(2)}ms last, ${i.latency.average.toFixed(2)}ms average)`:i.hostName)),e("tr",void 0,e("td",void 0,"OS"),e("td",void 0,i.machineInfo.os)),e("tr",void 0,e("td",void 0,"CPUs"),e("td",void 0,i.machineInfo.cpus||"")),e("tr",void 0,e("td",void 0,"Memory (System)"),e("td",void 0,i.machineInfo.memory)),e("tr",void 0,e("td",void 0,"VM"),e("td",void 0,i.machineInfo.vmHint)));n.appendChild(o)}})}}updateRestrictedMode(s){this.issueReporterModel.update({restrictedMode:s})}updateUnsupportedMode(s){this.issueReporterModel.update({isUnsupported:s})}updateExperimentsInfo(s){this.issueReporterModel.update({experimentInfo:s});const n=this.window.document.querySelector(".block-experiments .block-info");n&&(n.textContent=s||m("noCurrentExperiments","No current experiments."))}};h=v([f(5,T),f(6,x),f(7,w),f(8,H)],h);export{h as IssueReporter2};
