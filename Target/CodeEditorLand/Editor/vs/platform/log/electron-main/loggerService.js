import{ResourceMap as t}from"../../../base/common/map.js";import{Event as i}from"../../../base/common/event.js";import{refineServiceDecorator as s}from"../../instantiation/common/instantiation.js";import{ILoggerService as n,isLogLevel as d}from"../common/log.js";import{LoggerService as L}from"../node/loggerService.js";const E=s(n);class y extends L{loggerResourcesByWindow=new t;createLogger(e,r,o){o!==void 0&&this.loggerResourcesByWindow.set(this.toResource(e),o);try{return super.createLogger(e,r)}catch(g){throw this.loggerResourcesByWindow.delete(this.toResource(e)),g}}registerLogger(e,r){r!==void 0&&this.loggerResourcesByWindow.set(e.resource,r),super.registerLogger(e)}deregisterLogger(e){this.loggerResourcesByWindow.delete(e),super.deregisterLogger(e)}getRegisteredLoggers(e){const r=[];for(const o of super.getRegisteredLoggers())e===this.loggerResourcesByWindow.get(o.resource)&&r.push(o);return r}getOnDidChangeLogLevelEvent(e){return i.filter(this.onDidChangeLogLevel,r=>d(r)||this.isInterestedLoggerResource(r[0],e))}getOnDidChangeVisibilityEvent(e){return i.filter(this.onDidChangeVisibility,([r])=>this.isInterestedLoggerResource(r,e))}getOnDidChangeLoggersEvent(e){return i.filter(i.map(this.onDidChangeLoggers,r=>({added:[...r.added].filter(g=>this.isInterestedLoggerResource(g.resource,e)),removed:[...r.removed].filter(g=>this.isInterestedLoggerResource(g.resource,e))})),r=>r.added.length>0||r.removed.length>0)}deregisterLoggers(e){for(const[r,o]of this.loggerResourcesByWindow)o===e&&this.deregisterLogger(r)}isInterestedLoggerResource(e,r){const o=this.loggerResourcesByWindow.get(e);return o===void 0||o===r}dispose(){super.dispose(),this.loggerResourcesByWindow.clear()}}export{E as ILoggerMainService,y as LoggerMainService};
