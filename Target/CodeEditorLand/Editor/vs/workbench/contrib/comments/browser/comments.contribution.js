var I=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var f=(r,i,e,t)=>{for(var n=t>1?void 0:t?A(i,e):i,m=r.length-1,d;m>=0;m--)(d=r[m])&&(n=(t?d(i,e,n):d(n))||n);return t&&n&&I(i,e,n),n},p=(r,i)=>(e,t)=>i(e,t,r);import*as o from"../../../../../vs/nls.js";import{InstantiationType as T,registerSingleton as E}from"../../../../../vs/platform/instantiation/common/extensions.js";import{Registry as C}from"../../../../../vs/platform/registry/common/platform.js";import"../../../../../vs/workbench/contrib/comments/browser/commentsEditorContribution.js";import{Codicon as h}from"../../../../../vs/base/common/codicons.js";import{Disposable as V,MutableDisposable as x}from"../../../../../vs/base/common/lifecycle.js";import{CommentThreadState as w}from"../../../../../vs/editor/common/languages.js";import{AccessibleViewProviderId as _}from"../../../../../vs/platform/accessibility/browser/accessibleView.js";import{AccessibleViewRegistry as g}from"../../../../../vs/platform/accessibility/browser/accessibleViewRegistry.js";import{Action2 as z,MenuId as c,registerAction2 as v}from"../../../../../vs/platform/actions/common/actions.js";import{Extensions as D}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as s}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{IUriIdentityService as M}from"../../../../../vs/platform/uriIdentity/common/uriIdentity.js";import{ViewAction as y}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import"../../../../../vs/workbench/common/comments.js";import{Extensions as R}from"../../../../../vs/workbench/common/contributions.js";import{accessibleViewCurrentProviderId as O,accessibleViewIsShown as U}from"../../../../../vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.js";import{CommentsAccessibilityHelp as k}from"../../../../../vs/workbench/contrib/comments/browser/commentsAccessibility.js";import{CommentsAccessibleView as P}from"../../../../../vs/workbench/contrib/comments/browser/commentsAccessibleView.js";import{revealCommentThread as W}from"../../../../../vs/workbench/contrib/comments/browser/commentsController.js";import{CommentService as N,ICommentService as u}from"../../../../../vs/workbench/contrib/comments/browser/commentService.js";import{COMMENTS_VIEW_ID as l}from"../../../../../vs/workbench/contrib/comments/browser/commentsTreeViewer.js";import{CONTEXT_KEY_HAS_COMMENTS as b,CONTEXT_KEY_SOME_COMMENTS_EXPANDED as S}from"../../../../../vs/workbench/contrib/comments/browser/commentsView.js";import{IActivityService as F,NumberBadge as q}from"../../../../../vs/workbench/services/activity/common/activity.js";import{IEditorService as H}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{LifecyclePhase as K}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";v(class extends y{constructor(){super({viewId:l,id:"comments.collapse",title:o.localize("collapseAll","Collapse All"),f1:!1,icon:h.collapseAll,menu:{id:c.ViewTitle,group:"navigation",when:s.and(s.and(s.equals("view",l),b),S),order:100}})}runInView(i,e){e.collapseAll()}}),v(class extends y{constructor(){super({viewId:l,id:"comments.expand",title:o.localize("expandAll","Expand All"),f1:!1,icon:h.expandAll,menu:{id:c.ViewTitle,group:"navigation",when:s.and(s.and(s.equals("view",l),b),s.not(S.key)),order:100}})}runInView(i,e){e.expandAll()}}),v(class extends z{constructor(){super({id:"comments.reply",title:o.localize("reply","Reply"),icon:h.reply,precondition:s.equals("canReply",!0),menu:[{id:c.CommentsViewThreadActions,order:100},{id:c.AccessibleView,when:s.and(U,s.equals(O.key,_.Comments))}]})}run(i,e){const t=i.get(u),n=i.get(H),m=i.get(M);W(t,n,m,e.thread,e.thread.comments[e.thread.comments.length-1],!0)}}),C.as(D.Configuration).registerConfiguration({id:"comments",order:20,title:o.localize("commentsConfigurationTitle","Comments"),type:"object",properties:{"comments.openPanel":{enum:["neverOpen","openOnSessionStart","openOnSessionStartWithComments"],default:"openOnSessionStartWithComments",description:o.localize("openComments","Controls when the comments panel should open."),restricted:!1,markdownDeprecationMessage:o.localize("comments.openPanel.deprecated","This setting is deprecated in favor of `comments.openView`.")},"comments.openView":{enum:["never","file","firstFile","firstFileUnresolved"],enumDescriptions:[o.localize("comments.openView.never","The comments view will never be opened."),o.localize("comments.openView.file","The comments view will open when a file with comments is active."),o.localize("comments.openView.firstFile","If the comments view has not been opened yet during this session it will open the first time during a session that a file with comments is active."),o.localize("comments.openView.firstFileUnresolved","If the comments view has not been opened yet during this session and the comment is not resolved, it will open the first time during a session that a file with comments is active.")],default:"firstFile",description:o.localize("comments.openView","Controls when the comments view should open."),restricted:!1},"comments.useRelativeTime":{type:"boolean",default:!0,description:o.localize("useRelativeTime","Determines if relative time will be used in comment timestamps (ex. '1 day ago').")},"comments.visible":{type:"boolean",default:!0,description:o.localize("comments.visible",'Controls the visibility of the comments bar and comment threads in editors that have commenting ranges and comments. Comments are still accessible via the Comments view and will cause commenting to be toggled on in the same way running the command "Comments: Toggle Editor Commenting" toggles comments.')},"comments.maxHeight":{type:"boolean",default:!0,description:o.localize("comments.maxHeight","Controls whether the comments widget scrolls or expands.")},"comments.collapseOnResolve":{type:"boolean",default:!0,description:o.localize("collapseOnResolve","Controls whether the comment thread should collapse when the thread is resolved.")}}}),E(u,N,T.Delayed);let a=class extends V{constructor(e,t){super();this._commentService=e;this.activityService=t;this._register(this._commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged,this)),this._register(this._commentService.onDidUpdateCommentThreads(this.onCommentsUpdated,this))}activity=this._register(new x);totalUnresolved=0;onAllCommentsChanged(e){let t=0;for(const n of e.commentThreads)n.state===w.Unresolved&&t++;this.updateBadge(t)}onCommentsUpdated(){let e=0;for(const t of this._commentService.commentsModel.resourceCommentThreads)for(const n of t.commentThreads)n.threadState===w.Unresolved&&e++;this.updateBadge(e)}updateBadge(e){if(e===this.totalUnresolved)return;this.totalUnresolved=e;const t=o.localize("totalUnresolvedComments","{0} Unresolved Comments",this.totalUnresolved);this.activity.value=this.activityService.showViewActivity(l,{badge:new q(this.totalUnresolved,()=>t)})}};a=f([p(0,u),p(1,F)],a),C.as(R.Workbench).registerWorkbenchContribution(a,K.Eventually),g.register(new P),g.register(new k);export{a as UnresolvedCommentsBadge};
