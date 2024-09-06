var C=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var m=(i,e,n,t)=>{for(var o=t>1?void 0:t?w(e,n):e,r=i.length-1,c;r>=0;r--)(c=i[r])&&(o=(t?c(e,n,o):c(o))||o);return t&&o&&C(e,n,o),o},a=(i,e)=>(n,t)=>e(n,t,i);import{ResourceMap as h}from"../../../../base/common/map.js";import{language as p}from"../../../../base/common/platform.js";import{joinPath as b}from"../../../../base/common/resources.js";import{assertIsDefined as g}from"../../../../base/common/types.js";import"../../../../base/common/uri.js";import{generateUuid as u}from"../../../../base/common/uuid.js";import{TokenizationRegistry as f}from"../../../../editor/common/languages.js";import{ILanguageService as $}from"../../../../editor/common/languages/language.js";import{generateTokensCSSForColorMap as y}from"../../../../editor/common/languages/supports/tokenization.js";import{IFileService as I}from"../../../../platform/files/common/files.js";import{INotificationService as L}from"../../../../platform/notification/common/notification.js";import{IExtensionService as U}from"../../../services/extensions/common/extensions.js";import{DEFAULT_MARKDOWN_STYLES as v,renderMarkdownDocument as E}from"../../markdown/browser/markdownDocumentRenderer.js";import{asWebviewUri as P}from"../../webview/common/webview.js";let s=class{constructor(e,n,t,o){this.fileService=e;this.notificationService=n;this.extensionService=t;this.languageService=o}mdCache=new h;svgCache=new h;async renderMarkdown(e,n){const t=await this.readAndCacheStepMarkdown(e,n),o=u(),r=f.getColorMap(),c=r?y(r):"";return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ${document.location.protocol==="http:"?"img-src https: data: http:":"img-src https: data:"}; media-src https:; script-src 'nonce-${o}'; style-src 'nonce-${o}';">
				<style nonce="${o}">
					${v}
					${c}
					body > img {
						align-self: flex-start;
					}
					body > img[centered] {
						align-self: center;
					}
					body {
						display: flex;
						flex-direction: column;
						padding: 0;
						height: inherit;
					}
					.theme-picker-row {
						display: flex;
						justify-content: center;
						gap: 32px;
					}
					checklist {
						display: flex;
						gap: 32px;
						flex-direction: column;
					}
					checkbox {
						display: flex;
						flex-direction: column;
						align-items: center;
						margin: 5px;
						cursor: pointer;
					}
					checkbox > img {
						margin-bottom: 8px !important;
					}
					checkbox.checked > img {
						box-sizing: border-box;
					}
					checkbox.checked > img {
						outline: 2px solid var(--vscode-focusBorder);
						outline-offset: 4px;
						border-radius: 4px;
					}
					.theme-picker-link {
						margin-top: 16px;
						color: var(--vscode-textLink-foreground);
					}
					blockquote > p:first-child {
						margin-top: 0;
					}
					body > * {
						margin-block-end: 0.25em;
						margin-block-start: 0.25em;
					}
					vertically-centered {
						padding-top: 5px;
						padding-bottom: 5px;
						display: flex;
						justify-content: center;
						flex-direction: column;
					}
					html {
						height: 100%;
						padding-right: 32px;
					}
					h1 {
						font-size: 19.5px;
					}
					h2 {
						font-size: 18.5px;
					}
				</style>
			</head>
			<body>
				<vertically-centered>
					${t}
				</vertically-centered>
			</body>
			<script nonce="${o}">
				const vscode = acquireVsCodeApi();

				document.querySelectorAll('[when-checked]').forEach(el => {
					el.addEventListener('click', () => {
						vscode.postMessage(el.getAttribute('when-checked'));
					});
				});

				let ongoingLayout = undefined;
				const doLayout = () => {
					document.querySelectorAll('vertically-centered').forEach(element => {
						element.style.marginTop = Math.max((document.body.clientHeight - element.scrollHeight) * 3/10, 0) + 'px';
					});
					ongoingLayout = undefined;
				};

				const layout = () => {
					if (ongoingLayout) {
						clearTimeout(ongoingLayout);
					}
					ongoingLayout = setTimeout(doLayout, 0);
				};

				layout();

				document.querySelectorAll('img').forEach(element => {
					element.onload = layout;
				})

				window.addEventListener('message', event => {
					if (event.data.layoutMeNow) {
						layout();
					}
					if (event.data.enabledContextKeys) {
						document.querySelectorAll('.checked').forEach(element => element.classList.remove('checked'))
						for (const key of event.data.enabledContextKeys) {
							document.querySelectorAll('[checked-on="' + key + '"]').forEach(element => element.classList.add('checked'))
						}
					}
				});
		</script>
		</html>`}async renderSVG(e){const n=await this.readAndCacheSVGFile(e),t=u(),o=f.getColorMap(),r=o?y(o):"";return`<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'nonce-${t}';">
				<style nonce="${t}">
					${v}
					${r}
					svg {
						position: fixed;
						height: 100%;
						width: 80%;
						left: 50%;
						top: 50%;
						max-width: 530px;
						min-width: 350px;
						transform: translate(-50%,-50%);
					}
				</style>
			</head>
			<body>
				${n}
			</body>
		</html>`}async readAndCacheSVGFile(e){if(!this.svgCache.has(e)){const n=await this.readContentsOfPath(e,!1);this.svgCache.set(e,n)}return g(this.svgCache.get(e))}async readAndCacheStepMarkdown(e,n){if(!this.mdCache.has(e)){const t=await this.readContentsOfPath(e),o=await E(M(t,n),this.extensionService,this.languageService,{allowUnknownProtocols:!0});this.mdCache.set(e,o)}return g(this.mdCache.get(e))}async readContentsOfPath(e,n=!0){try{const t=JSON.parse(e.query).moduleId;if(n&&t)return(await import(t)).default()}catch{}try{const t=e.with({path:e.path.replace(/\.md$/,`.nls.${p}.md`)}),o=p?.replace(/-.*$/,""),r=e.with({path:e.path.replace(/\.md$/,`.nls.${o}.md`)}),c=S=>this.fileService.stat(S).then(k=>!!k.size).catch(()=>!1),[l,d]=await Promise.all([c(t),c(r)]);return(await this.fileService.readFile(l?t:d?r:e)).value.toString()}catch(t){return this.notificationService.error("Error reading markdown document at `"+e+"`: "+t),""}}};s=m([a(0,I),a(1,L),a(2,U),a(3,$)],s);const x=(i,e)=>{const n=b(e,i);return P(n).toString(!0)},M=(i,e)=>i.replace(/src="([^"]*)"/g,(n,t)=>t.startsWith("https://")?`src="${t}"`:`src="${x(t,e)}"`).replace(/!\[([^\]]*)\]\(([^)]*)\)/g,(n,t,o)=>o.startsWith("https://")?`![${t}](${o})`:`![${t}](${x(o,e)})`);export{s as GettingStartedDetailsRenderer};
