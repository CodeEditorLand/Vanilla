var N=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var w=(u,e,t,r)=>{for(var i=r>1?void 0:r?W(e,t):e,a=u.length-1,c;a>=0;a--)(c=u[a])&&(i=(r?c(e,t,i):c(i))||i);return r&&i&&N(e,t,i),i},o=(u,e)=>(t,r)=>e(t,r,u);import"vs/css!./media/releasenoteseditor";import{CancellationToken as P}from"../../../../../vs/base/common/cancellation.js";import{onUnexpectedError as T}from"../../../../../vs/base/common/errors.js";import{escapeMarkdownSyntaxTokens as x}from"../../../../../vs/base/common/htmlContent.js";import{KeybindingParser as $}from"../../../../../vs/base/common/keybindingParser.js";import{DisposableStore as _}from"../../../../../vs/base/common/lifecycle.js";import{marked as L}from"vs/base/common/marked/marked";import{Schemas as R}from"../../../../../vs/base/common/network.js";import{escape as D}from"../../../../../vs/base/common/strings.js";import{URI as k}from"../../../../../vs/base/common/uri.js";import{generateUuid as U}from"../../../../../vs/base/common/uuid.js";import{ICodeEditorService as z}from"../../../../../vs/editor/browser/services/codeEditorService.js";import{TokenizationRegistry as C}from"../../../../../vs/editor/common/languages.js";import{ILanguageService as q}from"../../../../../vs/editor/common/languages/language.js";import{generateTokensCSSForColorMap as A}from"../../../../../vs/editor/common/languages/supports/tokenization.js";import*as y from"../../../../../vs/nls.js";import{IConfigurationService as M}from"../../../../../vs/platform/configuration/common/configuration.js";import{IEnvironmentService as G}from"../../../../../vs/platform/environment/common/environment.js";import{IInstantiationService as K}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as O}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{IOpenerService as B}from"../../../../../vs/platform/opener/common/opener.js";import{IProductService as H}from"../../../../../vs/platform/product/common/productService.js";import{asTextOrError as V,IRequestService as F}from"../../../../../vs/platform/request/common/request.js";import{TelemetryLevel as Y}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{getTelemetryLevel as X,supportsTelemetry as j}from"../../../../../vs/platform/telemetry/common/telemetryUtils.js";import{DEFAULT_MARKDOWN_STYLES as J,renderMarkdownDocument as Q}from"../../../../../vs/workbench/contrib/markdown/browser/markdownDocumentRenderer.js";import{SimpleSettingRenderer as Z}from"../../../../../vs/workbench/contrib/markdown/browser/markdownSettingRenderer.js";import"../../../../../vs/workbench/contrib/webviewPanel/browser/webviewEditorInput.js";import{IWebviewWorkbenchService as ee}from"../../../../../vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService.js";import{IEditorGroupsService as te}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as re,IEditorService as ie}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{IExtensionService as oe}from"../../../../../vs/workbench/services/extensions/common/extensions.js";let f=class{constructor(e,t,r,i,a,c,d,l,m,g,p,h,b){this._environmentService=e;this._keybindingService=t;this._languageService=r;this._openerService=i;this._requestService=a;this._configurationService=c;this._editorService=d;this._editorGroupService=l;this._codeEditorService=m;this._webviewWorkbenchService=g;this._extensionService=p;this._productService=h;this._instantiationService=b;C.onDidChange(()=>this.updateHtml()),c.onDidChangeConfiguration(this.onDidChangeConfiguration,this,this.disposables),g.onDidChangeActiveWebviewEditor(this.onDidChangeActiveWebviewEditor,this,this.disposables),this._simpleSettingRenderer=this._instantiationService.createInstance(Z)}_simpleSettingRenderer;_releaseNotesCache=new Map;_currentReleaseNotes=void 0;_lastText;disposables=new _;async updateHtml(){if(!this._currentReleaseNotes||!this._lastText)return;const e=await this.renderBody(this._lastText);this._currentReleaseNotes&&this._currentReleaseNotes.webview.setHtml(e)}async show(e,t){const r=await this.loadReleaseNotes(e,t);this._lastText=r;const i=await this.renderBody(r),a=y.localize("releaseNotesInputName","Release Notes: {0}",e),c=this._editorService.activeEditorPane;if(this._currentReleaseNotes)this._currentReleaseNotes.setName(a),this._currentReleaseNotes.webview.setHtml(i),this._webviewWorkbenchService.revealWebview(this._currentReleaseNotes,c?c.group:this._editorGroupService.activeGroup,!1);else{this._currentReleaseNotes=this._webviewWorkbenchService.openWebview({title:a,options:{tryRestoreScrollPosition:!0,enableFindWidget:!0,disableServiceWorker:!0},contentOptions:{localResourceRoots:[],allowScripts:!0},extension:void 0},"releaseNotes",a,{group:re,preserveFocus:!1}),this._currentReleaseNotes.webview.onDidClickLink(l=>this.onDidClickLink(k.parse(l)));const d=new _;d.add(this._currentReleaseNotes.webview.onMessage(l=>{if(l.message.type==="showReleaseNotes")this._configurationService.updateValue("update.showReleaseNotes",l.message.value);else if(l.message.type==="clickSetting"){const m=this._currentReleaseNotes?.webview.container.offsetLeft+l.message.value.x,g=this._currentReleaseNotes?.webview.container.offsetTop+l.message.value.y;this._simpleSettingRenderer.updateSetting(k.parse(l.message.value.uri),m,g)}})),d.add(this._currentReleaseNotes.onWillDispose(()=>{d.dispose(),this._currentReleaseNotes=void 0})),this._currentReleaseNotes.webview.setHtml(i)}return!0}async loadReleaseNotes(e,t){const r=/^(\d+\.\d+)\./.exec(e);if(!r)throw new Error("not found");const c=`https://code.visualstudio.com/raw/v${r[1].replace(/\./g,"_")}.md`,d=y.localize("unassigned","unassigned"),l=p=>D(p).replace(/\\/g,"\\\\"),m=p=>{const h=(v,n)=>{const s=this._keybindingService.lookupKeybinding(n);return s&&s.getLabel()||d},b=(v,n)=>{const s=$.parseKeybinding(n);if(!s)return d;const S=this._keybindingService.resolveKeybinding(s);return S.length===0?d:S[0].getLabel()||d},E=(v,n)=>{const s=h(v,n);return s&&`<code title="${n}">${l(s)}</code>`},I=(v,n)=>{const s=b(v,n);return s&&`<code title="${n}">${l(s)}</code>`};return p.replace(/`kb\(([a-z.\d\-]+)\)`/gi,E).replace(/`kbstyle\(([^\)]+)\)`/gi,I).replace(/kb\(([a-z.\d\-]+)\)/gi,(v,n)=>x(h(v,n))).replace(/kbstyle\(([^\)]+)\)/gi,(v,n)=>x(b(v,n)))},g=async()=>{let p;try{if(t){const h=this._codeEditorService.getActiveCodeEditor()?.getModel()?.getValue();p=h?h.substring(h.indexOf("#")):void 0}else p=await V(await this._requestService.request({url:c},P.None))}catch{throw new Error("Failed to fetch release notes")}if(!p||!/^#\s/.test(p)&&!t)throw new Error("Invalid release notes");return m(p)};return t?g():(this._releaseNotesCache.has(e)||this._releaseNotesCache.set(e,(async()=>{try{return await g()}catch(p){throw this._releaseNotesCache.delete(e),p}})()),this._releaseNotesCache.get(e))}async onDidClickLink(e){e.scheme===R.codeSetting||this.addGAParameters(e,"ReleaseNotes").then(t=>this._openerService.open(t,{allowCommands:["workbench.action.openSettings"]})).then(void 0,T)}async addGAParameters(e,t,r="1"){return j(this._productService,this._environmentService)&&X(this._configurationService)===Y.USAGE&&e.scheme==="https"&&e.authority==="code.visualstudio.com"?e.with({query:`${e.query?e.query+"&":""}utm_source=VsCode&utm_medium=${encodeURIComponent(t)}&utm_content=${encodeURIComponent(r)}`}):e}async renderBody(e){const t=U(),r=new L.Renderer;r.html=this._simpleSettingRenderer.getHtmlRenderer();const i=await Q(e,this._extensionService,this._languageService,{shouldSanitize:!1,renderer:r}),a=C.getColorMap(),c=a?A(a):"",d=!!this._configurationService.getValue("update.showReleaseNotes");return`<!DOCTYPE html>
		<html>
			<head>
				<base href="https://code.visualstudio.com/raw/">
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; style-src 'nonce-${t}' https://code.visualstudio.com; script-src 'nonce-${t}';">
				<style nonce="${t}">
					${J}
					${c}

					/* codesetting */

					code:has(.codesetting)+code {
						display: none;
					}

					code:has(.codesetting) {
						background-color: var(--vscode-textPreformat-background);
						color: var(--vscode-textPreformat-foreground);
						padding-left: 1px;
						margin-right: 3px;
						padding-right: 0px;
					}

					code:has(.codesetting):focus {
						border: 1px solid var(--vscode-button-border, transparent);
					}

					.codesetting {
						color: var(--vscode-textPreformat-foreground);
						padding: 0px 1px 1px 0px;
						font-size: 0px;
						overflow: hidden;
						text-overflow: ellipsis;
						outline-offset: 2px !important;
						box-sizing: border-box;
						text-align: center;
						cursor: pointer;
						display: inline;
						margin-right: 3px;
					}
					.codesetting svg {
						font-size: 12px;
						text-align: center;
						cursor: pointer;
						border: 1px solid var(--vscode-button-secondaryBorder, transparent);
						outline: 1px solid transparent;
						line-height: 9px;
						margin-bottom: -5px;
						padding-left: 0px;
						padding-top: 2px;
						padding-bottom: 2px;
						padding-right: 2px;
						display: inline-block;
						text-decoration: none;
						text-rendering: auto;
						text-transform: none;
						-webkit-font-smoothing: antialiased;
						-moz-osx-font-smoothing: grayscale;
						user-select: none;
						-webkit-user-select: none;
					}
					.codesetting .setting-name {
						font-size: 13px;
						padding-left: 2px;
						padding-right: 3px;
						padding-top: 1px;
						padding-bottom: 1px;
						margin-left: -5px;
						margin-top: -3px;
					}
					.codesetting:hover {
						color: var(--vscode-textPreformat-foreground) !important;
						text-decoration: none !important;
					}
					code:has(.codesetting):hover {
						filter: brightness(140%);
						text-decoration: none !important;
					}
					.codesetting:focus {
						outline: 0 !important;
						text-decoration: none !important;
						color: var(--vscode-button-hoverForeground) !important;
					}
					.codesetting .separator {
						width: 1px;
						height: 14px;
						margin-bottom: -3px;
						display: inline-block;
						background-color: var(--vscode-editor-background);
						font-size: 12px;
						margin-right: 8px;
					}

					header { display: flex; align-items: center; padding-top: 1em; }
				</style>
			</head>
			<body>
				${i}
				<script nonce="${t}">
					const vscode = acquireVsCodeApi();
					const container = document.createElement('p');
					container.style.display = 'flex';
					container.style.alignItems = 'center';

					const input = document.createElement('input');
					input.type = 'checkbox';
					input.id = 'showReleaseNotes';
					input.checked = ${d};
					container.appendChild(input);

					const label = document.createElement('label');
					label.htmlFor = 'showReleaseNotes';
					label.textContent = '${y.localize("showOnUpdate","Show release notes after an update")}';
					container.appendChild(label);

					const beforeElement = document.querySelector("body > h1")?.nextElementSibling;
					if (beforeElement) {
						document.body.insertBefore(container, beforeElement);
					} else {
						document.body.appendChild(container);
					}

					window.addEventListener('message', event => {
						if (event.data.type === 'showReleaseNotes') {
							input.checked = event.data.value;
						}
					});

					window.addEventListener('click', event => {
						const href = event.target.href ?? event.target.parentElement?.href ?? event.target.parentElement?.parentElement?.href;
						if (href && (href.startsWith('${R.codeSetting}'))) {
							vscode.postMessage({ type: 'clickSetting', value: { uri: href, x: event.clientX, y: event.clientY }});
						}
					});

					window.addEventListener('keypress', event => {
						if (event.keyCode === 13) {
							if (event.target.children.length > 0 && event.target.children[0].href) {
								const clientRect = event.target.getBoundingClientRect();
								vscode.postMessage({ type: 'clickSetting', value: { uri: event.target.children[0].href, x: clientRect.right , y: clientRect.bottom }});
							}
						}
					});

					input.addEventListener('change', event => {
						vscode.postMessage({ type: 'showReleaseNotes', value: input.checked }, '*');
					});
				</script>
			</body>
		</html>`}onDidChangeConfiguration(e){e.affectsConfiguration("update.showReleaseNotes")&&this.updateCheckboxWebview()}onDidChangeActiveWebviewEditor(e){e&&e===this._currentReleaseNotes&&this.updateCheckboxWebview()}updateCheckboxWebview(){this._currentReleaseNotes&&this._currentReleaseNotes.webview.postMessage({type:"showReleaseNotes",value:this._configurationService.getValue("update.showReleaseNotes")})}};f=w([o(0,G),o(1,O),o(2,q),o(3,B),o(4,F),o(5,M),o(6,ie),o(7,te),o(8,z),o(9,ee),o(10,oe),o(11,H),o(12,K)],f);export{f as ReleaseNotesManager};
