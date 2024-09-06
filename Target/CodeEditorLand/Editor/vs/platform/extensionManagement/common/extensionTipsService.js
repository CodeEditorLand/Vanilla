var R=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var B=(l,p,e,n)=>{for(var t=n>1?void 0:n?C(p,e):p,i=l.length-1,s;i>=0;i--)(s=l[i])&&(t=(n?s(p,e,t):s(t))||t);return n&&t&&R(p,e,t),t},y=(l,p)=>(e,n)=>p(e,n,l);import{isNonEmptyArray as k}from"../../../base/common/arrays.js";import{disposableTimeout as g}from"../../../base/common/async.js";import"../../../base/common/collections.js";import{Event as E}from"../../../base/common/event.js";import{Disposable as F,MutableDisposable as f}from"../../../base/common/lifecycle.js";import{join as P}from"../../../base/common/path.js";import{isWindows as L}from"../../../base/common/platform.js";import{env as I}from"../../../base/common/process.js";import"../../../base/common/product.js";import{joinPath as A}from"../../../base/common/resources.js";import{URI as O}from"../../../base/common/uri.js";import{RecommendationsNotificationResult as d,RecommendationSource as D}from"../../extensionRecommendations/common/extensionRecommendations.js";import{ExtensionType as W}from"../../extensions/common/extensions.js";import{IFileService as V}from"../../files/common/files.js";import{IProductService as U}from"../../product/common/productService.js";import{StorageScope as w,StorageTarget as N}from"../../storage/common/storage.js";import"../../telemetry/common/telemetry.js";import"./extensionManagement.js";import{areSameExtensions as _}from"./extensionManagementUtil.js";let T=class extends F{constructor(e,n){super();this.fileService=e;this.productService=n;this.productService.configBasedExtensionTips&&Object.entries(this.productService.configBasedExtensionTips).forEach(([,t])=>this.allConfigBasedTips.set(t.configPath,t))}_serviceBrand;allConfigBasedTips=new Map;getConfigBasedTips(e){return this.getValidConfigBasedTips(e)}async getImportantExecutableBasedTips(){return[]}async getOtherExecutableBasedTips(){return[]}async getValidConfigBasedTips(e){const n=[];for(const[t,i]of this.allConfigBasedTips)if(!(i.configScheme&&i.configScheme!==e.scheme))try{const s=(await this.fileService.readFile(A(e,t))).value.toString();for(const[a,o]of Object.entries(i.recommendations))(!o.contentPattern||new RegExp(o.contentPattern,"mig").test(s))&&n.push({extensionId:a,extensionName:o.name,configName:i.configName,important:!!o.important,isExtensionPack:!!o.isExtensionPack,whenNotInstalled:o.whenNotInstalled})}catch{}return n}};T=B([y(0,V),y(1,U)],T);const S="extensionTips/promptedExecutableTips",M="extensionTips/lastPromptedMediumImpExeTime";class Ie extends T{constructor(e,n,t,i,s,a,o,r){super(o,r);this.userHome=e;this.windowEvents=n;this.telemetryService=t;this.extensionManagementService=i;this.storageService=s;this.extensionRecommendationNotificationService=a;r.exeBasedExtensionTips&&Object.entries(r.exeBasedExtensionTips).forEach(([c,m])=>{const h=[],u=[],b=[];Object.entries(m.recommendations).forEach(([v,x])=>{x.important?m.important?h.push({extensionId:v,extensionName:x.name,isExtensionPack:!!x.isExtensionPack}):u.push({extensionId:v,extensionName:x.name,isExtensionPack:!!x.isExtensionPack}):b.push({extensionId:v,extensionName:x.name,isExtensionPack:!!x.isExtensionPack})}),h.length&&this.highImportanceExecutableTips.set(c,{exeFriendlyName:m.friendlyName,windowsPath:m.windowsPath,recommendations:h}),u.length&&this.mediumImportanceExecutableTips.set(c,{exeFriendlyName:m.friendlyName,windowsPath:m.windowsPath,recommendations:u}),b.length&&this.allOtherExecutableTips.set(c,{exeFriendlyName:m.friendlyName,windowsPath:m.windowsPath,recommendations:b})}),g(async()=>{await this.collectTips(),this.promptHighImportanceExeBasedTip(),this.promptMediumImportanceExeBasedTip()},3e3,this._store)}highImportanceExecutableTips=new Map;mediumImportanceExecutableTips=new Map;allOtherExecutableTips=new Map;highImportanceTipsByExe=new Map;mediumImportanceTipsByExe=new Map;async getImportantExecutableBasedTips(){const e=await this.getValidExecutableBasedExtensionTips(this.highImportanceExecutableTips),n=await this.getValidExecutableBasedExtensionTips(this.mediumImportanceExecutableTips);return[...e,...n]}getOtherExecutableBasedTips(){return this.getValidExecutableBasedExtensionTips(this.allOtherExecutableTips)}async collectTips(){const e=await this.getValidExecutableBasedExtensionTips(this.highImportanceExecutableTips),n=await this.getValidExecutableBasedExtensionTips(this.mediumImportanceExecutableTips),t=await this.extensionManagementService.getInstalled();this.highImportanceTipsByExe=this.groupImportantTipsByExe(e,t),this.mediumImportanceTipsByExe=this.groupImportantTipsByExe(n,t)}groupImportantTipsByExe(e,n){const t=new Map;e.forEach(r=>t.set(r.extensionId.toLowerCase(),r));const{installed:i,uninstalled:s}=this.groupByInstalled([...t.keys()],n);for(const r of i){const c=t.get(r);c&&this.telemetryService.publicLog2("exeExtensionRecommendations:alreadyInstalled",{extensionId:r,exeName:c.exeName})}for(const r of s){const c=t.get(r);c&&this.telemetryService.publicLog2("exeExtensionRecommendations:notInstalled",{extensionId:r,exeName:c.exeName})}const a=this.getPromptedExecutableTips(),o=new Map;for(const r of s){const c=t.get(r);if(c&&(!a[c.exeName]||!a[c.exeName].includes(c.extensionId))){let m=o.get(c.exeName);m||(m=[],o.set(c.exeName,m)),m.push(c)}}return o}promptHighImportanceExeBasedTip(){if(this.highImportanceTipsByExe.size===0)return;const[e,n]=[...this.highImportanceTipsByExe.entries()][0];this.promptExeRecommendations(n).then(t=>{switch(t){case d.Accepted:this.addToRecommendedExecutables(n[0].exeName,n);break;case d.Ignored:this.highImportanceTipsByExe.delete(e);break;case d.IncompatibleWindow:{const i=E.once(E.latch(E.any(this.windowEvents.onDidOpenMainWindow,this.windowEvents.onDidFocusMainWindow)));this._register(i(()=>this.promptHighImportanceExeBasedTip()));break}case d.TooMany:{const i=this._register(new f);i.value=g(()=>{i.dispose(),this.promptHighImportanceExeBasedTip()},60*60*1e3);break}}})}promptMediumImportanceExeBasedTip(){if(this.mediumImportanceTipsByExe.size===0)return;const e=this.getLastPromptedMediumExeTime(),n=Date.now()-e,t=7*24*60*60*1e3;if(n<t){const a=this._register(new f);a.value=g(()=>{a.dispose(),this.promptMediumImportanceExeBasedTip()},t-n);return}const[i,s]=[...this.mediumImportanceTipsByExe.entries()][0];this.promptExeRecommendations(s).then(a=>{switch(a){case d.Accepted:{this.updateLastPromptedMediumExeTime(Date.now()),this.mediumImportanceTipsByExe.delete(i),this.addToRecommendedExecutables(s[0].exeName,s);const o=this._register(new f);o.value=g(()=>{o.dispose(),this.promptMediumImportanceExeBasedTip()},t);break}case d.Ignored:this.mediumImportanceTipsByExe.delete(i),this.promptMediumImportanceExeBasedTip();break;case d.IncompatibleWindow:{const o=E.once(E.latch(E.any(this.windowEvents.onDidOpenMainWindow,this.windowEvents.onDidFocusMainWindow)));this._register(o(()=>this.promptMediumImportanceExeBasedTip()));break}case d.TooMany:{const o=this._register(new f);o.value=g(()=>{o.dispose(),this.promptMediumImportanceExeBasedTip()},60*60*1e3);break}}})}async promptExeRecommendations(e){const n=await this.extensionManagementService.getInstalled(W.User),t=e.filter(i=>!i.whenNotInstalled||i.whenNotInstalled.every(s=>n.every(a=>!_(a.identifier,{id:s})))).map(({extensionId:i})=>i.toLowerCase());return this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification({extensions:t,source:D.EXE,name:e[0].exeFriendlyName,searchValue:`@exe:"${e[0].exeName}"`})}getLastPromptedMediumExeTime(){let e=this.storageService.getNumber(M,w.APPLICATION);return e||(e=Date.now(),this.updateLastPromptedMediumExeTime(e)),e}updateLastPromptedMediumExeTime(e){this.storageService.store(M,e,w.APPLICATION,N.MACHINE)}getPromptedExecutableTips(){return JSON.parse(this.storageService.get(S,w.APPLICATION,"{}"))}addToRecommendedExecutables(e,n){const t=this.getPromptedExecutableTips();t[e]=n.map(({extensionId:i})=>i.toLowerCase()),this.storageService.store(S,JSON.stringify(t),w.APPLICATION,N.USER)}groupByInstalled(e,n){const t=[],i=[],s=n.reduce((a,o)=>(a.add(o.identifier.id.toLowerCase()),a),new Set);return e.forEach(a=>{s.has(a.toLowerCase())?t.push(a):i.push(a)}),{installed:t,uninstalled:i}}async getValidExecutableBasedExtensionTips(e){const n=[],t=new Map;for(const i of e.keys()){const s=e.get(i);if(!s||!k(s.recommendations))continue;const a=[];L?s.windowsPath&&a.push(s.windowsPath.replace("%USERPROFILE%",()=>I.USERPROFILE).replace("%ProgramFiles(x86)%",()=>I["ProgramFiles(x86)"]).replace("%ProgramFiles%",()=>I.ProgramFiles).replace("%APPDATA%",()=>I.APPDATA).replace("%WINDIR%",()=>I.WINDIR)):(a.push(P("/usr/local/bin",i)),a.push(P("/usr/bin",i)),a.push(P(this.userHome.fsPath,i)));for(const o of a){let r=t.get(o);if(r===void 0&&(r=await this.fileService.exists(O.file(o)),t.set(o,r)),r)for(const{extensionId:c,extensionName:m,isExtensionPack:h,whenNotInstalled:u}of s.recommendations)n.push({extensionId:c,extensionName:m,isExtensionPack:h,exeName:i,exeFriendlyName:s.exeFriendlyName,windowsPath:s.windowsPath,whenNotInstalled:u})}}return n}}export{Ie as AbstractNativeExtensionTipsService,T as ExtensionTipsService};
