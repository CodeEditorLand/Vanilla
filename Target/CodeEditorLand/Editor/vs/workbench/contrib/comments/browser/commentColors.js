import*as m from"../../../../editor/common/languages.js";import{peekViewTitleBackground as C}from"../../../../editor/contrib/peekView/browser/peekView.js";import*as o from"../../../../nls.js";import{contrastBorder as e,disabledForeground as s,listFocusOutline as i,registerColor as r,transparent as g}from"../../../../platform/theme/common/colorRegistry.js";const d=r("commentsView.resolvedIcon",{dark:s,light:s,hcDark:e,hcLight:e},o.localize("resolvedCommentIcon","Icon color for resolved comments.")),a=r("commentsView.unresolvedIcon",{dark:i,light:i,hcDark:e,hcLight:e},o.localize("unresolvedCommentIcon","Icon color for unresolved comments."));r("editorCommentsWidget.replyInputBackground",C,o.localize("commentReplyInputBackground","Background color for comment reply input box."));const f=r("editorCommentsWidget.resolvedBorder",{dark:d,light:d,hcDark:e,hcLight:e},o.localize("resolvedCommentBorder","Color of borders and arrow for resolved comments.")),c=r("editorCommentsWidget.unresolvedBorder",{dark:a,light:a,hcDark:e,hcLight:e},o.localize("unresolvedCommentBorder","Color of borders and arrow for unresolved comments.")),B=r("editorCommentsWidget.rangeBackground",g(c,.1),o.localize("commentThreadRangeBackground","Color of background for comment ranges.")),I=r("editorCommentsWidget.rangeActiveBackground",g(c,.1),o.localize("commentThreadActiveRangeBackground","Color of background for currently selected or hovered comment range.")),p=new Map([[m.CommentThreadState.Unresolved,c],[m.CommentThreadState.Resolved,f]]),v=new Map([[m.CommentThreadState.Unresolved,a],[m.CommentThreadState.Resolved,d]]),S="--comment-thread-state-color",w="--comment-view-thread-state-color",V="--comment-thread-state-background-color";function u(t,n,h){const l=t!==void 0?h.get(t):void 0;return l!==void 0?n.getColor(l):void 0}function b(t,n){return u(t,n,p)}function x(t,n){return u(t,n,v)}export{I as commentThreadRangeActiveBackground,B as commentThreadRangeBackground,V as commentThreadStateBackgroundColorVar,S as commentThreadStateColorVar,w as commentViewThreadStateColorVar,b as getCommentThreadStateBorderColor,x as getCommentThreadStateIconColor};
