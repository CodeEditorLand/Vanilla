var m=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var f=(o,t,e,i)=>{for(var r=i>1?void 0:i?h(t,e):t,n=o.length-1,c;n>=0;n--)(c=o[n])&&(r=(i?c(t,e,r):c(r))||r);return i&&r&&m(t,e,r),r},a=(o,t)=>(e,i)=>t(e,i,o);import{Disposable as l}from"../../../../base/common/lifecycle.js";import{INotificationService as g,NotificationPriority as u}from"../../../../platform/notification/common/notification.js";import{ITelemetryService as d}from"../../../../platform/telemetry/common/telemetry.js";import{hash as y}from"../../../../base/common/hash.js";function p(o,t,e){return{id:y(o.toString()).toString(),silent:e,source:t||"core"}}let s=class extends l{constructor(e,i){super();this.telemetryService=e;this.notificationService=i;this.registerListeners()}registerListeners(){this._register(this.notificationService.onDidAddNotification(e=>{const i=e.source&&typeof e.source!="string"?e.source.id:e.source;this.telemetryService.publicLog2("notification:show",p(e.message,i,e.priority===u.SILENT))})),this._register(this.notificationService.onDidRemoveNotification(e=>{const i=e.source&&typeof e.source!="string"?e.source.id:e.source;this.telemetryService.publicLog2("notification:close",p(e.message,i,e.priority===u.SILENT))}))}};s=f([a(0,d),a(1,g)],s);export{s as NotificationsTelemetry,p as notificationToMetrics};
