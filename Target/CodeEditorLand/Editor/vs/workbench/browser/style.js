import"vs/css!./media/style";import{isSafari as m,isStandalone as c}from"../../../vs/base/browser/browser.js";import{createMetaElement as d}from"../../../vs/base/browser/dom.js";import{mainWindow as l}from"../../../vs/base/browser/window.js";import{isIOS as s,isWeb as u}from"../../../vs/base/common/platform.js";import{selectionBackground as f}from"../../../vs/platform/theme/common/colorRegistry.js";import{registerThemingParticipant as b}from"../../../vs/platform/theme/common/themeService.js";import{TITLE_BAR_ACTIVE_BACKGROUND as g,WORKBENCH_BACKGROUND as k}from"../../../vs/workbench/common/theme.js";b((t,e)=>{const n=k(t);e.addRule(`.monaco-workbench { background-color: ${n}; }`);const r=t.getColor(f);if(r&&e.addRule(`.monaco-workbench ::selection { background-color: ${r}; }`),u){const i=t.getColor(g);if(i){const a="monaco-workbench-meta-theme-color";let o=l.document.getElementById(a);o||(o=d(),o.name="theme-color",o.id=a),o.content=i.toString()}}m&&e.addRule(`
			body.web {
				touch-action: none;
			}
			.monaco-workbench .monaco-editor .view-lines {
				user-select: text;
				-webkit-user-select: text;
			}
		`),s&&c()&&e.addRule(`body { background-color: ${n}; }`)});
