var x=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var p=(o,e,n,t)=>{for(var i=t>1?void 0:t?w(e,n):e,r=o.length-1,a;r>=0;r--)(a=o[r])&&(i=(t?a(e,n,i):a(i))||i);return t&&i&&x(e,n,i),i},l=(o,e)=>(n,t)=>e(n,t,o);import{Codicon as C}from"../../../../../vs/base/common/codicons.js";import g from"../../../../../vs/base/common/severity.js";import{localize as c}from"../../../../../vs/nls.js";import{ICommandService as y}from"../../../../../vs/platform/commands/common/commands.js";import"../../../../../vs/platform/terminal/common/environmentVariable.js";import{ITerminalService as T}from"../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{TerminalStatus as h}from"../../../../../vs/workbench/contrib/terminal/browser/terminalStatusList.js";import"../../../../../vs/workbench/contrib/terminal/common/environmentVariable.js";import{TerminalCommandId as I}from"../../../../../vs/workbench/contrib/terminal/common/terminal.js";import{IExtensionService as b}from"../../../../../vs/workbench/services/extensions/common/extensions.js";let d=class{constructor(e,n,t,i,r){this._diff=e;this._terminalId=n;this._collection=t;this._terminalService=i;this._extensionService=r}requiresAction=!0;_getInfo(e){const n=new Set;v(n,this._diff.added.values()),v(n,this._diff.removed.values()),v(n,this._diff.changed.values());let t=c("extensionEnvironmentContributionInfoStale","The following extensions want to relaunch the terminal to contribute to its environment:");return t+=E(this._collection,e,this._extensionService,n),t}_getActions(){return[{label:c("relaunchTerminalLabel","Relaunch Terminal"),run:()=>this._terminalService.getInstanceFromId(this._terminalId)?.relaunch(),commandId:I.Relaunch}]}getStatus(e){return{id:h.RelaunchNeeded,severity:g.Warning,icon:C.warning,tooltip:this._getInfo(e),hoverActions:this._getActions()}}};d=p([l(3,T),l(4,b)],d);let u=class{constructor(e,n,t){this._collection=e;this._commandService=n;this._extensionService=t}requiresAction=!1;_getInfo(e){const n=new Set;v(n,this._collection.getVariableMap(e).values());let t=c("extensionEnvironmentContributionInfoActive","The following extensions have contributed to this terminal's environment:");return t+=E(this._collection,e,this._extensionService,n),t}_getActions(e){return[{label:c("showEnvironmentContributions","Show Environment Contributions"),run:()=>this._commandService.executeCommand(I.ShowEnvironmentContributions,e),commandId:I.ShowEnvironmentContributions}]}getStatus(e){return{id:h.EnvironmentVariableInfoChangesActive,severity:g.Info,tooltip:this._getInfo(e),hoverActions:this._getActions(e)}}};u=p([l(1,y),l(2,b)],u);function E(o,e,n,t){const i=[`
`],r=o.getDescriptionMap(void 0),a=o.getDescriptionMap(e);for(const s of t){const m=r.get(s);m&&(i.push(`
- \`${S(s,n)}\``),i.push(`: ${m}`));const f=a.get(s);if(f){const _=m?` (${c("ScopedEnvironmentContributionInfo","workspace")})`:"";i.push(`
- \`${S(s,n)}${_}\``),i.push(`: ${f}`)}!m&&!f&&i.push(`
- \`${S(s,n)}\``)}return i.join("")}function v(o,e){for(const n of e)for(const t of n)o.add(t.extensionIdentifier)}function S(o,e){return e.extensions.find(n=>n.id===o)?.displayName||o}export{u as EnvironmentVariableInfoChangesActive,d as EnvironmentVariableInfoStale};