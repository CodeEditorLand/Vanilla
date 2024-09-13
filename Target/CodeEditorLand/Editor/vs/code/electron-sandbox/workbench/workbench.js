var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(() => {
  const bootstrapWindow = bootstrapWindowLib();
  performance.mark("code/didStartRenderer");
  bootstrapWindow.load(
    [
      "vs/workbench/workbench.desktop.main",
      "vs/css!vs/workbench/workbench.desktop.main"
    ],
    (desktopMain, configuration) => {
      performance.mark("code/didLoadWorkbenchMain");
      return desktopMain.main(configuration);
    },
    {
      configureDeveloperSettings: /* @__PURE__ */ __name((windowConfig) => ({
        // disable automated devtools opening on error when running extension tests
        // as this can lead to nondeterministic test execution (devtools steals focus)
        forceDisableShowDevtoolsOnError: typeof windowConfig.extensionTestsPath === "string" || windowConfig["enable-smoke-test-driver"] === true,
        // enable devtools keybindings in extension development window
        forceEnableDeveloperKeybindings: Array.isArray(windowConfig.extensionDevelopmentPath) && windowConfig.extensionDevelopmentPath.length > 0,
        removeDeveloperKeybindingsAfterLoad: true
      }), "configureDeveloperSettings"),
      canModifyDOM: /* @__PURE__ */ __name((windowConfig) => {
        showSplash(windowConfig);
      }, "canModifyDOM"),
      beforeLoaderConfig: /* @__PURE__ */ __name((loaderConfig) => {
        loaderConfig.recordStats = true;
      }, "beforeLoaderConfig"),
      beforeRequire: /* @__PURE__ */ __name((windowConfig) => {
        performance.mark("code/willLoadWorkbenchMain");
        Object.defineProperty(window, "vscodeWindowId", {
          get: /* @__PURE__ */ __name(() => windowConfig.windowId, "get")
        });
        window.requestIdleCallback(
          () => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            context?.clearRect(0, 0, canvas.width, canvas.height);
            canvas.remove();
          },
          { timeout: 50 }
        );
      }, "beforeRequire")
    }
  );
  function bootstrapWindowLib() {
    return window.MonacoBootstrapWindow;
  }
  __name(bootstrapWindowLib, "bootstrapWindowLib");
  function showSplash(configuration) {
    performance.mark("code/willShowPartsSplash");
    let data = configuration.partsSplash;
    if (data) {
      if (configuration.autoDetectHighContrast && configuration.colorScheme.highContrast) {
        if (configuration.colorScheme.dark && data.baseTheme !== "hc-black" || !configuration.colorScheme.dark && data.baseTheme !== "hc-light") {
          data = void 0;
        }
      } else if (configuration.autoDetectColorScheme) {
        if (configuration.colorScheme.dark && data.baseTheme !== "vs-dark" || !configuration.colorScheme.dark && data.baseTheme !== "vs") {
          data = void 0;
        }
      }
    }
    if (data && configuration.extensionDevelopmentPath) {
      data.layoutInfo = void 0;
    }
    let baseTheme;
    let shellBackground;
    let shellForeground;
    if (data) {
      baseTheme = data.baseTheme;
      shellBackground = data.colorInfo.editorBackground;
      shellForeground = data.colorInfo.foreground;
    } else if (configuration.autoDetectHighContrast && configuration.colorScheme.highContrast) {
      if (configuration.colorScheme.dark) {
        baseTheme = "hc-black";
        shellBackground = "#000000";
        shellForeground = "#FFFFFF";
      } else {
        baseTheme = "hc-light";
        shellBackground = "#FFFFFF";
        shellForeground = "#000000";
      }
    } else if (configuration.autoDetectColorScheme) {
      if (configuration.colorScheme.dark) {
        baseTheme = "vs-dark";
        shellBackground = "#1E1E1E";
        shellForeground = "#CCCCCC";
      } else {
        baseTheme = "vs";
        shellBackground = "#FFFFFF";
        shellForeground = "#000000";
      }
    }
    const style = document.createElement("style");
    style.className = "initialShellColors";
    document.head.appendChild(style);
    style.textContent = `body {
			background-color: ${shellBackground};
			color: ${shellForeground};
			margin: 0;
			padding: 0;
		}`;
    if (typeof data?.zoomLevel === "number" && typeof globalThis.vscode?.webFrame?.setZoomLevel === "function") {
      globalThis.vscode.webFrame.setZoomLevel(data.zoomLevel);
    }
    if (data?.layoutInfo) {
      const { layoutInfo, colorInfo } = data;
      const splash = document.createElement("div");
      splash.id = "monaco-parts-splash";
      splash.className = baseTheme ?? "vs-dark";
      if (layoutInfo.windowBorder && colorInfo.windowBorder) {
        splash.setAttribute(
          "style",
          `
					position: relative;
					height: calc(100vh - 2px);
					width: calc(100vw - 2px);
					border: 1px solid var(--window-border-color);
				`
        );
        splash.style.setProperty(
          "--window-border-color",
          colorInfo.windowBorder
        );
        if (layoutInfo.windowBorderRadius) {
          splash.style.borderRadius = layoutInfo.windowBorderRadius;
        }
      }
      layoutInfo.sideBarWidth = Math.min(
        layoutInfo.sideBarWidth,
        window.innerWidth - (layoutInfo.activityBarWidth + layoutInfo.editorPartMinWidth)
      );
      const titleDiv = document.createElement("div");
      titleDiv.setAttribute(
        "style",
        `
				position: absolute;
				width: 100%;
				height: ${layoutInfo.titleBarHeight}px;
				left: 0;
				top: 0;
				background-color: ${colorInfo.titleBarBackground};
				-webkit-app-region: drag;
			`
      );
      splash.appendChild(titleDiv);
      if (colorInfo.titleBarBorder && layoutInfo.titleBarHeight > 0) {
        const titleBorder = document.createElement("div");
        titleBorder.setAttribute(
          "style",
          `
					position: absolute;
					width: 100%;
					height: 1px;
					left: 0;
					bottom: 0;
					border-bottom: 1px solid ${colorInfo.titleBarBorder};
				`
        );
        titleDiv.appendChild(titleBorder);
      }
      const activityDiv = document.createElement("div");
      activityDiv.setAttribute(
        "style",
        `
				position: absolute;
				width: ${layoutInfo.activityBarWidth}px;
				height: calc(100% - ${layoutInfo.titleBarHeight + layoutInfo.statusBarHeight}px);
				top: ${layoutInfo.titleBarHeight}px;
				${layoutInfo.sideBarSide}: 0;
				background-color: ${colorInfo.activityBarBackground};
			`
      );
      splash.appendChild(activityDiv);
      if (colorInfo.activityBarBorder && layoutInfo.activityBarWidth > 0) {
        const activityBorderDiv = document.createElement("div");
        activityBorderDiv.setAttribute(
          "style",
          `
					position: absolute;
					width: 1px;
					height: 100%;
					top: 0;
					${layoutInfo.sideBarSide === "left" ? "right" : "left"}: 0;
					${layoutInfo.sideBarSide === "left" ? "border-right" : "border-left"}: 1px solid ${colorInfo.activityBarBorder};
				`
        );
        activityDiv.appendChild(activityBorderDiv);
      }
      if (configuration.workspace) {
        const sideDiv = document.createElement("div");
        sideDiv.setAttribute(
          "style",
          `
					position: absolute;
					width: ${layoutInfo.sideBarWidth}px;
					height: calc(100% - ${layoutInfo.titleBarHeight + layoutInfo.statusBarHeight}px);
					top: ${layoutInfo.titleBarHeight}px;
					${layoutInfo.sideBarSide}: ${layoutInfo.activityBarWidth}px;
					background-color: ${colorInfo.sideBarBackground};
				`
        );
        splash.appendChild(sideDiv);
        if (colorInfo.sideBarBorder && layoutInfo.sideBarWidth > 0) {
          const sideBorderDiv = document.createElement("div");
          sideBorderDiv.setAttribute(
            "style",
            `
						position: absolute;
						width: 1px;
						height: 100%;
						top: 0;
						right: 0;
						${layoutInfo.sideBarSide === "left" ? "right" : "left"}: 0;
						${layoutInfo.sideBarSide === "left" ? "border-right" : "border-left"}: 1px solid ${colorInfo.sideBarBorder};
					`
          );
          sideDiv.appendChild(sideBorderDiv);
        }
      }
      const statusDiv = document.createElement("div");
      statusDiv.setAttribute(
        "style",
        `
				position: absolute;
				width: 100%;
				height: ${layoutInfo.statusBarHeight}px;
				bottom: 0;
				left: 0;
				background-color: ${configuration.workspace ? colorInfo.statusBarBackground : colorInfo.statusBarNoFolderBackground};
			`
      );
      splash.appendChild(statusDiv);
      if (colorInfo.statusBarBorder && layoutInfo.statusBarHeight > 0) {
        const statusBorderDiv = document.createElement("div");
        statusBorderDiv.setAttribute(
          "style",
          `
					position: absolute;
					width: 100%;
					height: 1px;
					top: 0;
					border-top: 1px solid ${colorInfo.statusBarBorder};
				`
        );
        statusDiv.appendChild(statusBorderDiv);
      }
      document.body.appendChild(splash);
    }
    performance.mark("code/didShowPartsSplash");
  }
  __name(showSplash, "showSplash");
})();
//# sourceMappingURL=workbench.js.map
