var d=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var c=(l,s,e,o)=>{for(var r=o>1?void 0:o?h(s,e):s,t=l.length-1,i;t>=0;t--)(i=l[t])&&(r=(o?i(s,e,r):i(r))||r);return o&&r&&d(s,e,r),r},g=(l,s)=>(e,o)=>s(e,o,l);import{ILogService as p,ILoggerService as S,LogLevelToString as f,getLogLevel as u,parseLogLevel as a}from"../../../../platform/log/common/log.js";import{createDecorator as D}from"../../../../platform/instantiation/common/instantiation.js";import{IWorkbenchEnvironmentService as _}from"../../../services/environment/common/environmentService.js";import{FileOperationResult as y,IFileService as E,toFileOperationResult as w}from"../../../../platform/files/common/files.js";import{IJSONEditingService as x}from"../../../services/configuration/common/jsonEditing.js";import{isString as A,isUndefined as v}from"../../../../base/common/types.js";import{EXTENSION_IDENTIFIER_WITH_LOG_REGEX as F}from"../../../../platform/environment/common/environmentService.js";import{InstantiationType as I,registerSingleton as P}from"../../../../platform/instantiation/common/extensions.js";import{parse as T}from"../../../../base/common/json.js";import{Disposable as C}from"../../../../base/common/lifecycle.js";import{Emitter as R}from"../../../../base/common/event.js";const O=D("IDefaultLogLevelsService");let L=class extends C{constructor(e,o,r,t,i){super();this.environmentService=e;this.fileService=o;this.jsonEditingService=r;this.logService=t;this.loggerService=i}_serviceBrand;_onDidChangeDefaultLogLevels=this._register(new R);onDidChangeDefaultLogLevels=this._onDidChangeDefaultLogLevels.event;async getDefaultLogLevels(){const e=await this._parseLogLevelsFromArgv();return{default:e?.default??this._getDefaultLogLevelFromEnv(),extensions:e?.extensions??this._getExtensionsDefaultLogLevelsFromEnv()}}async getDefaultLogLevel(e){const o=await this._parseLogLevelsFromArgv()??{};return e?(e=e.toLowerCase(),this._getDefaultLogLevel(o,e)):this._getDefaultLogLevel(o)}async setDefaultLogLevel(e,o){const r=await this._parseLogLevelsFromArgv()??{};if(o){o=o.toLowerCase();const t=this._getDefaultLogLevel(r,o);r.extensions=r.extensions??[];const i=r.extensions.find(([n])=>n===o);i?i[1]=e:r.extensions.push([o,e]),await this._writeLogLevelsToArgv(r);const m=[...this.loggerService.getRegisteredLoggers()].filter(n=>n.extensionId&&n.extensionId.toLowerCase()===o);for(const{resource:n}of m)this.loggerService.getLogLevel(n)===t&&this.loggerService.setLogLevel(n,e)}else{const t=this._getDefaultLogLevel(r);r.default=e,await this._writeLogLevelsToArgv(r),this.loggerService.getLogLevel()===t&&this.loggerService.setLogLevel(e)}this._onDidChangeDefaultLogLevels.fire()}_getDefaultLogLevel(e,o){if(o){const r=e.extensions?.find(([t])=>t===o);if(r)return r[1]}return e.default??u(this.environmentService)}async _writeLogLevelsToArgv(e){const o=[];v(e.default)||o.push(f(e.default));for(const[r,t]of e.extensions??[])o.push(`${r}=${f(t)}`);await this.jsonEditingService.write(this.environmentService.argvResource,[{path:["log-level"],value:o.length?o:void 0}],!0)}async _parseLogLevelsFromArgv(){const e={extensions:[]},o=await this._readLogLevelsFromArgv();for(const r of o){const t=F.exec(r);if(t&&t[1]&&t[2]){const i=a(t[2]);v(i)||e.extensions?.push([t[1].toLowerCase(),i])}else{const i=a(r);v(i)||(e.default=i)}}return!v(e.default)||e.extensions?.length?e:void 0}async migrateLogLevels(){const e=await this._readLogLevelsFromArgv(),o=/^([^.]+\..+):(.+)$/;if(e.some(r=>o.test(r))){const r=await this._parseLogLevelsFromArgv();r&&await this._writeLogLevelsToArgv(r)}}async _readLogLevelsFromArgv(){try{const e=await this.fileService.readFile(this.environmentService.argvResource),o=T(e.value.toString());return A(o["log-level"])?[o["log-level"]]:Array.isArray(o["log-level"])?o["log-level"]:[]}catch(e){w(e)!==y.FILE_NOT_FOUND&&this.logService.error(e)}return[]}_getDefaultLogLevelFromEnv(){return u(this.environmentService)}_getExtensionsDefaultLogLevelsFromEnv(){const e=[];for(const[o,r]of this.environmentService.extensionLogLevel??[]){const t=a(r);v(t)||e.push([o,t])}return e}};L=c([g(0,_),g(1,E),g(2,x),g(3,p),g(4,S)],L),P(O,L,I.Delayed);export{O as IDefaultLogLevelsService};
