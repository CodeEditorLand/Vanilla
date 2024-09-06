var A=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var B=(b,I,e,t)=>{for(var s=t>1?void 0:t?G(I,e):I,i=b.length-1,n;i>=0;i--)(n=b[i])&&(s=(t?n(I,e,s):n(s))||s);return t&&s&&A(I,e,s),s},L=(b,I)=>(e,t)=>I(e,t,b);import{$ as c,createStyleSheet as q,isHTMLInputElement as N,isHTMLTextAreaElement as F,reset as E,windowOpenNoOpener as H}from"../../../../../vs/base/browser/dom.js";import{Button as V,unthemedButtonStyles as W}from"../../../../../vs/base/browser/ui/button/button.js";import{renderIcon as _}from"../../../../../vs/base/browser/ui/iconLabel/iconLabels.js";import{mainWindow as j}from"../../../../../vs/base/browser/window.js";import{Delayer as z,RunOnceScheduler as K}from"../../../../../vs/base/common/async.js";import{Codicon as R}from"../../../../../vs/base/common/codicons.js";import{groupBy as Q}from"../../../../../vs/base/common/collections.js";import{debounce as C}from"../../../../../vs/base/common/decorators.js";import{CancellationError as Y}from"../../../../../vs/base/common/errors.js";import{Disposable as J}from"../../../../../vs/base/common/lifecycle.js";import{isLinuxSnap as X,isMacintosh as O}from"../../../../../vs/base/common/platform.js";import"../../../../../vs/base/common/product.js";import{escape as Z}from"../../../../../vs/base/common/strings.js";import{ThemeIcon as U}from"../../../../../vs/base/common/themables.js";import{URI as D}from"../../../../../vs/base/common/uri.js";import{localize as a}from"../../../../../vs/nls.js";import"../../../../../vs/platform/issue/common/issue.js";import{getIconsStyleSheet as ee}from"../../../../../vs/platform/theme/browser/iconsStyleSheet.js";import{IThemeService as te}from"../../../../../vs/platform/theme/common/themeService.js";import{IssueReporterModel as se}from"../../../../../vs/workbench/contrib/issue/browser/issueReporterModel.js";import{IIssueFormService as ie,IssueType as f}from"../../../../../vs/workbench/contrib/issue/common/issue.js";import{normalizeGitHubUrl as P}from"../../../../../vs/workbench/contrib/issue/common/issueReporterUtil.js";const $=7500;var ne=(s=>(s.VSCode="vscode",s.Extension="extension",s.Marketplace="marketplace",s.Unknown="unknown",s))(ne||{});let S=class extends J{constructor(e,t,s,i,n,o,r,u){super();this.disableExtensions=e;this.data=t;this.os=s;this.product=i;this.window=n;this.isWeb=o;this.issueFormService=r;this.themeService=u;const d=t.extensionId?t.enabledExtensions.find(g=>g.id.toLocaleLowerCase()===t.extensionId?.toLocaleLowerCase()):void 0;this.issueReporterModel=new se({...t,issueType:t.issueType||f.Bug,versionInfo:{vscodeVersion:`${i.nameShort} ${i.darwinUniversalAssetId?`${i.version} (Universal)`:i.version} (${i.commit||"Commit unknown"}, ${i.date||"Date unknown"})`,os:`${this.os.type} ${this.os.arch} ${this.os.release}${X?" snap":""}`},extensionsDisabled:!!this.disableExtensions,fileOnExtension:t.extensionId?!d?.isBuiltin:void 0,selectedExtension:d});const p=t.issueSource==="marketplace",m=t.issueSource==="vscode";this.issueReporterModel.update({fileOnMarketplace:p,fileOnProduct:m});const x=this.getElementById("issue-reporter");if(x){this.previewButton=new V(x,W);const g=document.createElement("a");x.appendChild(g),g.id="show-repo-name",g.classList.add("hidden"),this.updatePreviewButtonState()}const y=t.issueTitle;if(y){const g=this.getElementById("issue-title");g&&(g.value=y)}const v=t.issueBody;if(v){const g=this.getElementById("description");g&&(g.value=v,this.issueReporterModel.update({issueDescription:v}))}this.window.document.documentElement.lang!=="en"&&l(this.getElementById("english"));const k=q();k.id="codiconStyles";const M=this._register(ee(this.themeService));function T(){k.textContent=M.getCSS()}const w=new K(T,0);M.onDidChange(()=>w.schedule()),w.schedule(),this.handleExtensionData(t.enabledExtensions),this.setUpTypes(),this.applyStyles(t.styles),(t.data||t.uri)&&d&&this.updateExtensionStatus(d)}issueReporterModel;receivedSystemInfo=!1;numberOfSearchResultsDisplayed=0;receivedPerformanceInfo=!1;shouldQueueSearch=!1;hasBeenSubmitted=!1;openReporter=!1;loadingExtensionData=!1;selectedExtension="";delayedSubmit=new z(300);previewButton;nonGitHubIssueUrl=!1;render(){this.renderBlocks()}setInitialFocus(){const{fileOnExtension:e}=this.issueReporterModel.getData();e?this.window.document.getElementById("issue-title")?.focus():this.window.document.getElementById("issue-type")?.focus()}applyStyles(e){const t=document.createElement("style"),s=[];e.inputBackground&&s.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { background-color: ${e.inputBackground} !important; }`),e.backgroundColor&&(s.push(`.monaco-workbench { background-color: ${e.backgroundColor} !important; }`),s.push(`.issue-reporter-body::-webkit-scrollbar-track { background-color: ${e.backgroundColor}; }`)),e.inputBorder?s.push(`input[type="text"], textarea, select { border: 1px solid ${e.inputBorder}; }`):s.push('input[type="text"], textarea, select { border: 1px solid transparent; }'),e.inputForeground&&s.push(`input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { color: ${e.inputForeground} !important; }`),e.inputErrorBorder&&(s.push(`.invalid-input, .invalid-input:focus, .validation-error { border: 1px solid ${e.inputErrorBorder} !important; }`),s.push(`.required-input { color: ${e.inputErrorBorder}; }`)),e.inputErrorBackground&&s.push(`.validation-error { background: ${e.inputErrorBackground}; }`),e.inputErrorForeground&&s.push(`.validation-error { color: ${e.inputErrorForeground}; }`),e.inputActiveBorder&&s.push(`input[type='text']:focus, textarea:focus, select:focus, summary:focus, button:focus, a:focus, .workbenchCommand:focus  { border: 1px solid ${e.inputActiveBorder}; outline-style: none; }`),e.textLinkColor&&s.push(`a, .workbenchCommand { color: ${e.textLinkColor}; }`),e.textLinkColor&&s.push(`a { color: ${e.textLinkColor}; }`),e.textLinkActiveForeground&&s.push(`a:hover, .workbenchCommand:hover { color: ${e.textLinkActiveForeground}; }`),e.sliderActiveColor&&s.push(`.issue-reporter-body::-webkit-scrollbar-thumb:active { background-color: ${e.sliderActiveColor}; }`),e.sliderHoverColor&&(s.push(`.issue-reporter-body::-webkit-scrollbar-thumb { background-color: ${e.sliderHoverColor}; }`),s.push(`.issue-reporter-body::--webkit-scrollbar-thumb:hover { background-color: ${e.sliderHoverColor}; }`)),e.buttonBackground&&s.push(`.monaco-text-button { background-color: ${e.buttonBackground} !important; }`),e.buttonForeground&&s.push(`.monaco-text-button { color: ${e.buttonForeground} !important; }`),e.buttonHoverBackground&&s.push(`.monaco-text-button:not(.disabled):hover, .monaco-text-button:focus { background-color: ${e.buttonHoverBackground} !important; }`),t.textContent=s.join(`
`),this.window.document.head.appendChild(t),this.window.document.body.style.color=e.color||""}async updateIssueReporterUri(e){try{if(e.uri){const t=D.revive(e.uri);e.bugsUrl=t.toString()}}catch{this.renderBlocks()}}handleExtensionData(e){const t=e.filter(o=>!o.isBuiltin),{nonThemes:s,themes:i}=Q(t,o=>o.isTheme?"themes":"nonThemes"),n=i&&i.length;this.issueReporterModel.update({numberOfThemeExtesions:n,enabledNonThemeExtesions:s,allExtensions:t}),this.updateExtensionTable(s,n),(this.disableExtensions||t.length===0)&&(this.getElementById("disableExtensions").disabled=!0),this.updateExtensionSelector(t)}updateExtensionSelector(e){const t=e.map(n=>({name:n.displayName||n.name||"",id:n.id}));t.sort((n,o)=>{const r=n.name.toLowerCase(),u=o.name.toLowerCase();return r>u?1:r<u?-1:0});const s=(n,o)=>{const r=o&&n.id===o.id;return c("option",{value:n.id,selected:r||""},n.name)},i=this.getElementById("extension-selector");if(i){const{selectedExtension:n}=this.issueReporterModel.getData();E(i,this.makeOption("",a("selectExtension","Select extension"),!0),...t.map(o=>s(o,n))),n||(i.selectedIndex=0),this.addEventListener("extension-selector","change",async o=>{this.clearExtensionData();const r=o.target.value;this.selectedExtension=r;const d=this.issueReporterModel.getData().allExtensions.filter(p=>p.id===r);if(d.length){this.issueReporterModel.update({selectedExtension:d[0]});const p=this.issueReporterModel.getData().selectedExtension;if(p){const m=document.createElement("span");m.classList.add(...U.asClassNameArray(R.loading),"codicon-modifier-spin"),this.setLoading(m);const x=await this.sendReporterMenu(p);x?this.selectedExtension===r&&(this.removeLoading(m,!0),this.data=x):(this.loadingExtensionData||m.classList.remove(...U.asClassNameArray(R.loading),"codicon-modifier-spin"),this.removeLoading(m),this.clearExtensionData(),p.data=void 0,p.uri=void 0),this.selectedExtension===r&&(this.updateExtensionStatus(d[0]),this.openReporter=!1)}else this.issueReporterModel.update({selectedExtension:void 0}),this.clearSearchResults(),this.clearExtensionData(),this.validateSelectedExtension(),this.updateExtensionStatus(d[0])}})}this.addEventListener("problem-source","change",n=>{this.clearExtensionData(),this.validateSelectedExtension()})}async sendReporterMenu(e){try{return await this.issueFormService.sendReporterMenu(e.id)}catch(t){console.error(t);return}}setEventHandlers(){["includeSystemInfo","includeProcessInfo","includeWorkspaceInfo","includeExtensions","includeExperiments","includeExtensionData"].forEach(t=>{this.addEventListener(t,"click",s=>{s.stopPropagation(),this.issueReporterModel.update({[t]:!this.issueReporterModel.getData()[t]})})});const e=this.window.document.getElementsByClassName("showInfo");for(let t=0;t<e.length;t++)e.item(t).addEventListener("click",i=>{i.preventDefault();const n=i.target;if(n){const o=n.parentElement&&n.parentElement.parentElement,r=o&&o.lastElementChild;r&&r.classList.contains("hidden")?(l(r),n.textContent=a("hide","hide")):(h(r),n.textContent=a("show","show"))}});this.addEventListener("issue-source","change",t=>{const s=t.target.value,i=this.getElementById("problem-source-help-text");if(s===""){this.issueReporterModel.update({fileOnExtension:void 0}),l(i),this.clearSearchResults(),this.render();return}else h(i);const n=this.getElementById("issue-title");s==="vscode"?n.placeholder=a("vscodePlaceholder","E.g Workbench is missing problems panel"):s==="extension"?n.placeholder=a("extensionPlaceholder","E.g. Missing alt text on extension readme image"):s==="marketplace"?n.placeholder=a("marketplacePlaceholder","E.g Cannot disable installed extension"):n.placeholder=a("undefinedPlaceholder","Please enter a title");let o,r=!1;s==="extension"?o=!0:s==="marketplace"&&(r=!0),this.issueReporterModel.update({fileOnExtension:o,fileOnMarketplace:r}),this.render();const u=this.getElementById("issue-title").value;this.searchIssues(u,o,r)}),this.addEventListener("description","input",t=>{const s=t.target.value;if(this.issueReporterModel.update({issueDescription:s}),this.issueReporterModel.fileOnExtension()===!1){const i=this.getElementById("issue-title").value;this.searchVSCodeIssues(i,s)}}),this.addEventListener("issue-title","input",t=>{const s=this.getElementById("issue-title");if(s){const i=s.value;this.issueReporterModel.update({issueTitle:i})}}),this.addEventListener("issue-title","input",t=>{const s=t.target.value,i=this.getElementById("issue-title-length-validation-error"),n=this.getIssueUrl();s&&this.getIssueUrlWithTitle(s,n).length>$?l(i):h(i);const o=this.getElementById("issue-source");if(!o||o.value==="")return;const{fileOnExtension:r,fileOnMarketplace:u}=this.issueReporterModel.getData();this.searchIssues(s,r,u)}),this.previewButton.onDidClick(async()=>{this.delayedSubmit.trigger(async()=>{this.createIssue()})}),this.addEventListener("disableExtensions","click",()=>{this.issueFormService.reloadWithExtensionsDisabled()}),this.addEventListener("extensionBugsLink","click",t=>{const s=t.target.innerText;H(s)}),this.addEventListener("disableExtensions","keydown",t=>{t.stopPropagation(),(t.key==="Enter"||t.key===" ")&&this.issueFormService.reloadWithExtensionsDisabled()}),this.window.document.onkeydown=async t=>{const s=O?t.metaKey:t.ctrlKey;if(s&&t.key==="Enter"&&this.delayedSubmit.trigger(async()=>{await this.createIssue()&&this.close()}),s&&t.key==="w"){t.stopPropagation(),t.preventDefault();const i=this.getElementById("issue-title").value,{issueDescription:n}=this.issueReporterModel.getData();!this.hasBeenSubmitted&&(i||n)?this.issueFormService.showConfirmCloseDialog():this.close()}O&&s&&t.key==="a"&&t.target&&(N(t.target)||F(t.target))&&t.target.select()}}updatePerformanceInfo(e){this.issueReporterModel.update(e),this.receivedPerformanceInfo=!0;const t=this.issueReporterModel.getData();this.updateProcessInfo(t),this.updateWorkspaceInfo(t),this.updatePreviewButtonState()}updatePreviewButtonState(){this.isPreviewEnabled()?(this.data.githubAccessToken?this.previewButton.label=a("createOnGitHub","Create on GitHub"):this.previewButton.label=a("previewOnGitHub","Preview on GitHub"),this.previewButton.enabled=!0):(this.previewButton.enabled=!1,this.previewButton.label=a("loadingData","Loading data..."));const e=this.getElementById("show-repo-name"),t=this.issueReporterModel.getData().selectedExtension;if(t&&t.uri){const s=D.revive(t.uri).toString();e.href=s,e.addEventListener("click",n=>this.openLink(n)),e.addEventListener("auxclick",n=>this.openLink(n));const i=this.parseGitHubUrl(s);e.textContent=i?i.owner+"/"+i.repositoryName:s,Object.assign(e.style,{alignSelf:"flex-end",display:"block",fontSize:"13px",marginBottom:"10px",padding:"4px 0px",textDecoration:"none",width:"auto"}),l(e)}else e.removeAttribute("style"),h(e);this.getExtensionGitHubUrl()}isPreviewEnabled(){const e=this.issueReporterModel.getData().issueType;if(this.loadingExtensionData)return!1;if(this.isWeb){if(e===f.FeatureRequest||e===f.PerformanceIssue||e===f.Bug)return!0}else if(e===f.Bug&&this.receivedSystemInfo||e===f.PerformanceIssue&&this.receivedSystemInfo&&this.receivedPerformanceInfo||e===f.FeatureRequest)return!0;return!1}getExtensionRepositoryUrl(){const e=this.issueReporterModel.getData().selectedExtension;return e&&e.repositoryUrl}getExtensionBugsUrl(){const e=this.issueReporterModel.getData().selectedExtension;return e&&e.bugsUrl}searchVSCodeIssues(e,t){e?this.searchDuplicates(e,t):this.clearSearchResults()}searchIssues(e,t,s){if(t)return this.searchExtensionIssues(e);if(s)return this.searchMarketplaceIssues(e);const i=this.issueReporterModel.getData().issueDescription;this.searchVSCodeIssues(e,i)}searchExtensionIssues(e){const t=this.getExtensionGitHubUrl();if(e){const s=/^https?:\/\/github\.com\/(.*)/.exec(t);if(s&&s.length){const i=s[1];return this.searchGitHub(i,e)}if(this.issueReporterModel.getData().selectedExtension)return this.clearSearchResults(),this.displaySearchResults([])}this.clearSearchResults()}searchMarketplaceIssues(e){if(e){const t=this.parseGitHubUrl(this.product.reportMarketplaceIssueUrl);if(t)return this.searchGitHub(`${t.owner}/${t.repositoryName}`,e)}}async close(){await this.issueFormService.closeReporter()}clearSearchResults(){const e=this.getElementById("similar-issues");e.innerText="",this.numberOfSearchResultsDisplayed=0}searchGitHub(e,t){const s=`is:issue+repo:${e}+${t}`,i=this.getElementById("similar-issues");fetch(`https://api.github.com/search/issues?q=${s}`).then(n=>{n.json().then(o=>{if(i.innerText="",o&&o.items)this.displaySearchResults(o.items);else{const r=c("div.list-title");r.textContent=a("rateLimited","GitHub query limit exceeded. Please wait."),i.appendChild(r);const u=n.headers.get("X-RateLimit-Reset"),d=u?parseInt(u)-Math.floor(Date.now()/1e3):1;this.shouldQueueSearch&&(this.shouldQueueSearch=!1,setTimeout(()=>{this.searchGitHub(e,t),this.shouldQueueSearch=!0},d*1e3))}}).catch(o=>{console.warn("Timeout or query limit exceeded")})}).catch(n=>{console.warn("Error fetching GitHub issues")})}searchDuplicates(e,t){const s="https://vscode-probot.westus.cloudapp.azure.com:7890/duplicate_candidates",i={method:"POST",body:JSON.stringify({title:e,body:t}),headers:new Headers({"Content-Type":"application/json"})};fetch(s,i).then(n=>{n.json().then(o=>{if(this.clearSearchResults(),o&&o.candidates)this.displaySearchResults(o.candidates);else throw new Error("Unexpected response, no candidates property")}).catch(o=>{})}).catch(n=>{})}displaySearchResults(e){const t=this.getElementById("similar-issues");if(e.length){const s=c("div.issues-container"),i=c("div.list-title");i.textContent=a("similarIssues","Similar issues"),this.numberOfSearchResultsDisplayed=e.length<5?e.length:5;for(let n=0;n<this.numberOfSearchResultsDisplayed;n++){const o=e[n],r=c("a.issue-link",{href:o.html_url});r.textContent=o.title,r.title=o.title,r.addEventListener("click",p=>this.openLink(p)),r.addEventListener("auxclick",p=>this.openLink(p));let u,d;if(o.state){u=c("span.issue-state");const p=c("span.issue-icon");p.appendChild(_(o.state==="open"?R.issueOpened:R.issueClosed));const m=c("span.issue-state.label");m.textContent=o.state==="open"?a("open","Open"):a("closed","Closed"),u.title=o.state==="open"?a("open","Open"):a("closed","Closed"),u.appendChild(p),u.appendChild(m),d=c("div.issue",void 0,u,r)}else d=c("div.issue",void 0,r);s.appendChild(d)}t.appendChild(i),t.appendChild(s)}else{const s=c("div.list-title");s.textContent=a("noSimilarIssues","No similar issues found"),t.appendChild(s)}}setUpTypes(){const e=(i,n)=>c("option",{value:i.valueOf()},Z(n)),t=this.getElementById("issue-type"),{issueType:s}=this.issueReporterModel.getData();E(t,e(f.Bug,a("bugReporter","Bug Report")),e(f.FeatureRequest,a("featureRequest","Feature Request")),e(f.PerformanceIssue,a("performanceIssue","Performance Issue (freeze, slow, crash)"))),t.value=s.toString(),this.setSourceOptions()}makeOption(e,t,s){const i=document.createElement("option");return i.disabled=s,i.value=e,i.textContent=t,i}setSourceOptions(){const e=this.getElementById("issue-source"),{issueType:t,fileOnExtension:s,selectedExtension:i,fileOnMarketplace:n,fileOnProduct:o}=this.issueReporterModel.getData();let r=e.selectedIndex;r===-1&&(s!==void 0?r=s?2:1:i?.isBuiltin?r=1:n?r=3:o&&(r=1)),e.innerText="",e.append(this.makeOption("",a("selectSource","Select source"),!0)),e.append(this.makeOption("vscode",a("vscode","Visual Studio Code"),!1)),e.append(this.makeOption("extension",a("extension","A VS Code extension"),!1)),this.product.reportMarketplaceIssueUrl&&e.append(this.makeOption("marketplace",a("marketplace","Extensions Marketplace"),!1)),t!==f.FeatureRequest&&e.append(this.makeOption("unknown",a("unknown","Don't know"),!1)),r!==-1&&r<e.options.length?e.selectedIndex=r:(e.selectedIndex=0,h(this.getElementById("problem-source-help-text")))}renderBlocks(){const{issueType:e,fileOnExtension:t,fileOnMarketplace:s,selectedExtension:i}=this.issueReporterModel.getData(),n=this.getElementById("block-container"),o=this.window.document.querySelector(".block-system"),r=this.window.document.querySelector(".block-process"),u=this.window.document.querySelector(".block-workspace"),d=this.window.document.querySelector(".block-extensions"),p=this.window.document.querySelector(".block-experiments"),m=this.window.document.querySelector(".block-extension-data"),x=this.getElementById("problem-source"),y=this.getElementById("issue-description-label"),v=this.getElementById("issue-description-subtitle"),k=this.getElementById("extension-selection"),M=this.getElementById("issue-title-container"),T=this.getElementById("description"),w=this.getElementById("extension-data");if(h(n),h(o),h(r),h(u),h(d),h(p),h(k),h(w),h(m),l(x),l(M),l(T),t&&l(k),i&&this.nonGitHubIssueUrl){h(M),h(T),E(y,a("handlesIssuesElsewhere","This extension handles issues outside of VS Code")),E(v,a("elsewhereDescription","The '{0}' extension prefers to use an external issue reporter. To be taken to that issue reporting experience, click the button below.",i.displayName)),this.previewButton.label=a("openIssueReporter","Open External Issue Reporter");return}if(t&&i?.data){const g=i?.data;w.innerText=g.toString(),w.readOnly=!0,l(m)}t&&this.openReporter&&(w.readOnly=!0,setTimeout(()=>{this.openReporter&&l(m)},100),l(m)),e===f.Bug?(s||(l(n),l(o),l(p),t||l(d)),E(y,a("stepsToReproduce","Steps to Reproduce")+" ",c("span.required-input",void 0,"*")),E(v,a("bugDescription","Share the steps needed to reliably reproduce the problem. Please include actual and expected results. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."))):e===f.PerformanceIssue?(s||(l(n),l(o),l(r),l(u),l(p)),t?l(k):s||l(d),E(y,a("stepsToReproduce","Steps to Reproduce")+" ",c("span.required-input",void 0,"*")),E(v,a("performanceIssueDesciption","When did this performance issue happen? Does it occur on startup or after a specific series of actions? We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."))):e===f.FeatureRequest&&(E(y,a("description","Description")+" ",c("span.required-input",void 0,"*")),E(v,a("featureRequestDescription","Please describe the feature you would like to see. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub.")))}validateInput(e){const t=this.getElementById(e),s=this.getElementById(`${e}-empty-error`),i=this.getElementById("description-short-error");return e==="description"&&this.nonGitHubIssueUrl&&this.data.extensionId?!0:t.value?e==="description"&&t.value.length<10?(t.classList.add("invalid-input"),i?.classList.remove("hidden"),s?.classList.add("hidden"),!1):(t.classList.remove("invalid-input"),s?.classList.add("hidden"),e==="description"&&i?.classList.add("hidden"),!0):(t.classList.add("invalid-input"),s?.classList.remove("hidden"),i?.classList.add("hidden"),!1)}validateInputs(){let e=!0;return["issue-title","description","issue-source"].forEach(t=>{e=this.validateInput(t)&&e}),this.issueReporterModel.fileOnExtension()&&(e=this.validateInput("extension-selector")&&e),e}async submitToGitHub(e,t,s){const i=`https://api.github.com/repos/${s.owner}/${s.repositoryName}/issues`,n={method:"POST",body:JSON.stringify({title:e,body:t}),headers:new Headers({"Content-Type":"application/json",Authorization:`Bearer ${this.data.githubAccessToken}`,"User-Agent":"request"})},o=await fetch(i,n);if(!o.ok)return console.error("Invalid GitHub URL provided."),!1;const r=await o.json();return j.open(r.html_url,"_blank"),this.close(),!0}async createIssue(){const e=this.issueReporterModel.getData().selectedExtension;if(this.nonGitHubIssueUrl&&this.getExtensionBugsUrl())return this.hasBeenSubmitted=!0,!0;if(!this.validateInputs()){const d=this.window.document.getElementsByClassName("invalid-input");return d.length&&d[0].focus(),this.addEventListener("issue-title","input",p=>{this.validateInput("issue-title")}),this.addEventListener("description","input",p=>{this.validateInput("description")}),this.addEventListener("issue-source","change",p=>{this.validateInput("issue-source")}),this.issueReporterModel.fileOnExtension()&&this.addEventListener("extension-selector","change",p=>{this.validateInput("extension-selector")}),!1}this.hasBeenSubmitted=!0;const s=this.getElementById("issue-title").value,i=this.issueReporterModel.serialize();let n=this.getIssueUrl();if(!n)return console.error("No issue url found"),!1;e?.uri&&(n=D.revive(e.uri).toString());const o=this.parseGitHubUrl(n);if(this.data.githubAccessToken&&o)return this.submitToGitHub(s,i,o);const r=this.getIssueUrlWithTitle(this.getElementById("issue-title").value,n);let u=r+`&body=${encodeURIComponent(i)}`;if(u.length>$)try{u=await this.writeToClipboard(r,i)}catch{return console.error("Writing to clipboard failed"),!1}return this.window.open(u,"_blank"),!0}async writeToClipboard(e,t){if(!await this.issueFormService.showClipboardDialog())throw new Y;return e+`&body=${encodeURIComponent(a("pasteData","We have written the needed data into your clipboard because it was too large to send. Please paste."))}`}getIssueUrl(){return this.issueReporterModel.fileOnExtension()?this.getExtensionGitHubUrl():this.issueReporterModel.getData().fileOnMarketplace?this.product.reportMarketplaceIssueUrl:this.product.reportIssueUrl}parseGitHubUrl(e){const t=/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*).*/.exec(e);if(t&&t.length)return{owner:t[1],repositoryName:t[2]};console.error("No GitHub issues match")}getExtensionGitHubUrl(){let e="";const t=this.getExtensionBugsUrl(),s=this.getExtensionRepositoryUrl();return t&&t.match(/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*)\/?(\/issues)?$/)?e=P(t):s&&s.match(/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*)$/)?e=P(s):(this.nonGitHubIssueUrl=!0,e=t||s||""),e}getIssueUrlWithTitle(e,t){this.issueReporterModel.fileOnExtension()&&(t=t+"/issues/new");const s=t.indexOf("?")===-1?"?":"&";return`${t}${s}title=${encodeURIComponent(e)}`}clearExtensionData(){this.nonGitHubIssueUrl=!1,this.issueReporterModel.update({extensionData:void 0}),this.data.issueBody=this.data.issueBody||"",this.data.data=void 0,this.data.uri=void 0}async updateExtensionStatus(e){this.issueReporterModel.update({selectedExtension:e});const t=this.data.issueBody;if(t){const o=this.getElementById("description"),r=o.value;if(r===""||!r.includes(t.toString())){const u=r+(r===""?"":`
`)+t.toString();o.value=u,this.issueReporterModel.update({issueDescription:u})}}const s=this.data.data;if(s){this.issueReporterModel.update({extensionData:s}),e.data=s;const o=this.window.document.querySelector(".block-extension-data");l(o),this.renderBlocks()}const i=this.data.uri;i&&(e.uri=i,this.updateIssueReporterUri(e)),this.validateSelectedExtension();const n=this.getElementById("issue-title").value;this.searchExtensionIssues(n),this.updatePreviewButtonState(),this.renderBlocks()}validateSelectedExtension(){const e=this.getElementById("extension-selection-validation-error"),t=this.getElementById("extension-selection-validation-error-no-url");if(h(e),h(t),!this.issueReporterModel.getData().selectedExtension){this.previewButton.enabled=!0;return}if(this.loadingExtensionData)return;this.getExtensionGitHubUrl()?this.previewButton.enabled=!0:(this.setExtensionValidationMessage(),this.previewButton.enabled=!1)}setLoading(e){this.openReporter=!0,this.loadingExtensionData=!0,this.updatePreviewButtonState();const t=this.getElementById("extension-id");h(t),Array.from(this.window.document.querySelectorAll(".ext-parens")).forEach(n=>h(n));const i=this.getElementById("ext-loading");for(l(i);i.firstChild;)i.firstChild.remove();i.append(e),this.renderBlocks()}removeLoading(e,t=!1){this.openReporter=t,this.loadingExtensionData=!1,this.updatePreviewButtonState();const s=this.getElementById("extension-id");l(s),Array.from(this.window.document.querySelectorAll(".ext-parens")).forEach(o=>l(o));const n=this.getElementById("ext-loading");h(n),n.firstChild&&e.remove(),this.renderBlocks()}setExtensionValidationMessage(){const e=this.getElementById("extension-selection-validation-error"),t=this.getElementById("extension-selection-validation-error-no-url"),s=this.getExtensionBugsUrl();if(s){l(e);const n=this.getElementById("extensionBugsLink");n.textContent=s;return}const i=this.getExtensionRepositoryUrl();if(i){l(e);const n=this.getElementById("extensionBugsLink");n.textContent=i;return}l(t)}updateProcessInfo(e){const t=this.window.document.querySelector(".block-process .block-info");t&&E(t,c("code",void 0,e.processInfo??""))}updateWorkspaceInfo(e){this.window.document.querySelector(".block-workspace .block-info code").textContent=`
`+e.workspaceInfo}updateExtensionTable(e,t){const s=this.window.document.querySelector(".block-extensions .block-info");if(s){if(this.disableExtensions){E(s,a("disabledExtensions","Extensions are disabled"));return}const i=t?`
(${t} theme extensions excluded)`:"";if(e=e||[],!e.length){s.innerText="Extensions: none"+i;return}E(s,this.getExtensionTableHtml(e),document.createTextNode(i))}}getExtensionTableHtml(e){return c("table",void 0,c("tr",void 0,c("th",void 0,"Extension"),c("th",void 0,"Author (truncated)"),c("th",void 0,"Version")),...e.map(t=>c("tr",void 0,c("td",void 0,t.name),c("td",void 0,t.publisher?.substr(0,3)??"N/A"),c("td",void 0,t.version))))}openLink(e){e.preventDefault(),e.stopPropagation(),e.which<3&&H(e.target.href)}getElementById(e){const t=this.window.document.getElementById(e);if(t)return t}addEventListener(e,t,s){this.getElementById(e)?.addEventListener(t,s)}};B([C(300)],S.prototype,"searchGitHub",1),B([C(300)],S.prototype,"searchDuplicates",1),S=B([L(6,ie),L(7,te)],S);function h(b){b?.classList.add("hidden")}function l(b){b?.classList.remove("hidden")}export{S as BaseIssueReporterService,h as hide,l as show};
