import*as s from"../../../../../../vs/base/browser/dom.js";import{renderIcon as m}from"../../../../../../vs/base/browser/ui/iconLabel/iconLabels.js";import{Codicon as e}from"../../../../../../vs/base/common/codicons.js";import"../../../../../../vs/base/common/htmlContent.js";import{Disposable as c}from"../../../../../../vs/base/common/lifecycle.js";import"../../../../../../vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import"../../../../../../vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts.js";import"../../../../../../vs/workbench/contrib/chat/common/chatModel.js";const t=s.$;class M extends c{domNode;constructor(r,a,i){super(),this.domNode=t(".chat-notification-widget");let o,n;switch(r){case"warning":o=e.warning,n=".chat-warning-codicon";break;case"error":o=e.error,n=".chat-error-codicon";break;case"info":o=e.info,n=".chat-info-codicon";break}this.domNode.appendChild(t(n,void 0,m(o)));const d=i.render(a);this.domNode.appendChild(d.element)}hasSameContent(r){return r.kind==="warning"}}export{M as ChatWarningContentPart};
