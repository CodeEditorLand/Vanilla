var d=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var l=(g,r,e,i)=>{for(var o=i>1?void 0:i?m(r,e):r,n=g.length-1,s;n>=0;n--)(s=g[n])&&(o=(i?s(r,e,o):s(o))||o);return i&&o&&d(r,e,o),o},a=(g,r)=>(e,i)=>r(e,i,g);import*as c from"../../../../../nls.js";import{Disposable as p}from"../../../../../base/common/lifecycle.js";import{ILoggerService as h}from"../../../../../platform/log/common/log.js";const I="notebook.rendering";let t=class extends p{_serviceBrand;static ID="notebook";_logger;constructor(r){super(),this._logger=this._register(r.createLogger(I,{name:c.localize("renderChannelName","Notebook")}))}debug(r,e){this._logger.debug(`[${r}] ${e}`)}info(r,e){this._logger.info(`[${r}] ${e}`)}warn(r,e){this._logger.warn(`[${r}] ${e}`)}error(r,e){this._logger.error(`[${r}] ${e}`)}};t=l([a(0,h)],t);export{t as NotebookLoggingService};
