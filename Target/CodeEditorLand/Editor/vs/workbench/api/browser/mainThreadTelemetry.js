var p=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var u=(i,t,e)=>t in i?p(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var a=(i,t,e,r)=>{for(var o=r>1?void 0:r?S(t,e):t,v=i.length-1,m;v>=0;v--)(m=i[v])&&(o=(r?m(t,e,o):m(o))||o);return r&&o&&p(t,e,o),o},s=(i,t)=>(e,r)=>t(e,r,i);var y=(i,t,e)=>u(i,typeof t!="symbol"?t+"":t,e);import{Disposable as f}from"../../../../vs/base/common/lifecycle.js";import{IConfigurationService as _}from"../../../../vs/platform/configuration/common/configuration.js";import{IEnvironmentService as d}from"../../../../vs/platform/environment/common/environment.js";import{IProductService as h}from"../../../../vs/platform/product/common/productService.js";import"../../../../vs/platform/telemetry/common/gdprTypings.js";import{ITelemetryService as E,TELEMETRY_OLD_SETTING_ID as x,TELEMETRY_SETTING_ID as g,TelemetryLevel as T}from"../../../../vs/platform/telemetry/common/telemetry.js";import{supportsTelemetry as c}from"../../../../vs/platform/telemetry/common/telemetryUtils.js";import{extHostNamedCustomer as C}from"../../../../vs/workbench/services/extensions/common/extHostCustomers.js";import{ExtHostContext as I,MainContext as L}from"../common/extHost.protocol.js";let n=class extends f{constructor(e,r,o,v,m){super();this._telemetryService=r;this._configurationService=o;this._environmentService=v;this._productService=m;this._proxy=e.getProxy(I.ExtHostTelemetry),c(this._productService,this._environmentService)&&this._register(this._configurationService.onDidChangeConfiguration(l=>{(l.affectsConfiguration(g)||l.affectsConfiguration(x))&&this._proxy.$onDidChangeTelemetryLevel(this.telemetryLevel)})),this._proxy.$initializeTelemetryLevel(this.telemetryLevel,c(this._productService,this._environmentService),this._productService.enabledTelemetryLevels)}_proxy;get telemetryLevel(){return c(this._productService,this._environmentService)?this._telemetryService.telemetryLevel:T.NONE}$publicLog(e,r=Object.create(null)){r[n._name]=!0,this._telemetryService.publicLog(e,r)}$publicLog2(e,r){this.$publicLog(e,r)}};y(n,"_name","pluginHostTelemetry"),n=a([C(L.MainThreadTelemetry),s(1,E),s(2,_),s(3,d),s(4,h)],n);export{n as MainThreadTelemetry};
