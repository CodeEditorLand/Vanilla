var m=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var d=(t,r,o,n)=>{for(var i=n>1?void 0:n?v(r,o):r,a=t.length-1,s;a>=0;a--)(s=t[a])&&(i=(n?s(r,o,i):s(i))||i);return n&&i&&m(r,o,i),i},c=(t,r)=>(o,n)=>r(o,n,t);import{getZoomLevel as u}from"../../../../base/browser/browser.js";import{mainWindow as p}from"../../../../base/browser/window.js";import{platform as g}from"../../../../base/common/process.js";import{InstantiationType as S,registerSingleton as h}from"../../../../platform/instantiation/common/extensions.js";import{IProcessMainService as k}from"../../../../platform/issue/common/issue.js";import{IProductService as f}from"../../../../platform/product/common/productService.js";import{activeContrastBorder as B,editorBackground as b,editorForeground as F,listActiveSelectionBackground as I,listActiveSelectionForeground as C,listFocusBackground as y,listFocusForeground as P,listFocusOutline as H,listHoverBackground as A,listHoverForeground as E,scrollbarShadow as T,scrollbarSliderActiveBackground as x,scrollbarSliderBackground as W,scrollbarSliderHoverBackground as M}from"../../../../platform/theme/common/colorRegistry.js";import{IThemeService as N}from"../../../../platform/theme/common/themeService.js";import{INativeWorkbenchEnvironmentService as w}from"../../../services/environment/electron-sandbox/environmentService.js";import{IWorkbenchProcessService as D}from"../common/issue.js";let l=class{constructor(r,o,n,i){this.processMainService=r;this.themeService=o;this.environmentService=n;this.productService=i}openProcessExplorer(){const r=this.themeService.getColorTheme(),o={pid:this.environmentService.mainPid,zoomLevel:u(p),styles:{backgroundColor:e(r,b),color:e(r,F),listHoverBackground:e(r,A),listHoverForeground:e(r,E),listFocusBackground:e(r,y),listFocusForeground:e(r,P),listFocusOutline:e(r,H),listActiveSelectionBackground:e(r,I),listActiveSelectionForeground:e(r,C),listHoverOutline:e(r,B),scrollbarShadowColor:e(r,T),scrollbarSliderActiveBackgroundColor:e(r,x),scrollbarSliderBackgroundColor:e(r,W),scrollbarSliderHoverBackgroundColor:e(r,M)},platform:g,applicationName:this.productService.applicationName};return this.processMainService.openProcessExplorer(o)}};l=d([c(0,k),c(1,N),c(2,w),c(3,f)],l);function e(t,r){const o=t.getColor(r);return o?o.toString():void 0}h(D,l,S.Delayed);export{l as ProcessService};
