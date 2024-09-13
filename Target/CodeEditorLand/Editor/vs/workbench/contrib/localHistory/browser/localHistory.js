import{Codicon as i}from"../../../../base/common/codicons.js";import{language as m}from"../../../../base/common/platform.js";import{localize as n}from"../../../../nls.js";import{ContextKeyExpr as c}from"../../../../platform/contextkey/common/contextkey.js";import{registerIcon as a}from"../../../../platform/theme/common/iconRegistry.js";let o;function p(){if(!o){const r={year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric"};let t;try{t=new Intl.DateTimeFormat(m,r)}catch{t=new Intl.DateTimeFormat(void 0,r)}o={format:e=>t.format(e)}}return o}const l="localHistory:item",u=c.equals("timelineItem",l),H=a("localHistory-icon",i.circleOutline,n("localHistoryIcon","Icon for a local history entry in the timeline view.")),T=a("localHistory-restore",i.check,n("localHistoryRestore","Icon for restoring contents of a local history entry."));export{H as LOCAL_HISTORY_ICON_ENTRY,T as LOCAL_HISTORY_ICON_RESTORE,u as LOCAL_HISTORY_MENU_CONTEXT_KEY,l as LOCAL_HISTORY_MENU_CONTEXT_VALUE,p as getLocalHistoryDateFormatter};
