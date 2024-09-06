var y=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var m=(c,l,r,n)=>{for(var e=n>1?void 0:n?x(l,r):l,i=c.length-1,t;i>=0;i--)(t=c[i])&&(e=(n?t(l,r,e):t(e))||e);return n&&e&&y(l,r,e),e},s=(c,l)=>(r,n)=>l(r,n,c);import"../../../../base/common/cancellation.js";import{Iterable as E}from"../../../../base/common/iterator.js";import{Disposable as P}from"../../../../base/common/lifecycle.js";import{LinkedList as k}from"../../../../base/common/linkedList.js";import{isWeb as b}from"../../../../base/common/platform.js";import{URI as S}from"../../../../base/common/uri.js";import*as u from"../../../../editor/common/languages.js";import*as f from"../../../../nls.js";import{IConfigurationService as h}from"../../../../platform/configuration/common/configuration.js";import{createDecorator as w}from"../../../../platform/instantiation/common/instantiation.js";import{ILogService as R}from"../../../../platform/log/common/log.js";import{IOpenerService as C}from"../../../../platform/opener/common/opener.js";import{IQuickInputService as D}from"../../../../platform/quickinput/common/quickInput.js";import{IPreferencesService as T}from"../../../services/preferences/common/preferences.js";import{testUrlMatchesGlob as A}from"../../url/common/urlGlob.js";import{defaultExternalUriOpenerId as O,externalUriOpenersSettingId as U}from"./configuration.js";const re=w("externalUriOpenerService");let d=class extends P{constructor(r,n,e,i,t){super();this.configurationService=n;this.logService=e;this.preferencesService=i;this.quickInputService=t;this._register(r.registerExternalOpener(this))}_serviceBrand;_providers=new k;registerExternalOpenerProvider(r){return{dispose:this._providers.push(r)}}async getOpeners(r,n,e,i){const t=await this.getAllOpenersForUri(r);if(t.size===0)return[];if(e.preferredOpenerId){if(e.preferredOpenerId===O)return[];const a=t.get(e.preferredOpenerId);if(a)return[a]}const o=this.getConfiguredOpenerForUri(t,r);if(o)return o===O?[]:[o];const p=[];if(await Promise.all(Array.from(t.values()).map(async a=>{let I;try{I=await a.canOpen(e.sourceUri,i)}catch(v){this.logService.error(v);return}switch(I){case u.ExternalUriOpenerPriority.Option:case u.ExternalUriOpenerPriority.Default:case u.ExternalUriOpenerPriority.Preferred:p.push({opener:a,priority:I});break}})),p.length===0)return[];const g=p.filter(a=>a.priority===u.ExternalUriOpenerPriority.Preferred).at(0);return g?[g.opener]:!n&&p.every(a=>a.priority===u.ExternalUriOpenerPriority.Option)?[]:p.map(a=>a.opener)}async openExternal(r,n,e){const i=typeof r=="string"?S.parse(r):r,t=await this.getOpeners(i,!1,n,e);return t.length===0?!1:t.length===1?t[0].openExternalUri(i,n,e):this.showOpenerPrompt(t,i,n,e)}async getOpener(r,n,e){const i=await this.getOpeners(r,!0,n,e);if(i.length>=1)return i[0]}async getAllOpenersForUri(r){const n=new Map;return await Promise.all(E.map(this._providers,async e=>{for await(const i of e.getOpeners(r))n.set(i.id,i)})),n}getConfiguredOpenerForUri(r,n){const e=this.configurationService.getValue(U)||{};for(const[i,t]of Object.entries(e))if(A(n,i)){if(t===O)return"default";const o=r.get(t);if(o)return o}}async showOpenerPrompt(r,n,e,i){const t=r.map(p=>({label:p.label,opener:p}));t.push({label:b?f.localize("selectOpenerDefaultLabel.web","Open in new browser window"):f.localize("selectOpenerDefaultLabel","Open in default browser"),opener:void 0},{type:"separator"},{label:f.localize("selectOpenerConfigureTitle","Configure default opener..."),opener:"configureDefault"});const o=await this.quickInputService.pick(t,{placeHolder:f.localize("selectOpenerPlaceHolder","How would you like to open: {0}",n.toString())});return o?typeof o.opener>"u"?!1:o.opener==="configureDefault"?(await this.preferencesService.openUserSettings({jsonEditor:!0,revealSetting:{key:U,edit:!0}}),!0):o.opener.openExternalUri(n,e,i):!0}};d=m([s(0,C),s(1,h),s(2,R),s(3,T),s(4,D)],d);export{d as ExternalUriOpenerService,re as IExternalUriOpenerService};
