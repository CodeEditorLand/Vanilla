var y=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var g=(n,e,t,a)=>{for(var r=a>1?void 0:a?I(e,t):e,l=n.length-1,o;l>=0;l--)(o=n[l])&&(r=(a?o(e,t,r):o(r))||r);return a&&r&&y(e,t,r),r},f=(n,e)=>(t,a)=>e(t,a,n);import{KeyCode as R,KeyMod as u}from"../../../../base/common/keyCodes.js";import{Schemas as s}from"../../../../base/common/network.js";import*as b from"../../../../base/common/path.js";import*as i from"../../../../nls.js";import{MenuId as w,MenuRegistry as v}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as S}from"../../../../platform/configuration/common/configuration.js";import{ConfigurationScope as d,Extensions as T}from"../../../../platform/configuration/common/configurationRegistry.js";import{DEFAULT_TERMINAL_OSX as E}from"../../../../platform/externalTerminal/common/externalTerminal.js";import{IExternalTerminalService as h}from"../../../../platform/externalTerminal/electron-sandbox/externalTerminalService.js";import{KeybindingsRegistry as K,KeybindingWeight as z}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{Registry as x}from"../../../../platform/registry/common/platform.js";import{IRemoteAuthorityResolverService as A}from"../../../../platform/remote/common/remoteAuthorityResolver.js";import{Extensions as P}from"../../../common/contributions.js";import{IHistoryService as k}from"../../../services/history/common/history.js";import{LifecyclePhase as W}from"../../../services/lifecycle/common/lifecycle.js";import{TerminalContextKeys as U}from"../../terminal/common/terminalContextKey.js";const C="workbench.action.terminal.openNativeConsole";K.registerCommandAndKeybindingRule({id:C,primary:u.CtrlCmd|u.Shift|R.KeyC,when:U.notFocus,weight:z.WorkbenchContrib,handler:async n=>{const e=n.get(k),t=n.get(h),a=n.get(S),r=n.get(A),l=e.getLastActiveWorkspaceRoot(),o=a.getValue("terminal.external");if(l?.scheme===s.file){t.openTerminal(o,l.fsPath);return}try{if(l?.scheme===s.vscodeRemote){const c=await r.getCanonicalURI(l);if(c.scheme===s.file){t.openTerminal(o,c.fsPath);return}}}catch{}const p=e.getLastActiveFile(s.file);if(p?.scheme===s.file){t.openTerminal(o,b.dirname(p.fsPath));return}try{if(p?.scheme===s.vscodeRemote){const c=await r.getCanonicalURI(p);if(c.scheme===s.file){t.openTerminal(o,c.fsPath);return}}}catch{}t.openTerminal(o,void 0)}}),v.appendMenuItem(w.CommandPalette,{command:{id:C,title:i.localize2("globalConsoleAction","Open New External Terminal")}});let m=class{constructor(e){this._externalTerminalService=e;this._updateConfiguration()}_serviceBrand;async _updateConfiguration(){const e=await this._externalTerminalService.getDefaultTerminalForPlatforms();x.as(T.Configuration).registerConfiguration({id:"externalTerminal",order:100,title:i.localize("terminalConfigurationTitle","External Terminal"),type:"object",properties:{"terminal.explorerKind":{type:"string",enum:["integrated","external","both"],enumDescriptions:[i.localize("terminal.explorerKind.integrated","Use VS Code's integrated terminal."),i.localize("terminal.explorerKind.external","Use the configured external terminal."),i.localize("terminal.explorerKind.both","Use the other two together.")],description:i.localize("explorer.openInTerminalKind","When opening a file from the Explorer in a terminal, determines what kind of terminal will be launched"),default:"integrated"},"terminal.sourceControlRepositoriesKind":{type:"string",enum:["integrated","external","both"],enumDescriptions:[i.localize("terminal.sourceControlRepositoriesKind.integrated","Use VS Code's integrated terminal."),i.localize("terminal.sourceControlRepositoriesKind.external","Use the configured external terminal."),i.localize("terminal.sourceControlRepositoriesKind.both","Use the other two together.")],description:i.localize("sourceControlRepositories.openInTerminalKind","When opening a repository from the Source Control Repositories view in a terminal, determines what kind of terminal will be launched"),default:"integrated"},"terminal.external.windowsExec":{type:"string",description:i.localize("terminal.external.windowsExec","Customizes which terminal to run on Windows."),default:e.windows,scope:d.APPLICATION},"terminal.external.osxExec":{type:"string",description:i.localize("terminal.external.osxExec","Customizes which terminal application to run on macOS."),default:E,scope:d.APPLICATION},"terminal.external.linuxExec":{type:"string",description:i.localize("terminal.external.linuxExec","Customizes which terminal to run on Linux."),default:e.linux,scope:d.APPLICATION}}})}};m=g([f(0,h)],m);const _=x.as(P.Workbench);_.registerWorkbenchContribution(m,W.Restored);export{m as ExternalTerminalContribution};
