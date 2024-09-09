import{Event as t}from"../../../../base/common/event.js";import{Disposable as r}from"../../../../base/common/lifecycle.js";import{NoOpNotification as a,NotificationsFilter as s,Severity as o}from"../../common/notification.js";class e{onDidAddNotification=t.None;onDidRemoveNotification=t.None;onDidChangeFilter=t.None;static NO_OP=new a;info(i){return this.notify({severity:o.Info,message:i})}warn(i){return this.notify({severity:o.Warning,message:i})}error(i){return this.notify({severity:o.Error,message:i})}notify(i){return e.NO_OP}prompt(i,n,c,f){return e.NO_OP}status(i,n){return r.None}setFilter(){}getFilter(i){return s.OFF}getFilters(){return[]}removeFilter(i){}}export{e as TestNotificationService};
