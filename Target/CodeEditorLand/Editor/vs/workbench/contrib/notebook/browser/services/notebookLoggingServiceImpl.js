var d=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var l=(i,r,e,g)=>{for(var o=g>1?void 0:g?m(r,e):r,n=i.length-1,s;n>=0;n--)(s=i[n])&&(o=(g?s(r,e,o):s(o))||o);return g&&o&&d(r,e,o),o},a=(i,r)=>(e,g)=>r(e,g,i);import{Disposable as c}from"../../../../../base/common/lifecycle.js";import*as p from"../../../../../nls.js";import{ILoggerService as h}from"../../../../../platform/log/common/log.js";const v="notebook.rendering";let t=class extends c{_serviceBrand;static ID="notebook";_logger;constructor(r){super(),this._logger=this._register(r.createLogger(v,{name:p.localize("renderChannelName","Notebook")}))}debug(r,e){this._logger.debug(`[${r}] ${e}`)}info(r,e){this._logger.info(`[${r}] ${e}`)}warn(r,e){this._logger.warn(`[${r}] ${e}`)}error(r,e){this._logger.error(`[${r}] ${e}`)}};t=l([a(0,h)],t);export{t as NotebookLoggingService};
