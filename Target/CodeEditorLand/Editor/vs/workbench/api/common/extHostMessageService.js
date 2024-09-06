var u=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var v=(t,e,n,o)=>{for(var s=o>1?void 0:o?h(e,n):e,a=t.length-1,i;a>=0;a--)(i=t[a])&&(s=(o?i(e,n,s):i(s))||s);return o&&s&&u(e,n,s),s},p=(t,e)=>(n,o)=>e(n,o,t);import"../../../base/common/severity.js";import"../../../platform/extensions/common/extensions.js";import{ILogService as y}from"../../../platform/log/common/log.js";import{checkProposedApiEnabled as I}from"../../services/extensions/common/extensions.js";import{MainContext as C}from"./extHost.protocol.js";function S(t){return t&&t.title}let c=class{constructor(e,n){this._logService=n;this._proxy=e.getProxy(C.MainThreadMessageService)}_proxy;showMessage(e,n,o,s,a){const i={source:{identifier:e.identifier,label:e.displayName||e.name}};let g;typeof s=="string"||S(s)?g=[s,...a]:(i.modal=s?.modal,i.useCustom=s?.useCustom,i.detail=s?.detail,g=a),i.useCustom&&I(e,"resolvers");const m=[];let f=!1;for(let r=0;r<g.length;r++){const d=g[r];if(typeof d=="string")m.push({title:d,handle:r,isCloseAffordance:!1});else if(typeof d=="object"){const{title:M,isCloseAffordance:l}=d;m.push({title:M,isCloseAffordance:!!l,handle:r}),l&&(f?this._logService.warn(`[${e.identifier}] Only one message item can have 'isCloseAffordance':`,d):f=!0)}else this._logService.warn(`[${e.identifier}] Invalid message item:`,d)}return this._proxy.$showMessage(n,o,i,m).then(r=>{if(typeof r=="number")return g[r]})}};c=v([p(1,y)],c);export{c as ExtHostMessageService};
