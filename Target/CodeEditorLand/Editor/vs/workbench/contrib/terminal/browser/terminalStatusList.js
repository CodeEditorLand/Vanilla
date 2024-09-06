var S=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var u=(r,a,e,t)=>{for(var n=t>1?void 0:t?h(a,e):a,i=r.length-1,o;i>=0;i--)(o=r[i])&&(n=(t?o(a,e,n):o(n))||n);return t&&n&&S(a,e,n),n},l=(r,a)=>(e,t)=>a(e,t,r);import{mainWindow as v}from"../../../../base/browser/window.js";import{Codicon as p}from"../../../../base/common/codicons.js";import{Emitter as d}from"../../../../base/common/event.js";import{Disposable as c}from"../../../../base/common/lifecycle.js";import f from"../../../../base/common/severity.js";import{ThemeIcon as g}from"../../../../base/common/themables.js";import{IConfigurationService as y}from"../../../../platform/configuration/common/configuration.js";import{TerminalSettingId as I}from"../../../../platform/terminal/common/terminal.js";import{listErrorForeground as _,listWarningForeground as T}from"../../../../platform/theme/common/colorRegistry.js";import{spinningLoading as D}from"../../../../platform/theme/common/iconRegistry.js";import"../common/terminal.js";var E=(i=>(i.Bell="bell",i.Disconnected="disconnected",i.RelaunchNeeded="relaunch-needed",i.EnvironmentVariableInfoChangesActive="env-var-info-changes-active",i.ShellIntegrationAttentionNeeded="shell-integration-attention-needed",i))(E||{});let s=class extends c{constructor(e){super();this._configurationService=e}_statuses=new Map;_statusTimeouts=new Map;_onDidAddStatus=this._register(new d);get onDidAddStatus(){return this._onDidAddStatus.event}_onDidRemoveStatus=this._register(new d);get onDidRemoveStatus(){return this._onDidRemoveStatus.event}_onDidChangePrimaryStatus=this._register(new d);get onDidChangePrimaryStatus(){return this._onDidChangePrimaryStatus.event}get primary(){let e;for(const t of this._statuses.values())(!e||t.severity>=e.severity)&&(t.icon||!e?.icon)&&(e=t);return e}get statuses(){return Array.from(this._statuses.values())}add(e,t){e=this._applyAnimationSetting(e);const n=this._statusTimeouts.get(e.id);if(n&&(v.clearTimeout(n),this._statusTimeouts.delete(e.id)),t&&t>0){const o=v.setTimeout(()=>this.remove(e),t);this._statusTimeouts.set(e.id,o)}const i=this._statuses.get(e.id);if(i&&i!==e&&(this._onDidRemoveStatus.fire(i),this._statuses.delete(i.id)),!this._statuses.has(e.id)){const o=this.primary;this._statuses.set(e.id,e),this._onDidAddStatus.fire(e);const m=this.primary;o!==m&&this._onDidChangePrimaryStatus.fire(m)}}remove(e){const t=typeof e=="string"?this._statuses.get(e):e;if(t&&this._statuses.get(t.id)){const n=this.primary?.id===t.id;this._statuses.delete(t.id),this._onDidRemoveStatus.fire(t),n&&this._onDidChangePrimaryStatus.fire(this.primary)}}toggle(e,t){t?this.add(e):this.remove(e)}_applyAnimationSetting(e){if(!e.icon||g.getModifier(e.icon)!=="spin"||this._configurationService.getValue(I.TabsEnableAnimation))return e;let t;return e.icon.id===D.id?t=p.play:t=g.modify(e.icon,void 0),{...e,icon:t}}};s=u([l(0,y)],s);function k(r){switch(r){case f.Error:return _;case f.Warning:return T;default:return""}}export{E as TerminalStatus,s as TerminalStatusList,k as getColorForSeverity};
