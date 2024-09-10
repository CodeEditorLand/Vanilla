(function(){const u=b();performance.mark("code/didStartRenderer"),u.load(["vs/workbench/workbench.desktop.main","vs/css!vs/workbench/workbench.desktop.main"],function(e,o){return performance.mark("code/didLoadWorkbenchMain"),e.main(o)},{configureDeveloperSettings:function(e){return{forceDisableShowDevtoolsOnError:typeof e.extensionTestsPath=="string"||e["enable-smoke-test-driver"]===!0,forceEnableDeveloperKeybindings:Array.isArray(e.extensionDevelopmentPath)&&e.extensionDevelopmentPath.length>0,removeDeveloperKeybindingsAfterLoad:!0}},canModifyDOM:function(e){B(e)},beforeLoaderConfig:function(e){e.recordStats=!0},beforeRequire:function(e){performance.mark("code/willLoadWorkbenchMain"),Object.defineProperty(window,"vscodeWindowId",{get:()=>e.windowId}),window.requestIdleCallback(()=>{const o=document.createElement("canvas");o.getContext("2d")?.clearRect(0,0,o.width,o.height),o.remove()},{timeout:50})}});function b(){return window.MonacoBootstrapWindow}function B(e){performance.mark("code/willShowPartsSplash");let o=e.partsSplash;o&&(e.autoDetectHighContrast&&e.colorScheme.highContrast?(e.colorScheme.dark&&o.baseTheme!=="hc-black"||!e.colorScheme.dark&&o.baseTheme!=="hc-light")&&(o=void 0):e.autoDetectColorScheme&&(e.colorScheme.dark&&o.baseTheme!=="vs-dark"||!e.colorScheme.dark&&o.baseTheme!=="vs")&&(o=void 0)),o&&e.extensionDevelopmentPath&&(o.layoutInfo=void 0);let a,s,l;o?(a=o.baseTheme,s=o.colorInfo.editorBackground,l=o.colorInfo.foreground):e.autoDetectHighContrast&&e.colorScheme.highContrast?e.colorScheme.dark?(a="hc-black",s="#000000",l="#FFFFFF"):(a="hc-light",s="#FFFFFF",l="#000000"):e.autoDetectColorScheme&&(e.colorScheme.dark?(a="vs-dark",s="#1E1E1E",l="#CCCCCC"):(a="vs",s="#FFFFFF",l="#000000"));const n=document.createElement("style");if(n.className="initialShellColors",document.head.appendChild(n),n.textContent=`body {
			background-color: ${s};
			color: ${l};
			margin: 0;
			padding: 0;
		}`,typeof o?.zoomLevel=="number"&&typeof globalThis.vscode?.webFrame?.setZoomLevel=="function"&&globalThis.vscode.webFrame.setZoomLevel(o.zoomLevel),o?.layoutInfo){const{layoutInfo:t,colorInfo:r}=o,d=document.createElement("div");d.id="monaco-parts-splash",d.className=a??"vs-dark",t.windowBorder&&r.windowBorder&&(d.setAttribute("style",`
					position: relative;
					height: calc(100vh - 2px);
					width: calc(100vw - 2px);
					border: 1px solid var(--window-border-color);
				`),d.style.setProperty("--window-border-color",r.windowBorder),t.windowBorderRadius&&(d.style.borderRadius=t.windowBorderRadius)),t.sideBarWidth=Math.min(t.sideBarWidth,window.innerWidth-(t.activityBarWidth+t.editorPartMinWidth));const c=document.createElement("div");if(c.setAttribute("style",`
				position: absolute;
				width: 100%;
				height: ${t.titleBarHeight}px;
				left: 0;
				top: 0;
				background-color: ${r.titleBarBackground};
				-webkit-app-region: drag;
			`),d.appendChild(c),r.titleBarBorder&&t.titleBarHeight>0){const i=document.createElement("div");i.setAttribute("style",`
					position: absolute;
					width: 100%;
					height: 1px;
					left: 0;
					bottom: 0;
					border-bottom: 1px solid ${r.titleBarBorder};
				`),c.appendChild(i)}const h=document.createElement("div");if(h.setAttribute("style",`
				position: absolute;
				width: ${t.activityBarWidth}px;
				height: calc(100% - ${t.titleBarHeight+t.statusBarHeight}px);
				top: ${t.titleBarHeight}px;
				${t.sideBarSide}: 0;
				background-color: ${r.activityBarBackground};
			`),d.appendChild(h),r.activityBarBorder&&t.activityBarWidth>0){const i=document.createElement("div");i.setAttribute("style",`
					position: absolute;
					width: 1px;
					height: 100%;
					top: 0;
					${t.sideBarSide==="left"?"right":"left"}: 0;
					${t.sideBarSide==="left"?"border-right":"border-left"}: 1px solid ${r.activityBarBorder};
				`),h.appendChild(i)}if(e.workspace){const i=document.createElement("div");if(i.setAttribute("style",`
					position: absolute;
					width: ${t.sideBarWidth}px;
					height: calc(100% - ${t.titleBarHeight+t.statusBarHeight}px);
					top: ${t.titleBarHeight}px;
					${t.sideBarSide}: ${t.activityBarWidth}px;
					background-color: ${r.sideBarBackground};
				`),d.appendChild(i),r.sideBarBorder&&t.sideBarWidth>0){const m=document.createElement("div");m.setAttribute("style",`
						position: absolute;
						width: 1px;
						height: 100%;
						top: 0;
						right: 0;
						${t.sideBarSide==="left"?"right":"left"}: 0;
						${t.sideBarSide==="left"?"border-right":"border-left"}: 1px solid ${r.sideBarBorder};
					`),i.appendChild(m)}}const p=document.createElement("div");if(p.setAttribute("style",`
				position: absolute;
				width: 100%;
				height: ${t.statusBarHeight}px;
				bottom: 0;
				left: 0;
				background-color: ${e.workspace?r.statusBarBackground:r.statusBarNoFolderBackground};
			`),d.appendChild(p),r.statusBarBorder&&t.statusBarHeight>0){const i=document.createElement("div");i.setAttribute("style",`
					position: absolute;
					width: 100%;
					height: 1px;
					top: 0;
					border-top: 1px solid ${r.statusBarBorder};
				`),p.appendChild(i)}document.body.appendChild(d)}performance.mark("code/didShowPartsSplash")}})();
