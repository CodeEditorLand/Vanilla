var a=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var n=(h,e,t,o)=>{for(var r=o>1?void 0:o?x(e,t):e,s=h.length-1,m;s>=0;s--)(m=h[s])&&(r=(o?m(e,t,r):m(r))||r);return o&&r&&a(e,t,r),r},p=(h,e)=>(t,o)=>e(t,o,h);import"../../../../vs/base/common/lifecycle.js";import{IThemeService as C}from"../../../../vs/platform/theme/common/themeService.js";import{extHostNamedCustomer as g}from"../../../../vs/workbench/services/extensions/common/extHostCustomers.js";import{ExtHostContext as l,MainContext as v}from"../common/extHost.protocol.js";let i=class{_themeService;_proxy;_themeChangeListener;constructor(e,t){this._themeService=t,this._proxy=e.getProxy(l.ExtHostTheming),this._themeChangeListener=this._themeService.onDidColorThemeChange(o=>{this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type)}),this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type)}dispose(){this._themeChangeListener.dispose()}};i=n([g(v.MainThreadTheming),p(1,C)],i);export{i as MainThreadTheming};
