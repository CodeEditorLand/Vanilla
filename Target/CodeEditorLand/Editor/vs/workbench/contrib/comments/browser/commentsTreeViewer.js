var W=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var I=(u,e,r,t)=>{for(var n=t>1?void 0:t?V(e,r):e,i=u.length-1,s;i>=0;i--)(s=u[i])&&(n=(t?s(e,r,n):s(n))||n);return t&&n&&W(e,r,n),n},d=(u,e)=>(r,t)=>e(r,t,u);import*as o from"../../../../../vs/base/browser/dom.js";import{renderMarkdown as k}from"../../../../../vs/base/browser/markdownRenderer.js";import{ActionBar as P}from"../../../../../vs/base/browser/ui/actionbar/actionbar.js";import{ActionViewItem as K}from"../../../../../vs/base/browser/ui/actionbar/actionViewItems.js";import{getDefaultHoverDelegate as _}from"../../../../../vs/base/browser/ui/hover/hoverDelegateFactory.js";import"../../../../../vs/base/browser/ui/list/list.js";import"../../../../../vs/base/browser/ui/list/listWidget.js";import{TreeVisibility as T}from"../../../../../vs/base/browser/ui/tree/tree.js";import"../../../../../vs/base/common/actions.js";import{Codicon as b}from"../../../../../vs/base/common/codicons.js";import"../../../../../vs/base/common/color.js";import"../../../../../vs/base/common/filters.js";import"../../../../../vs/base/common/htmlContent.js";import{DisposableStore as z}from"../../../../../vs/base/common/lifecycle.js";import{MarshalledId as w}from"../../../../../vs/base/common/marshallingIds.js";import{basename as B}from"../../../../../vs/base/common/resources.js";import{ThemeIcon as L}from"../../../../../vs/base/common/themables.js";import{openLinkFromMarkdown as U}from"../../../../../vs/editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";import{CommentThreadApplicability as D,CommentThreadState as x}from"../../../../../vs/editor/common/languages.js";import*as p from"../../../../../vs/nls.js";import"../../../../../vs/platform/action/common/action.js";import{createActionViewItem as q,createAndFillInContextMenuActions as j}from"../../../../../vs/platform/actions/browser/menuEntryActionViewItem.js";import{IMenuService as G,MenuId as N}from"../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as E}from"../../../../../vs/platform/configuration/common/configuration.js";import{IContextKeyService as J}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IContextMenuService as Q}from"../../../../../vs/platform/contextview/browser/contextView.js";import{IHoverService as X}from"../../../../../vs/platform/hover/browser/hover.js";import{IInstantiationService as Y}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as Z}from"../../../../../vs/platform/keybinding/common/keybinding.js";import{IListService as ee,WorkbenchObjectTree as te}from"../../../../../vs/platform/list/browser/listService.js";import{IOpenerService as re}from"../../../../../vs/platform/opener/common/opener.js";import"../../../../../vs/platform/theme/browser/defaultStyles.js";import{IThemeService as ne}from"../../../../../vs/platform/theme/common/themeService.js";import"../../../../../vs/workbench/browser/labels.js";import"../../../../../vs/workbench/common/comments.js";import{commentViewThreadStateColorVar as F,getCommentThreadStateIconColor as oe}from"../../../../../vs/workbench/contrib/comments/browser/commentColors.js";import{FilterOptions as f}from"../../../../../vs/workbench/contrib/comments/browser/commentsFilterOptions.js";import{CommentsModel as ie}from"../../../../../vs/workbench/contrib/comments/browser/commentsModel.js";import{TimestampWidget as A}from"../../../../../vs/workbench/contrib/comments/browser/timestamp.js";import{CommentNode as y,ResourceWithCommentThreads as R}from"../../../../../vs/workbench/contrib/comments/common/commentModel.js";const ht="workbench.panel.comments",ft="Comments",vt=p.localize2("comments.view.title","Comments");class M{static RESOURCE_ID="resource-with-comments";static COMMENT_ID="comment-node";getHeight(e){return e instanceof y&&e.hasReply()?44:22}getTemplateId(e){return e instanceof R?M.RESOURCE_ID:e instanceof y?M.COMMENT_ID:""}}class se{constructor(e){this.labels=e}templateId="resource-with-comments";renderTemplate(e){const r=o.append(e,o.$(".resource-container")),t=this.labels.create(r),n=o.append(r,o.$(".separator")),i=r.appendChild(o.$(".owner"));return{resourceLabel:t,owner:i,separator:n}}renderElement(e,r,t,n){t.resourceLabel.setFile(e.element.resource),t.separator.innerText="\xB7",e.element.ownerLabel?(t.owner.innerText=e.element.ownerLabel,t.separator.style.display="inline"):(t.owner.innerText="",t.separator.style.display="none")}disposeTemplate(e){e.resourceLabel.dispose()}}let v=class{constructor(e){this.menuService=e}contextKeyService;getResourceActions(e){return{actions:this.getActions(N.CommentsViewThreadActions,e).primary}}getResourceContextActions(e){return this.getActions(N.CommentsViewThreadActions,e).secondary}setContextKeyService(e){this.contextKeyService=e}getActions(e,r){if(!this.contextKeyService)return{primary:[],secondary:[]};const t=[["commentController",r.owner],["resourceScheme",r.resource.scheme],["commentThread",r.contextValue],["canReply",r.thread.canReply]],n=this.contextKeyService.createOverlay(t),i=this.menuService.getMenuActions(e,n,{shouldForwardArgs:!0}),m={primary:[],secondary:[],menu:i};return j(i,m,"inline"),m}dispose(){this.contextKeyService=void 0}};v=I([d(0,G)],v);let C=class{constructor(e,r,t,n,i,s){this.actionViewItemProvider=e;this.menus=r;this.openerService=t;this.configurationService=n;this.hoverService=i;this.themeService=s}templateId="comment-node";renderTemplate(e){const r=o.append(e,o.$(".comment-thread-container")),t=o.append(r,o.$(".comment-metadata-container")),n=o.append(t,o.$(".comment-metadata")),i={icon:o.append(n,o.$(".icon")),userNames:o.append(n,o.$(".user")),timestamp:new A(this.configurationService,this.hoverService,o.append(n,o.$(".timestamp-container"))),relevance:o.append(n,o.$(".relevance")),separator:o.append(n,o.$(".separator")),commentPreview:o.append(n,o.$(".text")),range:o.append(n,o.$(".range"))};i.separator.innerText="\xB7";const s=o.append(t,o.$(".actions")),a=new P(s,{actionViewItemProvider:this.actionViewItemProvider}),m=o.append(r,o.$(".comment-snippet-container")),c={container:m,icon:o.append(m,o.$(".icon")),count:o.append(m,o.$(".count")),lastReplyDetail:o.append(m,o.$(".reply-detail")),separator:o.append(m,o.$(".separator")),timestamp:new A(this.configurationService,this.hoverService,o.append(m,o.$(".timestamp-container")))};c.separator.innerText="\xB7",c.icon.classList.add(...L.asClassNameArray(b.indent));const h=[i.timestamp,c.timestamp];return{threadMetadata:i,repliesMetadata:c,actionBar:a,disposables:h}}getCountString(e){return e>2?p.localize("commentsCountReplies","{0} replies",e-1):e===2?p.localize("commentsCountReply","1 reply"):p.localize("commentCount","1 comment")}getRenderedComment(e,r){const t=k(e,{inline:!0,actionHandler:{callback:i=>U(this.openerService,i,e.isTrusted),disposables:r}}),n=t.element.getElementsByTagName("img");for(let i=0;i<n.length;i++){const s=n[i],a=o.$("");a.textContent=s.alt?p.localize("imageWithLabel","Image: {0}",s.alt):p.localize("image","Image"),s.parentNode.replaceChild(a,s)}for(;t.element.children.length>1&&t.element.firstElementChild?.tagName==="HR";)t.element.removeChild(t.element.firstElementChild);return t}getIcon(e){return e===x.Unresolved?b.commentUnresolved:b.comment}renderElement(e,r,t,n){t.actionBar.clear();const i=e.element.replies.length+1;if(e.element.threadRelevance===D.Outdated?(t.threadMetadata.relevance.style.display="",t.threadMetadata.relevance.innerText=p.localize("outdated","Outdated"),t.threadMetadata.separator.style.display="none"):(t.threadMetadata.relevance.innerText="",t.threadMetadata.relevance.style.display="none",t.threadMetadata.separator.style.display=""),t.threadMetadata.icon.classList.remove(...Array.from(t.threadMetadata.icon.classList.values()).filter(c=>c.startsWith("codicon"))),t.threadMetadata.icon.classList.add(...L.asClassNameArray(this.getIcon(e.element.threadState))),e.element.threadState!==void 0){const c=this.getCommentThreadWidgetStateColor(e.element.threadState,this.themeService.getColorTheme());t.threadMetadata.icon.style.setProperty(F,`${c}`),t.threadMetadata.icon.style.color=`var(${F})`}t.threadMetadata.userNames.textContent=e.element.comment.userName,t.threadMetadata.timestamp.setTimestamp(e.element.comment.timestamp?new Date(e.element.comment.timestamp):void 0);const s=e.element;if(t.threadMetadata.commentPreview.innerText="",t.threadMetadata.commentPreview.style.height="22px",typeof s.comment.body=="string")t.threadMetadata.commentPreview.innerText=s.comment.body;else{const c=new z;t.disposables.push(c);const h=this.getRenderedComment(s.comment.body,c);t.disposables.push(h),t.threadMetadata.commentPreview.appendChild(h.element.firstElementChild??h.element),t.disposables.push(this.hoverService.setupManagedHover(_("mouse"),t.threadMetadata.commentPreview,h.element.textContent??""))}e.element.range&&(e.element.range.startLineNumber===e.element.range.endLineNumber?t.threadMetadata.range.textContent=p.localize("commentLine","[Ln {0}]",e.element.range.startLineNumber):t.threadMetadata.range.textContent=p.localize("commentRange","[Ln {0}-{1}]",e.element.range.startLineNumber,e.element.range.endLineNumber));const a=this.menus.getResourceActions(e.element);if(t.actionBar.push(a.actions,{icon:!0,label:!1}),t.actionBar.context={commentControlHandle:e.element.controllerHandle,commentThreadHandle:e.element.threadHandle,$mid:w.CommentThread},!e.element.hasReply()){t.repliesMetadata.container.style.display="none";return}t.repliesMetadata.container.style.display="",t.repliesMetadata.count.textContent=this.getCountString(i);const m=e.element.replies[e.element.replies.length-1].comment;t.repliesMetadata.lastReplyDetail.textContent=p.localize("lastReplyFrom","Last reply from {0}",m.userName),t.repliesMetadata.timestamp.setTimestamp(m.timestamp?new Date(m.timestamp):void 0)}getCommentThreadWidgetStateColor(e,r){return e!==void 0?oe(e,r):void 0}disposeTemplate(e){e.disposables.forEach(r=>r.dispose()),e.actionBar.dispose()}};C=I([d(2,re),d(3,E),d(4,X),d(5,ne)],C);var ae=(r=>(r[r.Resource=0]="Resource",r[r.Comment=1]="Comment",r))(ae||{});class Ct{constructor(e){this.options=e}filter(e,r){return this.options.filter===""&&this.options.showResolved&&this.options.showUnresolved?T.Visible:e instanceof R?this.filterResourceMarkers(e):this.filterCommentNode(e,r)}filterResourceMarkers(e){if(this.options.textFilter.text&&!this.options.textFilter.negate){const r=f._filter(this.options.textFilter.text,B(e.resource));if(r)return{visibility:!0,data:{type:0,uriMatches:r||[]}}}return T.Recurse}filterCommentNode(e,r){if(!(e.threadState===void 0||this.options.showResolved&&x.Resolved===e.threadState||this.options.showUnresolved&&x.Unresolved===e.threadState))return!1;if(!this.options.textFilter.text)return!0;const n=f._messageFilter(this.options.textFilter.text,typeof e.comment.body=="string"?e.comment.body:e.comment.body.value)||f._messageFilter(this.options.textFilter.text,e.comment.userName)||e.replies.map(i=>f._messageFilter(this.options.textFilter.text,i.comment.userName)||f._messageFilter(this.options.textFilter.text,typeof i.comment.body=="string"?i.comment.body:i.comment.body.value)).filter(i=>!!i).flat();return n.length&&!this.options.textFilter.negate?{visibility:!0,data:{type:1,textMatches:n}}:n.length&&this.options.textFilter.negate&&r===T.Recurse?!1:n.length===0&&this.options.textFilter.negate&&r===T.Recurse?!0:r}}let g=class extends te{constructor(r,t,n,i,s,a,m,c,h){const H=new M,$=q.bind(void 0,a),S=a.createInstance(v);S.setContextKeyService(i);const O=[a.createInstance(se,r),a.createInstance(C,$,S)];super("CommentsTree",t,H,O,{accessibilityProvider:n.accessibilityProvider,identityProvider:{getId:l=>l instanceof ie?"root":l instanceof R?`${l.uniqueOwner}-${l.id}`:l instanceof y?`${l.uniqueOwner}-${l.resource.toString()}-${l.threadId}-${l.comment.uniqueIdInThread}`+(l.isRoot?"-root":""):""},expandOnlyOnTwistieClick:!0,collapseByDefault:!1,overrideStyles:n.overrideStyles,filter:n.filter,sorter:n.sorter,findWidgetEnabled:!1,multipleSelectionSupport:!1},a,i,s,m);this.contextMenuService=c;this.keybindingService=h;this.menus=S,this.disposables.add(this.onContextMenu(l=>this.commentsOnContextMenu(l)))}menus;commentsOnContextMenu(r){const t=r.element;if(!(t instanceof y))return;const n=r.browserEvent;n.preventDefault(),n.stopPropagation(),this.setFocus([t]);const i=this.menus.getResourceContextActions(t);i.length&&this.contextMenuService.showContextMenu({getAnchor:()=>r.anchor,getActions:()=>i,getActionViewItem:s=>{const a=this.keybindingService.lookupKeybinding(s.id);if(a)return new K(s,s,{label:!0,keybinding:a.getLabel()})},onHide:s=>{s&&this.domFocus()},getActionsContext:()=>({commentControlHandle:t.controllerHandle,commentThreadHandle:t.threadHandle,$mid:w.CommentThread,thread:t.thread})})}filterComments(){this.refilter()}getVisibleItemCount(){let r=0;const t=this.getNode();for(const n of t.children)for(const i of n.children)i.visible&&n.visible&&r++;return r}};g=I([d(3,J),d(4,ee),d(5,Y),d(6,E),d(7,Q),d(8,Z)],g);export{ht as COMMENTS_VIEW_ID,ft as COMMENTS_VIEW_STORAGE_ID,vt as COMMENTS_VIEW_TITLE,C as CommentNodeRenderer,g as CommentsList,v as CommentsMenus,Ct as Filter,se as ResourceWithCommentsRenderer};