var f=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var l=(a,i,t,e)=>{for(var o=e>1?void 0:e?T(i,t):i,h=a.length-1,c;h>=0;h--)(c=a[h])&&(o=(e?c(i,t,o):c(o))||o);return e&&o&&f(i,t,o),o},m=(a,i)=>(t,e)=>i(t,e,a);import r from"electron";import{Emitter as p,Event as k}from"../../../base/common/event.js";import{Disposable as E}from"../../../base/common/lifecycle.js";import{isLinux as d,isMacintosh as _,isWindows as I}from"../../../base/common/platform.js";import{IConfigurationService as w}from"../../configuration/common/configuration.js";import{createDecorator as b}from"../../instantiation/common/instantiation.js";import{IStateService as D}from"../../state/node/state.js";const y="#FFFFFF",F="#1F1F1F",u="#000000",S="#FFFFFF",C="theme",g="themeBackground",v="windowSplash";var s;(t=>(t.DETECT_COLOR_SCHEME="window.autoDetectColorScheme",t.SYSTEM_COLOR_THEME="window.systemColorTheme"))(s||={});const R=b("themeMainService");let n=class extends E{constructor(t,e){super();this.stateService=t;this.configurationService=e;d||this._register(this.configurationService.onDidChangeConfiguration(o=>{(o.affectsConfiguration(s.SYSTEM_COLOR_THEME)||o.affectsConfiguration(s.DETECT_COLOR_SCHEME))&&this.updateSystemColorTheme()})),this.updateSystemColorTheme(),this._register(k.fromNodeEventEmitter(r.nativeTheme,"updated")(()=>this._onDidChangeColorScheme.fire(this.getColorScheme())))}_onDidChangeColorScheme=this._register(new p);onDidChangeColorScheme=this._onDidChangeColorScheme.event;updateSystemColorTheme(){if(d||this.configurationService.getValue(s.DETECT_COLOR_SCHEME))r.nativeTheme.themeSource="system";else switch(this.configurationService.getValue(s.SYSTEM_COLOR_THEME)){case"dark":r.nativeTheme.themeSource="dark";break;case"light":r.nativeTheme.themeSource="light";break;case"auto":switch(this.getBaseTheme()){case"vs":r.nativeTheme.themeSource="light";break;case"vs-dark":r.nativeTheme.themeSource="dark";break;default:r.nativeTheme.themeSource="system"}break;default:r.nativeTheme.themeSource="system";break}}getColorScheme(){if(I){if(r.nativeTheme.shouldUseHighContrastColors)return{dark:r.nativeTheme.shouldUseInvertedColorScheme,highContrast:!0}}else if(_){if(r.nativeTheme.shouldUseInvertedColorScheme||r.nativeTheme.shouldUseHighContrastColors)return{dark:r.nativeTheme.shouldUseDarkColors,highContrast:!0}}else if(d&&r.nativeTheme.shouldUseHighContrastColors)return{dark:!0,highContrast:!0};return{dark:r.nativeTheme.shouldUseDarkColors,highContrast:!1}}getBackgroundColor(){const t=this.getColorScheme();if(t.highContrast&&this.configurationService.getValue("window.autoDetectHighContrast"))return t.dark?u:S;let e=this.stateService.getItem(g,null);if(!e)switch(this.getBaseTheme()){case"vs":e=y;break;case"hc-black":e=u;break;case"hc-light":e=S;break;default:e=F}return e}getBaseTheme(){switch(this.stateService.getItem(C,"vs-dark").split(" ")[0]){case"vs":return"vs";case"hc-black":return"hc-black";case"hc-light":return"hc-light";default:return"vs-dark"}}saveWindowSplash(t,e){this.stateService.setItems([{key:C,data:e.baseTheme},{key:g,data:e.colorInfo.background},{key:v,data:e}]),typeof t=="number"&&this.updateBackgroundColor(t,e),this.updateSystemColorTheme()}updateBackgroundColor(t,e){for(const o of r.BrowserWindow.getAllWindows())if(o.id===t){o.setBackgroundColor(e.colorInfo.background);break}}getWindowSplash(){return this.stateService.getItem(v)}};n=l([m(0,D),m(1,w)],n);export{R as IThemeMainService,n as ThemeMainService};
