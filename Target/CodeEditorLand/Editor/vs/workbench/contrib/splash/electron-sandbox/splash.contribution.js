var h=Object.defineProperty;var d=Object.getOwnPropertyDescriptor;var n=(t,o,s,e)=>{for(var r=e>1?void 0:e?d(o,s):o,a=t.length-1,m;a>=0;a--)(m=t[a])&&(r=(e?m(o,s,r):m(r))||r);return e&&r&&h(o,s,r),r},p=(t,o)=>(s,e)=>o(s,e,t);import{InstantiationType as c,registerSingleton as f}from"../../../../platform/instantiation/common/extensions.js";import{INativeHostService as I}from"../../../../platform/native/common/native.js";import{WorkbenchPhase as v,registerWorkbenchContribution2 as S}from"../../../common/contributions.js";import{PartsSplash as l}from"../browser/partsSplash.js";import{ISplashStorageService as P}from"../browser/splash.js";let i=class{_serviceBrand;saveWindowSplash;constructor(o){this.saveWindowSplash=o.saveWindowSplash.bind(o)}};i=n([p(0,I)],i),f(P,i,c.Delayed),S(l.ID,l,v.BlockStartup);
