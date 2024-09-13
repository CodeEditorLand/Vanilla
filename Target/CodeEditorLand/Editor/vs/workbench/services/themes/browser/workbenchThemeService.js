var oe=Object.defineProperty;var ne=Object.getOwnPropertyDescriptor;var U=(l,s,e,t)=>{for(var n=t>1?void 0:t?ne(s,e):s,o=l.length-1,i;o>=0;o--)(i=l[o])&&(n=(t?i(s,e,n):i(n))||n);return t&&n&&oe(s,e,n),n},c=(l,s)=>(e,t)=>s(e,t,l);import*as re from"../../../../nls.js";import*as I from"../../../../base/common/types.js";import{IExtensionService as se}from"../../extensions/common/extensions.js";import{IWorkbenchThemeService as he,ExtensionData as R,VS_LIGHT_THEME as N,VS_DARK_THEME as q,VS_HC_THEME as B,VS_HC_LIGHT_THEME as z,ThemeSettings as a,ThemeSettingDefaults as d,COLOR_THEME_DARK_INITIAL_COLORS as ce,COLOR_THEME_LIGHT_INITIAL_COLORS as ae}from"../common/workbenchThemeService.js";import{IStorageService as le}from"../../../../platform/storage/common/storage.js";import{ITelemetryService as me}from"../../../../platform/telemetry/common/telemetry.js";import{Registry as de}from"../../../../platform/registry/common/platform.js";import*as ue from"../../../../base/common/errors.js";import{IConfigurationService as Te,ConfigurationTarget as j}from"../../../../platform/configuration/common/configuration.js";import{ColorThemeData as g}from"../common/colorThemeData.js";import{Extensions as Ie}from"../../../../platform/theme/common/themeService.js";import{Emitter as E}from"../../../../base/common/event.js";import{registerFileIconThemeSchemas as ge}from"../common/fileIconThemeSchema.js";import{dispose as G,Disposable as fe}from"../../../../base/common/lifecycle.js";import{FileIconThemeData as f,FileIconThemeLoader as pe}from"./fileIconThemeData.js";import{createStyleSheet as K}from"../../../../base/browser/dom.js";import{IBrowserWorkbenchEnvironmentService as Ce}from"../../environment/browser/environmentService.js";import{IFileService as Se,FileChangeType as ye}from"../../../../platform/files/common/files.js";import"../../../../base/common/uri.js";import*as S from"../../../../base/common/resources.js";import{registerColorThemeSchemas as ve}from"../common/colorThemeSchema.js";import{InstantiationType as Re,registerSingleton as Ee}from"../../../../platform/instantiation/common/extensions.js";import{getRemoteAuthority as $}from"../../../../platform/remote/common/remoteHosts.js";import{IWorkbenchLayoutService as Pe}from"../../layout/browser/layoutService.js";import{IExtensionResourceLoaderService as Le}from"../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js";import{ThemeRegistry as P,registerColorThemeExtensionPoint as be,registerFileIconThemeExtensionPoint as Fe,registerProductIconThemeExtensionPoint as _e}from"../common/themeExtensionPoints.js";import{updateColorThemeConfigurationSchemas as V,updateFileIconThemeConfigurationSchemas as J,ThemeConfiguration as De,updateProductIconThemeConfigurationSchemas as Y}from"../common/themeConfiguration.js";import{ProductIconThemeData as p,DEFAULT_PRODUCT_ICON_THEME_ID as L}from"./productIconThemeData.js";import{registerProductIconThemeSchemas as we}from"../common/productIconThemeSchema.js";import{ILogService as xe}from"../../../../platform/log/common/log.js";import{isWeb as ke}from"../../../../base/common/platform.js";import{ColorScheme as b}from"../../../../platform/theme/common/theme.js";import{IHostColorSchemeService as We}from"../common/hostColorSchemeService.js";import{RunOnceScheduler as Me,Sequencer as F}from"../../../../base/common/async.js";import{IUserDataInitializationService as He}from"../../userData/browser/userDataInit.js";import{getIconsStyleSheet as Oe}from"../../../../platform/theme/browser/iconsStyleSheet.js";import{asCssVariableName as Ae,getColorRegistry as Z}from"../../../../platform/theme/common/colorRegistry.js";import{ILanguageService as Ue}from"../../../../editor/common/languages/language.js";import{mainWindow as Ne}from"../../../../base/browser/window.js";const y="vscode-theme-defaults",_="vscode.vscode-theme-seti-vs-seti",Q="file-icons-enabled",qe="contributedColorTheme",Be="contributedFileIconTheme",ze="contributedProductIconTheme",X=de.as(Ie.ThemingContribution);function je(l){switch(l){case N:return`vs ${y}-themes-light_vs-json`;case q:return`vs-dark ${y}-themes-dark_vs-json`;case B:return`hc-black ${y}-themes-hc_black-json`;case z:return`hc-light ${y}-themes-hc_light-json`}return l}const Ge=be(),Ke=Fe(),$e=_e();let C=class extends fe{constructor(e,t,n,o,i,r,h,u,x,ee,Ve,te){super();this.storageService=t;this.configurationService=n;this.telemetryService=o;this.environmentService=i;this.extensionResourceLoaderService=h;this.logService=x;this.hostColorService=ee;this.userDataInitializationService=Ve;this.languageService=te;this.container=u.mainContainer,this.settings=new De(n,ee),this.colorThemeRegistry=this._register(new P(Ge,g.fromExtensionTheme)),this.colorThemeWatcher=this._register(new D(r,i,this.reloadCurrentColorTheme.bind(this))),this.onColorThemeChange=new E({leakWarningThreshold:400}),this.currentColorTheme=g.createUnloadedTheme(""),this.colorThemeSequencer=new F,this.fileIconThemeWatcher=this._register(new D(r,i,this.reloadCurrentFileIconTheme.bind(this))),this.fileIconThemeRegistry=this._register(new P(Ke,f.fromExtensionTheme,!0,f.noIconTheme)),this.fileIconThemeLoader=new pe(h,te),this.onFileIconThemeChange=new E({leakWarningThreshold:400}),this.currentFileIconTheme=f.createUnloadedTheme(""),this.fileIconThemeSequencer=new F,this.productIconThemeWatcher=this._register(new D(r,i,this.reloadCurrentProductIconTheme.bind(this))),this.productIconThemeRegistry=this._register(new P($e,p.fromExtensionTheme,!0,p.defaultTheme)),this.onProductIconThemeChange=new E,this.currentProductIconTheme=p.createUnloadedTheme(""),this.productIconThemeSequencer=new F,this._register(this.onDidColorThemeChange(T=>Z().notifyThemeUpdate(T)));let m=g.fromStorageData(this.storageService);const v=this.settings.colorTheme;m&&v!==m.settingsId&&this.settings.isDefaultColorTheme()&&(this.hasDefaultUpdated=m.settingsId===d.COLOR_THEME_DARK_OLD||m.settingsId===d.COLOR_THEME_LIGHT_OLD,m=void 0);const k=v===d.COLOR_THEME_LIGHT?ae:v===d.COLOR_THEME_DARK?ce:void 0;if(!m){const T=i.options?.initialColorTheme;T&&(m=g.createUnloadedThemeForThemeType(T.themeType,T.colors??k))}m||(m=g.createUnloadedThemeForThemeType(ke?b.LIGHT:b.DARK,k)),m.setCustomizations(this.settings),this.applyTheme(m,void 0,!0);const W=f.fromStorageData(this.storageService);W&&this.applyAndSetFileIconTheme(W,!0);const M=p.fromStorageData(this.storageService);M&&this.applyAndSetProductIconTheme(M,!0),e.whenInstalledExtensionsRegistered().then(T=>{this.installConfigurationListener(),this.installPreferredSchemeListener(),this.installRegistryListeners(),this.initialize().catch(ue.onUnexpectedError)});const H=K();H.id="codiconStyles";const O=this._register(Oe(this));function ie(){H.textContent=O.getCSS()}const A=this._register(new Me(ie,0));this._register(O.onDidChange(()=>A.schedule())),A.schedule()}container;settings;colorThemeRegistry;currentColorTheme;onColorThemeChange;colorThemeWatcher;colorThemingParticipantChangeListener;colorThemeSequencer;fileIconThemeRegistry;currentFileIconTheme;onFileIconThemeChange;fileIconThemeLoader;fileIconThemeWatcher;fileIconThemeSequencer;productIconThemeRegistry;currentProductIconTheme;onProductIconThemeChange;productIconThemeWatcher;productIconThemeSequencer;hasDefaultUpdated=!1;initialize(){const e=this.environmentService.extensionDevelopmentLocationURI,t=e&&e.length===1?e[0]:void 0,n=async()=>{const r=this.colorThemeRegistry.findThemeByExtensionLocation(t);if(r.length){const u=r.find(x=>x.type===this.currentColorTheme.type);return this.setColorTheme(u?u.id:r[0].id,void 0)}let h=this.colorThemeRegistry.findThemeBySettingsId(this.settings.colorTheme,void 0);if(!h){await this.userDataInitializationService.whenInitializationFinished();const u=this.currentColorTheme.type===b.LIGHT?d.COLOR_THEME_LIGHT:d.COLOR_THEME_DARK;h=this.colorThemeRegistry.findThemeBySettingsId(this.settings.colorTheme,u)}return this.setColorTheme(h&&h.id,void 0)},o=async()=>{const r=this.fileIconThemeRegistry.findThemeByExtensionLocation(t);if(r.length)return this.setFileIconTheme(r[0].id,j.MEMORY);let h=this.fileIconThemeRegistry.findThemeBySettingsId(this.settings.fileIconTheme);return h||(await this.userDataInitializationService.whenInitializationFinished(),h=this.fileIconThemeRegistry.findThemeBySettingsId(this.settings.fileIconTheme)),this.setFileIconTheme(h?h.id:_,void 0)},i=async()=>{const r=this.productIconThemeRegistry.findThemeByExtensionLocation(t);if(r.length)return this.setProductIconTheme(r[0].id,j.MEMORY);let h=this.productIconThemeRegistry.findThemeBySettingsId(this.settings.productIconTheme);return h||(await this.userDataInitializationService.whenInitializationFinished(),h=this.productIconThemeRegistry.findThemeBySettingsId(this.settings.productIconTheme)),this.setProductIconTheme(h?h.id:L,void 0)};return Promise.all([n(),o(),i()])}installConfigurationListener(){this._register(this.configurationService.onDidChangeConfiguration(e=>{if((e.affectsConfiguration(a.COLOR_THEME)||e.affectsConfiguration(a.PREFERRED_DARK_THEME)||e.affectsConfiguration(a.PREFERRED_LIGHT_THEME)||e.affectsConfiguration(a.PREFERRED_HC_DARK_THEME)||e.affectsConfiguration(a.PREFERRED_HC_LIGHT_THEME)||e.affectsConfiguration(a.DETECT_COLOR_SCHEME)||e.affectsConfiguration(a.DETECT_HC)||e.affectsConfiguration(a.SYSTEM_COLOR_THEME))&&this.restoreColorTheme(),e.affectsConfiguration(a.FILE_ICON_THEME)&&this.restoreFileIconTheme(),e.affectsConfiguration(a.PRODUCT_ICON_THEME)&&this.restoreProductIconTheme(),this.currentColorTheme){let t=!1;e.affectsConfiguration(a.COLOR_CUSTOMIZATIONS)&&(this.currentColorTheme.setCustomColors(this.settings.colorCustomizations),t=!0),e.affectsConfiguration(a.TOKEN_COLOR_CUSTOMIZATIONS)&&(this.currentColorTheme.setCustomTokenColors(this.settings.tokenColorCustomizations),t=!0),e.affectsConfiguration(a.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS)&&(this.currentColorTheme.setCustomSemanticTokenColors(this.settings.semanticTokenColorCustomizations),t=!0),t&&(this.updateDynamicCSSRules(this.currentColorTheme),this.onColorThemeChange.fire(this.currentColorTheme))}}))}installRegistryListeners(){let e;this._register(this.colorThemeRegistry.onDidChange(async o=>{if(V(o.themes),await this.restoreColorTheme())this.currentColorTheme.settingsId===d.COLOR_THEME_DARK&&!I.isUndefined(e)&&await this.colorThemeRegistry.findThemeById(e)?(await this.setColorTheme(e,"auto"),e=void 0):o.added.some(i=>i.settingsId===this.currentColorTheme.settingsId)&&await this.reloadCurrentColorTheme();else if(o.removed.some(i=>i.settingsId===this.currentColorTheme.settingsId)){e=this.currentColorTheme.id;const i=this.colorThemeRegistry.findThemeBySettingsId(d.COLOR_THEME_DARK);await this.setColorTheme(i,"auto")}}));let t;this._register(this._register(this.fileIconThemeRegistry.onDidChange(async o=>{J(o.themes),await this.restoreFileIconTheme()?this.currentFileIconTheme.id===_&&!I.isUndefined(t)&&this.fileIconThemeRegistry.findThemeById(t)?(await this.setFileIconTheme(t,"auto"),t=void 0):o.added.some(i=>i.settingsId===this.currentFileIconTheme.settingsId)&&await this.reloadCurrentFileIconTheme():o.removed.some(i=>i.settingsId===this.currentFileIconTheme.settingsId)&&(t=this.currentFileIconTheme.id,await this.setFileIconTheme(_,"auto"))})));let n;return this._register(this.productIconThemeRegistry.onDidChange(async o=>{Y(o.themes),await this.restoreProductIconTheme()?this.currentProductIconTheme.id===L&&!I.isUndefined(n)&&this.productIconThemeRegistry.findThemeById(n)?(await this.setProductIconTheme(n,"auto"),n=void 0):o.added.some(i=>i.settingsId===this.currentProductIconTheme.settingsId)&&await this.reloadCurrentProductIconTheme():o.removed.some(i=>i.settingsId===this.currentProductIconTheme.settingsId)&&(n=this.currentProductIconTheme.id,await this.setProductIconTheme(L,"auto"))})),this._register(this.languageService.onDidChange(()=>this.reloadCurrentFileIconTheme())),Promise.all([this.getColorThemes(),this.getFileIconThemes(),this.getProductIconThemes()]).then(([o,i,r])=>{V(o),J(i),Y(r)})}installPreferredSchemeListener(){this._register(this.hostColorService.onDidChangeColorScheme(()=>{this.settings.isDetectingColorScheme()&&this.restoreColorTheme()}))}hasUpdatedDefaultThemes(){return this.hasDefaultUpdated}getColorTheme(){return this.currentColorTheme}async getColorThemes(){return this.colorThemeRegistry.getThemes()}getPreferredColorScheme(){return this.settings.getPreferredColorScheme()}async getMarketplaceColorThemes(e,t,n){const o=this.extensionResourceLoaderService.getExtensionGalleryResourceURL({publisher:e,name:t,version:n},"extension");if(o)try{const i=await this.extensionResourceLoaderService.readExtensionResource(S.joinPath(o,"package.json"));return this.colorThemeRegistry.getMarketplaceThemes(JSON.parse(i),o,R.fromName(e,t))}catch(i){this.logService.error("Problem loading themes from marketplace",i)}return[]}get onDidColorThemeChange(){return this.onColorThemeChange.event}setColorTheme(e,t){return this.colorThemeSequencer.queue(async()=>this.internalSetColorTheme(e,t))}async internalSetColorTheme(e,t){if(!e)return null;const n=I.isString(e)?je(e):e.id;if(this.currentColorTheme.isLoaded&&n===this.currentColorTheme.id)return t!=="preview"&&this.currentColorTheme.toStorage(this.storageService),this.settings.setColorTheme(this.currentColorTheme,t);let o=this.colorThemeRegistry.findThemeById(n);if(!o)if(e instanceof g)o=e;else return null;try{return await o.ensureLoaded(this.extensionResourceLoaderService),o.setCustomizations(this.settings),this.applyTheme(o,t)}catch(i){throw new Error(re.localize("error.cannotloadtheme","Unable to load {0}: {1}",o.location?.toString(),i.message))}}reloadCurrentColorTheme(){return this.colorThemeSequencer.queue(async()=>{try{const e=this.colorThemeRegistry.findThemeBySettingsId(this.currentColorTheme.settingsId)||this.currentColorTheme;await e.reload(this.extensionResourceLoaderService),e.setCustomizations(this.settings),await this.applyTheme(e,void 0,!1)}catch{this.logService.info("Unable to reload {0}: {1}",this.currentColorTheme.location?.toString())}})}async restoreColorTheme(){return this.colorThemeSequencer.queue(async()=>{const e=this.settings.colorTheme,t=this.colorThemeRegistry.findThemeBySettingsId(e);return t?(e!==this.currentColorTheme.settingsId?await this.internalSetColorTheme(t.id,void 0):t!==this.currentColorTheme&&(await t.ensureLoaded(this.extensionResourceLoaderService),t.setCustomizations(this.settings),await this.applyTheme(t,void 0,!0)),!0):!1})}updateDynamicCSSRules(e){const t=new Set,n={addRule:i=>{t.has(i)||t.add(i)}};n.addRule(".monaco-workbench { forced-color-adjust: none; }"),X.getThemingParticipants().forEach(i=>i(e,n,this.environmentService));const o=[];for(const i of Z().getColors()){const r=e.getColor(i.id,!0);r&&o.push(`${Ae(i.id)}: ${r.toString()};`)}n.addRule(`.monaco-workbench { ${o.join(`
`)} }`),w([...t].join(`
`),qe)}applyTheme(e,t,n=!1){return this.updateDynamicCSSRules(e),this.currentColorTheme.id?this.container.classList.remove(...this.currentColorTheme.classNames):this.container.classList.remove(q,N,B,z),this.container.classList.add(...e.classNames),this.currentColorTheme.clearCaches(),this.currentColorTheme=e,this.colorThemingParticipantChangeListener||(this.colorThemingParticipantChangeListener=X.onThemingParticipantAdded(o=>this.updateDynamicCSSRules(this.currentColorTheme))),this.colorThemeWatcher.update(e),this.sendTelemetry(e.id,e.extensionData,"color"),n?Promise.resolve(null):(this.onColorThemeChange.fire(this.currentColorTheme),e.isLoaded&&t!=="preview"&&e.toStorage(this.storageService),this.settings.setColorTheme(this.currentColorTheme,t))}themeExtensionsActivated=new Map;sendTelemetry(e,t,n){if(t){const o=n+t.extensionId;this.themeExtensionsActivated.get(o)||(this.telemetryService.publicLog2("activatePlugin",{id:t.extensionId,name:t.extensionName,isBuiltin:t.extensionIsBuiltin,publisherDisplayName:t.extensionPublisher,themeId:e}),this.themeExtensionsActivated.set(o,!0))}}async getFileIconThemes(){return this.fileIconThemeRegistry.getThemes()}getFileIconTheme(){return this.currentFileIconTheme}get onDidFileIconThemeChange(){return this.onFileIconThemeChange.event}async setFileIconTheme(e,t){return this.fileIconThemeSequencer.queue(async()=>this.internalSetFileIconTheme(e,t))}async internalSetFileIconTheme(e,t){e===void 0&&(e="");const n=I.isString(e)?e:e.id;if(n!==this.currentFileIconTheme.id||!this.currentFileIconTheme.isLoaded){let i=this.fileIconThemeRegistry.findThemeById(n);!i&&e instanceof f&&(i=e),i||(i=f.noIconTheme),await i.ensureLoaded(this.fileIconThemeLoader),this.applyAndSetFileIconTheme(i)}const o=this.currentFileIconTheme;return o.isLoaded&&t!=="preview"&&(!o.location||!$(o.location))&&o.toStorage(this.storageService),await this.settings.setFileIconTheme(this.currentFileIconTheme,t),o}async getMarketplaceFileIconThemes(e,t,n){const o=this.extensionResourceLoaderService.getExtensionGalleryResourceURL({publisher:e,name:t,version:n},"extension");if(o)try{const i=await this.extensionResourceLoaderService.readExtensionResource(S.joinPath(o,"package.json"));return this.fileIconThemeRegistry.getMarketplaceThemes(JSON.parse(i),o,R.fromName(e,t))}catch(i){this.logService.error("Problem loading themes from marketplace",i)}return[]}async reloadCurrentFileIconTheme(){return this.fileIconThemeSequencer.queue(async()=>{await this.currentFileIconTheme.reload(this.fileIconThemeLoader),this.applyAndSetFileIconTheme(this.currentFileIconTheme)})}async restoreFileIconTheme(){return this.fileIconThemeSequencer.queue(async()=>{const e=this.settings.fileIconTheme,t=this.fileIconThemeRegistry.findThemeBySettingsId(e);return t?(e!==this.currentFileIconTheme.settingsId?await this.internalSetFileIconTheme(t.id,void 0):t!==this.currentFileIconTheme&&(await t.ensureLoaded(this.fileIconThemeLoader),this.applyAndSetFileIconTheme(t,!0)),!0):!1})}applyAndSetFileIconTheme(e,t=!1){this.currentFileIconTheme=e,w(e.styleSheetContent,Be),e.id?this.container.classList.add(Q):this.container.classList.remove(Q),this.fileIconThemeWatcher.update(e),e.id&&this.sendTelemetry(e.id,e.extensionData,"fileIcon"),t||this.onFileIconThemeChange.fire(this.currentFileIconTheme)}async getProductIconThemes(){return this.productIconThemeRegistry.getThemes()}getProductIconTheme(){return this.currentProductIconTheme}get onDidProductIconThemeChange(){return this.onProductIconThemeChange.event}async setProductIconTheme(e,t){return this.productIconThemeSequencer.queue(async()=>this.internalSetProductIconTheme(e,t))}async internalSetProductIconTheme(e,t){e===void 0&&(e="");const n=I.isString(e)?e:e.id;if(n!==this.currentProductIconTheme.id||!this.currentProductIconTheme.isLoaded){let i=this.productIconThemeRegistry.findThemeById(n);!i&&e instanceof p&&(i=e),i||(i=p.defaultTheme),await i.ensureLoaded(this.extensionResourceLoaderService,this.logService),this.applyAndSetProductIconTheme(i)}const o=this.currentProductIconTheme;return o.isLoaded&&t!=="preview"&&(!o.location||!$(o.location))&&o.toStorage(this.storageService),await this.settings.setProductIconTheme(this.currentProductIconTheme,t),o}async getMarketplaceProductIconThemes(e,t,n){const o=this.extensionResourceLoaderService.getExtensionGalleryResourceURL({publisher:e,name:t,version:n},"extension");if(o)try{const i=await this.extensionResourceLoaderService.readExtensionResource(S.joinPath(o,"package.json"));return this.productIconThemeRegistry.getMarketplaceThemes(JSON.parse(i),o,R.fromName(e,t))}catch(i){this.logService.error("Problem loading themes from marketplace",i)}return[]}async reloadCurrentProductIconTheme(){return this.productIconThemeSequencer.queue(async()=>{await this.currentProductIconTheme.reload(this.extensionResourceLoaderService,this.logService),this.applyAndSetProductIconTheme(this.currentProductIconTheme)})}async restoreProductIconTheme(){return this.productIconThemeSequencer.queue(async()=>{const e=this.settings.productIconTheme,t=this.productIconThemeRegistry.findThemeBySettingsId(e);return t?(e!==this.currentProductIconTheme.settingsId?await this.internalSetProductIconTheme(t.id,void 0):t!==this.currentProductIconTheme&&(await t.ensureLoaded(this.extensionResourceLoaderService,this.logService),this.applyAndSetProductIconTheme(t,!0)),!0):!1})}applyAndSetProductIconTheme(e,t=!1){this.currentProductIconTheme=e,w(e.styleSheetContent,ze),this.productIconThemeWatcher.update(e),e.id&&this.sendTelemetry(e.id,e.extensionData,"productIcon"),t||this.onProductIconThemeChange.fire(this.currentProductIconTheme)}};C=U([c(0,se),c(1,le),c(2,Te),c(3,me),c(4,Ce),c(5,Se),c(6,Le),c(7,Pe),c(8,xe),c(9,We),c(10,He),c(11,Ue)],C);class D{constructor(s,e,t){this.fileService=s;this.environmentService=e;this.onUpdate=t}watchedLocation;watcherDisposable;fileChangeListener;update(s){S.isEqual(s.location,this.watchedLocation)||(this.dispose(),s.location&&(s.watch||this.environmentService.isExtensionDevelopment)&&(this.watchedLocation=s.location,this.watcherDisposable=this.fileService.watch(s.location),this.fileService.onDidFilesChange(e=>{this.watchedLocation&&e.contains(this.watchedLocation,ye.UPDATED)&&this.onUpdate()})))}dispose(){this.watcherDisposable=G(this.watcherDisposable),this.fileChangeListener=G(this.fileChangeListener),this.watchedLocation=void 0}}function w(l,s){const e=Ne.document.head.getElementsByClassName(s);if(e.length===0){const t=K();t.className=s,t.textContent=l}else e[0].textContent=l}ve(),ge(),we(),Ee(he,C,Re.Eager);export{C as WorkbenchThemeService};
