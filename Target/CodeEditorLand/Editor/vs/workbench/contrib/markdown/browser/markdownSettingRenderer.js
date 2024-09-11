var h=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var p=(c,e,t,n)=>{for(var i=n>1?void 0:n?v(e,t):e,r=c.length-1,o;r>=0;r--)(o=c[r])&&(i=(n?o(e,t,i):o(i))||i);return n&&i&&h(e,t,i),i},g=(c,e)=>(t,n)=>e(t,n,c);import*as s from"../../../../nls.js";import{IPreferencesService as m}from"../../../services/preferences/common/preferences.js";import{settingKeyToDisplayFormat as u}from"../../preferences/browser/settingsTreeModels.js";import"../../../../base/common/uri.js";import{ConfigurationTarget as f,IConfigurationService as y}from"../../../../platform/configuration/common/configuration.js";import{IContextMenuService as b}from"../../../../platform/contextview/browser/contextView.js";import{ActionViewItem as I}from"../../../../base/browser/ui/actionbar/actionViewItems.js";import"../../../../base/common/actions.js";import{ITelemetryService as M}from"../../../../platform/telemetry/common/telemetry.js";import{IClipboardService as _}from"../../../../platform/clipboard/common/clipboardService.js";import{Schemas as S}from"../../../../base/common/network.js";import"../../../../base/common/marked/marked.js";let l=class{constructor(e,t,n,i,r){this._configurationService=e;this._contextMenuService=t;this._preferencesService=n;this._telemetryService=i;this._clipboardService=r;this.codeSettingRegex=new RegExp('^<a (href)=".*code.*://settings/([^\\s"]+)"(?:\\s*codesetting="([^"]+)")?>')}codeSettingRegex;_updatedSettings=new Map;_encounteredSettings=new Map;_featuredSettings=new Map;get featuredSettingStates(){const e=new Map;for(const[t,n]of this._featuredSettings)e.set(t,this._configurationService.getValue(t)===n);return e}getHtmlRenderer(){return({raw:e})=>{const t=this.codeSettingRegex.exec(e);if(t&&t.length===4){const n=t[2],i=this.render(n,t[3]);i&&(e=e.replace(this.codeSettingRegex,i))}return e}}settingToUriString(e,t){return`${S.codeSetting}://${e}${t?`/${t}`:""}`}getSetting(e){return this._encounteredSettings.has(e)?this._encounteredSettings.get(e):this._preferencesService.getSetting(e)}parseValue(e,t){if(t==="undefined"||t==="")return;const n=this.getSetting(e);if(!n)return t;switch(n.type){case"boolean":return t==="true";case"number":return parseInt(t,10);case"string":default:return t}}render(e,t){const n=this.getSetting(e);return n?this.renderSetting(n,t):""}viewInSettingsMessage(e,t){if(t)return s.localize("viewInSettings","View in Settings");{const n=u(e);return s.localize("viewInSettingsDetailed",'View "{0}: {1}" in Settings',n.category,n.label)}}restorePreviousSettingMessage(e){const t=u(e);return s.localize("restorePreviousValue",'Restore value of "{0}: {1}"',t.category,t.label)}booleanSettingMessage(e,t){const n=this._configurationService.getValue(e.key);if(n===t||n===void 0&&e.value===t)return;const i=u(e.key);return t?s.localize("trueMessage",'Enable "{0}: {1}"',i.category,i.label):s.localize("falseMessage",'Disable "{0}: {1}"',i.category,i.label)}stringSettingMessage(e,t){const n=this._configurationService.getValue(e.key);if(n===t||n===void 0&&e.value===t)return;const i=u(e.key);return s.localize("stringValue",'Set "{0}: {1}" to "{2}"',i.category,i.label,t)}numberSettingMessage(e,t){const n=this._configurationService.getValue(e.key);if(n===t||n===void 0&&e.value===t)return;const i=u(e.key);return s.localize("numberValue",'Set "{0}: {1}" to {2}',i.category,i.label,t)}renderSetting(e,t){const n=this.settingToUriString(e.key,t),i=s.localize("changeSettingTitle","View or change setting");return`<code tabindex="0"><a href="${n}" class="codesetting" title="${i}" aria-role="button"><svg width="14" height="14" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"/></svg>
			<span class="separator"></span>
			<span class="setting-name">${e.key}</span>
		</a></code>`}getSettingMessage(e,t){if(e.type==="boolean")return this.booleanSettingMessage(e,t);if(e.type==="string")return this.stringSettingMessage(e,t);if(e.type==="number")return this.numberSettingMessage(e,t)}async restoreSetting(e){const t=this._updatedSettings.get(e);return this._updatedSettings.delete(e),this._configurationService.updateValue(e,t,f.USER)}async setSetting(e,t,n){return this._updatedSettings.set(e,t),this._configurationService.updateValue(e,n,f.USER)}getActions(e){if(e.scheme!==S.codeSetting)return;const t=[],n=e.authority,i=this.parseValue(e.authority,e.path.substring(1)),r=this._configurationService.inspect(n).userValue;if(i!==void 0&&i===r&&this._updatedSettings.has(n)){const a=this.restorePreviousSettingMessage(n);t.push({class:void 0,id:"restoreSetting",enabled:!0,tooltip:a,label:a,run:()=>this.restoreSetting(n)})}else if(i!==void 0){const a=this.getSetting(n),d=a?this.getSettingMessage(a,i):void 0;a&&d&&t.push({class:void 0,id:"trySetting",enabled:r!==i,tooltip:d,label:d,run:()=>{this.setSetting(n,r,i)}})}const o=this.viewInSettingsMessage(n,t.length>0);return t.push({class:void 0,enabled:!0,id:"viewInSettings",tooltip:o,label:o,run:()=>this._preferencesService.openApplicationSettings({query:`@id:${n}`})}),t.push({class:void 0,enabled:!0,id:"copySettingId",tooltip:s.localize("copySettingId","Copy Setting ID"),label:s.localize("copySettingId","Copy Setting ID"),run:()=>{this._clipboardService.writeText(n)}}),t}showContextMenu(e,t,n){const i=this.getActions(e);i&&this._contextMenuService.showContextMenu({getAnchor:()=>({x:t,y:n}),getActions:()=>i,getActionViewItem:r=>new I(r,r,{label:!0})})}async updateSetting(e,t,n){if(e.scheme===S.codeSetting)return this._telemetryService.publicLog2("releaseNotesSettingAction",{settingId:e.authority}),this.showContextMenu(e,t,n)}};l=p([g(0,y),g(1,b),g(2,m),g(3,M),g(4,_)],l);export{l as SimpleSettingRenderer};
