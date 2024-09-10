import{Event as n}from"../../../base/common/event.js";import r from"../../../base/common/severity.js";import{createDecorator as a}from"../../instantiation/common/instantiation.js";const g=r,N=a("notificationService");var s=(e=>(e[e.DEFAULT=0]="DEFAULT",e[e.SILENT=1]="SILENT",e[e.URGENT=2]="URGENT",e))(s||{}),c=(e=>(e[e.WORKSPACE=0]="WORKSPACE",e[e.PROFILE=1]="PROFILE",e[e.APPLICATION=2]="APPLICATION",e))(c||{});function x(i){if(i){const o=i;return typeof o.id=="string"&&typeof o.label=="string"}return!1}var d=(t=>(t[t.OFF=0]="OFF",t[t.ERROR=1]="ERROR",t))(d||{});class S{progress=new l;onDidClose=n.None;onDidChangeVisibility=n.None;updateSeverity(o){}updateMessage(o){}updateActions(o){}close(){}}class l{infinite(){}done(){}total(o){}worked(o){}}export{N as INotificationService,c as NeverShowAgainScope,S as NoOpNotification,l as NoOpProgress,s as NotificationPriority,d as NotificationsFilter,g as Severity,x as isNotificationSource};
