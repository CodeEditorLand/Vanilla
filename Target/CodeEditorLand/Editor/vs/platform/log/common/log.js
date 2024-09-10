import*as l from"../../../nls.js";import{toErrorMessage as u}from"../../../base/common/errorMessage.js";import{Emitter as a}from"../../../base/common/event.js";import{hash as I}from"../../../base/common/hash.js";import{Disposable as p}from"../../../base/common/lifecycle.js";import{ResourceMap as b}from"../../../base/common/map.js";import{isWindows as m}from"../../../base/common/platform.js";import{joinPath as E}from"../../../base/common/resources.js";import{isNumber as x,isString as d}from"../../../base/common/types.js";import{URI as R}from"../../../base/common/uri.js";import"../../action/common/action.js";import{RawContextKey as C}from"../../contextkey/common/contextkey.js";import"../../environment/common/environment.js";import{createDecorator as y}from"../../instantiation/common/instantiation.js";const P=y("logService"),X=y("loggerService");function s(){return new Date().toISOString()}function q(i){return x(i)}var _=(t=>(t[t.Off=0]="Off",t[t.Trace=1]="Trace",t[t.Debug=2]="Debug",t[t.Info=3]="Info",t[t.Warning=4]="Warning",t[t.Error=5]="Error",t))(_||{});const v=3;function Q(i,g,e){switch(g){case 1:i.trace(e);break;case 2:i.debug(e);break;case 3:i.info(e);break;case 4:i.warn(e);break;case 5:i.error(e);break;case 0:break;default:throw new Error(`Invalid log level ${g}`)}}function L(i,g=!1){let e="";for(let o=0;o<i.length;o++){let r=i[o];if(r instanceof Error&&(r=u(r,g)),typeof r=="object")try{r=JSON.stringify(r)}catch{}e+=(o>0?" ":"")+r}return e}class c extends p{level=v;_onDidChangeLogLevel=this._register(new a);onDidChangeLogLevel=this._onDidChangeLogLevel.event;setLevel(g){this.level!==g&&(this.level=g,this._onDidChangeLogLevel.fire(this.level))}getLevel(){return this.level}checkLogLevel(g){return this.level!==0&&this.level<=g}}class Y extends c{constructor(e){super();this.logAlways=e}checkLogLevel(e){return this.logAlways||super.checkLogLevel(e)}trace(e,...o){this.checkLogLevel(1)&&this.log(1,L([e,...o],!0))}debug(e,...o){this.checkLogLevel(2)&&this.log(2,L([e,...o]))}info(e,...o){this.checkLogLevel(3)&&this.log(3,L([e,...o]))}warn(e,...o){this.checkLogLevel(4)&&this.log(4,L([e,...o]))}error(e,...o){if(this.checkLogLevel(5))if(e instanceof Error){const r=Array.prototype.slice.call(arguments);r[0]=e.stack,this.log(5,L(r))}else this.log(5,L([e,...o]))}flush(){}}class Z extends c{useColors;constructor(g=v){super(),this.setLevel(g),this.useColors=!m}trace(g,...e){this.checkLogLevel(1)&&(this.useColors?console.log(`\x1B[90m[main ${s()}]\x1B[0m`,g,...e):console.log(`[main ${s()}]`,g,...e))}debug(g,...e){this.checkLogLevel(2)&&(this.useColors?console.log(`\x1B[90m[main ${s()}]\x1B[0m`,g,...e):console.log(`[main ${s()}]`,g,...e))}info(g,...e){this.checkLogLevel(3)&&(this.useColors?console.log(`\x1B[90m[main ${s()}]\x1B[0m`,g,...e):console.log(`[main ${s()}]`,g,...e))}warn(g,...e){this.checkLogLevel(4)&&(this.useColors?console.warn(`\x1B[93m[main ${s()}]\x1B[0m`,g,...e):console.warn(`[main ${s()}]`,g,...e))}error(g,...e){this.checkLogLevel(5)&&(this.useColors?console.error(`\x1B[91m[main ${s()}]\x1B[0m`,g,...e):console.error(`[main ${s()}]`,g,...e))}flush(){}}class ee extends c{constructor(e=v,o=!0){super();this.useColors=o;this.setLevel(e)}trace(e,...o){this.checkLogLevel(1)&&(this.useColors?console.log("%cTRACE","color: #888",e,...o):console.log(e,...o))}debug(e,...o){this.checkLogLevel(2)&&(this.useColors?console.log("%cDEBUG","background: #eee; color: #888",e,...o):console.log(e,...o))}info(e,...o){this.checkLogLevel(3)&&(this.useColors?console.log("%c INFO","color: #33f",e,...o):console.log(e,...o))}warn(e,...o){this.checkLogLevel(4)&&(this.useColors?console.log("%c WARN","color: #993",e,...o):console.log(e,...o))}error(e,...o){this.checkLogLevel(5)&&(this.useColors?console.log("%c  ERR","color: #f33",e,...o):console.error(e,...o))}flush(){}}class oe extends c{constructor(e,o=v){super();this.adapter=e;this.setLevel(o)}trace(e,...o){this.checkLogLevel(1)&&this.adapter.log(1,[this.extractMessage(e),...o])}debug(e,...o){this.checkLogLevel(2)&&this.adapter.log(2,[this.extractMessage(e),...o])}info(e,...o){this.checkLogLevel(3)&&this.adapter.log(3,[this.extractMessage(e),...o])}warn(e,...o){this.checkLogLevel(4)&&this.adapter.log(4,[this.extractMessage(e),...o])}error(e,...o){this.checkLogLevel(5)&&this.adapter.log(5,[this.extractMessage(e),...o])}extractMessage(e){return typeof e=="string"?e:u(e,this.checkLogLevel(1))}flush(){}}class re extends c{constructor(e){super();this.loggers=e;e.length&&this.setLevel(e[0].getLevel())}setLevel(e){for(const o of this.loggers)o.setLevel(e);super.setLevel(e)}trace(e,...o){for(const r of this.loggers)r.trace(e,...o)}debug(e,...o){for(const r of this.loggers)r.debug(e,...o)}info(e,...o){for(const r of this.loggers)r.info(e,...o)}warn(e,...o){for(const r of this.loggers)r.warn(e,...o)}error(e,...o){for(const r of this.loggers)r.error(e,...o)}flush(){for(const e of this.loggers)e.flush()}dispose(){for(const e of this.loggers)e.dispose();super.dispose()}}class ge extends p{constructor(e,o,r){super();this.logLevel=e;this.logsHome=o;if(r)for(const n of r)this._loggers.set(n.resource,{logger:void 0,info:n})}_loggers=new b;_onDidChangeLoggers=this._register(new a);onDidChangeLoggers=this._onDidChangeLoggers.event;_onDidChangeLogLevel=this._register(new a);onDidChangeLogLevel=this._onDidChangeLogLevel.event;_onDidChangeVisibility=this._register(new a);onDidChangeVisibility=this._onDidChangeVisibility.event;getLoggerEntry(e){return d(e)?[...this._loggers.values()].find(o=>o.info.id===e):this._loggers.get(e)}getLogger(e){return this.getLoggerEntry(e)?.logger}createLogger(e,o){const r=this.toResource(e),n=d(e)?e:o?.id??I(r.toString()).toString(16);let t=this._loggers.get(r)?.logger;const f=o?.logLevel==="always"?1:o?.logLevel;t||(t=this.doCreateLogger(r,f??this.getLogLevel(r)??this.logLevel,{...o,id:n}));const h={logger:t,info:{resource:r,id:n,logLevel:f,name:o?.name,hidden:o?.hidden,extensionId:o?.extensionId,when:o?.when}};return this.registerLogger(h.info),this._loggers.set(r,h),t}toResource(e){return d(e)?E(this.logsHome,`${e}.log`):e}setLogLevel(e,o){if(R.isUri(e)){const r=e,n=o,t=this._loggers.get(r);t&&n!==t.info.logLevel&&(t.info.logLevel=n===this.logLevel?void 0:n,t.logger?.setLevel(n),this._loggers.set(t.info.resource,t),this._onDidChangeLogLevel.fire([r,n]))}else{this.logLevel=e;for(const[r,n]of this._loggers.entries())this._loggers.get(r)?.info.logLevel===void 0&&n.logger?.setLevel(this.logLevel);this._onDidChangeLogLevel.fire(this.logLevel)}}setVisibility(e,o){const r=this.getLoggerEntry(e);r&&o!==!r.info.hidden&&(r.info.hidden=!o,this._loggers.set(r.info.resource,r),this._onDidChangeVisibility.fire([r.info.resource,o]))}getLogLevel(e){let o;return e&&(o=this._loggers.get(e)?.info.logLevel),o??this.logLevel}registerLogger(e){const o=this._loggers.get(e.resource);o?o.info.hidden!==e.hidden&&this.setVisibility(e.resource,!e.hidden):(this._loggers.set(e.resource,{info:e,logger:void 0}),this._onDidChangeLoggers.fire({added:[e],removed:[]}))}deregisterLogger(e){const o=this._loggers.get(e);o&&(o.logger&&o.logger.dispose(),this._loggers.delete(e),this._onDidChangeLoggers.fire({added:[],removed:[o.info]}))}*getRegisteredLoggers(){for(const e of this._loggers.values())yield e.info}getRegisteredLogger(e){return this._loggers.get(e)?.info}dispose(){this._loggers.forEach(e=>e.logger?.dispose()),this._loggers.clear(),super.dispose()}}class D{onDidChangeLogLevel=new a().event;setLevel(g){}getLevel(){return 3}trace(g,...e){}debug(g,...e){}info(g,...e){}warn(g,...e){}error(g,...e){}critical(g,...e){}dispose(){}flush(){}}class ie extends D{}function te(i){if(i.verbose)return 1;if(typeof i.logLevel=="string"){const g=k(i.logLevel.toLowerCase());if(g!==void 0)return g}return v}function w(i){switch(i){case 1:return"trace";case 2:return"debug";case 3:return"info";case 4:return"warn";case 5:return"error";case 0:return"off"}}function ne(i){switch(i){case 1:return{original:"Trace",value:l.localize("trace","Trace")};case 2:return{original:"Debug",value:l.localize("debug","Debug")};case 3:return{original:"Info",value:l.localize("info","Info")};case 4:return{original:"Warning",value:l.localize("warn","Warning")};case 5:return{original:"Error",value:l.localize("error","Error")};case 0:return{original:"Off",value:l.localize("off","Off")}}}function k(i){switch(i){case"trace":return 1;case"debug":return 2;case"info":return 3;case"warn":return 4;case"error":return 5;case"critical":return 5;case"off":return 0}}const se=new C("logLevel",w(3));export{c as AbstractLogger,ge as AbstractLoggerService,Y as AbstractMessageLogger,oe as AdapterLogger,se as CONTEXT_LOG_LEVEL,ee as ConsoleLogger,Z as ConsoleMainLogger,v as DEFAULT_LOG_LEVEL,P as ILogService,X as ILoggerService,_ as LogLevel,ne as LogLevelToLocalizedString,w as LogLevelToString,re as MultiplexLogger,ie as NullLogService,D as NullLogger,te as getLogLevel,q as isLogLevel,Q as log,k as parseLogLevel};
