import{alert as s}from"../../../../base/browser/ui/aria/aria.js";import{localize as r}from"../../../../nls.js";import{NotificationChangeType as n,NotificationViewItemContentChangeKind as a}from"../../../common/notifications.js";import{Disposable as g}from"../../../../base/common/lifecycle.js";import{toErrorMessage as l}from"../../../../base/common/errorMessage.js";import{NotificationPriority as m,Severity as t}from"../../../../platform/notification/common/notification.js";import{Event as f}from"../../../../base/common/event.js";class D extends g{constructor(e){super();this.model=e;for(const i of e.notifications)this.triggerAriaAlert(i);this.registerListeners()}registerListeners(){this._register(this.model.onDidChangeNotification(e=>this.onDidChangeNotification(e)))}onDidChangeNotification(e){e.kind===n.ADD&&(this.triggerAriaAlert(e.item),e.item.severity===t.Error&&(e.item.message.original instanceof Error?console.error(e.item.message.original):console.error(l(e.item.message.linkedText.toString(),!0))))}triggerAriaAlert(e){if(e.priority===m.SILENT)return;const i=e.onDidChangeContent(o=>{o.kind===a.MESSAGE&&this.doTriggerAriaAlert(e)});f.once(e.onDidClose)(()=>i.dispose()),this.doTriggerAriaAlert(e)}doTriggerAriaAlert(e){let i;e.severity===t.Error?i=r("alertErrorMessage","Error: {0}",e.message.linkedText.toString()):e.severity===t.Warning?i=r("alertWarningMessage","Warning: {0}",e.message.linkedText.toString()):i=r("alertInfoMessage","Info: {0}",e.message.linkedText.toString()),s(i)}}export{D as NotificationsAlerts};
