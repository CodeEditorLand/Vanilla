var d=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var m=(i,r,t,s)=>{for(var o=s>1?void 0:s?h(r,t):r,a=i.length-1,n;a>=0;a--)(n=i[a])&&(o=(s?n(r,t,o):n(o))||o);return s&&o&&d(r,t,o),o},p=(i,r)=>(t,s)=>r(t,s,i);import{InstantiationType as I,registerSingleton as c}from"../../../../../vs/platform/instantiation/common/extensions.js";import{INativeHostService as f}from"../../../../../vs/platform/native/common/native.js";import"../../../../../vs/platform/theme/common/themeService.js";import{registerWorkbenchContribution2 as v,WorkbenchPhase as S}from"../../../../../vs/workbench/common/contributions.js";import{PartsSplash as l}from"../../../../../vs/workbench/contrib/splash/browser/partsSplash.js";import{ISplashStorageService as P}from"../../../../../vs/workbench/contrib/splash/browser/splash.js";let e=class{_serviceBrand;saveWindowSplash;constructor(r){this.saveWindowSplash=r.saveWindowSplash.bind(r)}};e=m([p(0,f)],e),c(P,e,I.Delayed),v(l.ID,l,S.BlockStartup);
