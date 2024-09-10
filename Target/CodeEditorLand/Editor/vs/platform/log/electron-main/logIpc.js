import{ResourceMap as s}from"../../../base/common/map.js";import{URI as g}from"../../../base/common/uri.js";import{isLogLevel as l,log as c,LogLevel as i}from"../common/log.js";class E{constructor(o){this.loggerService=o}loggers=new s;listen(o,r,e){switch(r){case"onDidChangeLoggers":return e?this.loggerService.getOnDidChangeLoggersEvent(e):this.loggerService.onDidChangeLoggers;case"onDidChangeLogLevel":return e?this.loggerService.getOnDidChangeLogLevelEvent(e):this.loggerService.onDidChangeLogLevel;case"onDidChangeVisibility":return e?this.loggerService.getOnDidChangeVisibilityEvent(e):this.loggerService.onDidChangeVisibility}throw new Error(`Event not found: ${r}`)}async call(o,r,e){switch(r){case"createLogger":this.createLogger(g.revive(e[0]),e[1],e[2]);return;case"log":return this.log(g.revive(e[0]),e[1]);case"consoleLog":return this.consoleLog(e[0],e[1]);case"setLogLevel":return l(e[0])?this.loggerService.setLogLevel(e[0]):this.loggerService.setLogLevel(g.revive(e[0]),e[1]);case"setVisibility":return this.loggerService.setVisibility(g.revive(e[0]),e[1]);case"registerLogger":return this.loggerService.registerLogger({...e[0],resource:g.revive(e[0].resource)},e[1]);case"deregisterLogger":return this.loggerService.deregisterLogger(g.revive(e[0]))}throw new Error(`Call not found: ${r}`)}createLogger(o,r,e){this.loggers.set(o,this.loggerService.createLogger(o,r,e))}consoleLog(o,r){let e=console.log;switch(o){case i.Error:e=console.error;break;case i.Warning:e=console.warn;break;case i.Info:e=console.info;break}e.call(console,...r)}log(o,r){const e=this.loggers.get(o);if(!e)throw new Error("Create the logger before logging");for(const[t,n]of r)c(e,t,n)}}export{E as LoggerChannel};
