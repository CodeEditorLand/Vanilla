import{Codicon as c}from"../../../../../vs/base/common/codicons.js";import{Emitter as y}from"../../../../../vs/base/common/event.js";import{KeyCode as d,KeyMod as u}from"../../../../../vs/base/common/keyCodes.js";import{Disposable as p}from"../../../../../vs/base/common/lifecycle.js";import{localize as t}from"../../../../../vs/nls.js";import{MenuId as f,MenuRegistry as S,registerAction2 as n}from"../../../../../vs/platform/actions/common/actions.js";import{ContextKeyExpr as m,RawContextKey as l}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingWeight as w}from"../../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{viewFilterSubmenu as a}from"../../../../../vs/workbench/browser/parts/views/viewFilter.js";import{ViewAction as i}from"../../../../../vs/workbench/browser/parts/views/viewPane.js";import{FocusedViewContext as b}from"../../../../../vs/workbench/common/contextkeys.js";import{CommentsViewFilterFocusContextKey as h}from"../../../../../vs/workbench/contrib/comments/browser/comments.js";import{COMMENTS_VIEW_ID as s}from"../../../../../vs/workbench/contrib/comments/browser/commentsTreeViewer.js";var I=(o=>(o.ResourceAscending="resourceAscending",o.UpdatedAtDescending="updatedAtDescending",o))(I||{});const g=new l("commentsView.showResolvedFilter",!0),C=new l("commentsView.showUnResolvedFilter",!0),_=new l("commentsView.sortBy","resourceAscending");class Y extends p{constructor(o,V){super();this.contextKeyService=V;this._showResolved.set(o.showResolved),this._showUnresolved.set(o.showUnresolved),this._sortBy.set(o.sortBy)}_onDidChange=this._register(new y);onDidChange=this._onDidChange.event;_showUnresolved=C.bindTo(this.contextKeyService);get showUnresolved(){return!!this._showUnresolved.get()}set showUnresolved(o){this._showUnresolved.get()!==o&&(this._showUnresolved.set(o),this._onDidChange.fire({showUnresolved:!0}))}_showResolved=g.bindTo(this.contextKeyService);get showResolved(){return!!this._showResolved.get()}set showResolved(o){this._showResolved.get()!==o&&(this._showResolved.set(o),this._onDidChange.fire({showResolved:!0}))}_sortBy=_.bindTo(this.contextKeyService);get sortBy(){return this._sortBy.get()}set sortBy(o){this._sortBy.get()!==o&&(this._sortBy.set(o),this._onDidChange.fire({sortBy:o}))}}n(class extends i{constructor(){super({id:"commentsFocusViewFromFilter",title:t("focusCommentsList","Focus Comments view"),keybinding:{when:h,weight:w.WorkbenchContrib,primary:u.CtrlCmd|d.DownArrow},viewId:s})}async runInView(r,e){e.focus()}}),n(class extends i{constructor(){super({id:"commentsClearFilterText",title:t("commentsClearFilterText","Clear filter text"),keybinding:{when:h,weight:w.WorkbenchContrib,primary:d.Escape},viewId:s})}async runInView(r,e){e.clearFilterText()}}),n(class extends i{constructor(){super({id:"commentsFocusFilter",title:t("focusCommentsFilter","Focus comments filter"),keybinding:{when:b.isEqualTo(s),weight:w.WorkbenchContrib,primary:u.CtrlCmd|d.KeyF},viewId:s})}async runInView(r,e){e.focusFilter()}}),n(class extends i{constructor(){super({id:`workbench.actions.${s}.toggleUnResolvedComments`,title:t("toggle unresolved","Show Unresolved"),category:t("comments","Comments"),toggled:{condition:C,title:t("unresolved","Show Unresolved")},menu:{id:a,group:"1_filter",when:m.equals("view",s),order:1},viewId:s})}async runInView(r,e){e.filters.showUnresolved=!e.filters.showUnresolved}}),n(class extends i{constructor(){super({id:`workbench.actions.${s}.toggleResolvedComments`,title:t("toggle resolved","Show Resolved"),category:t("comments","Comments"),toggled:{condition:g,title:t("resolved","Show Resolved")},menu:{id:a,group:"1_filter",when:m.equals("view",s),order:1},viewId:s})}async runInView(r,e){e.filters.showResolved=!e.filters.showResolved}});const v=new f("submenu.filter.commentSort");S.appendMenuItem(a,{submenu:v,title:t("comment sorts","Sort By"),group:"2_sort",icon:c.history,when:m.equals("view",s)}),n(class extends i{constructor(){super({id:`workbench.actions.${s}.toggleSortByUpdatedAt`,title:t("toggle sorting by updated at","Updated Time"),category:t("comments","Comments"),icon:c.history,viewId:s,toggled:{condition:m.equals("commentsView.sortBy","updatedAtDescending"),title:t("sorting by updated at","Updated Time")},menu:{id:v,group:"navigation",order:1,isHiddenByDefault:!1}})}async runInView(r,e){e.filters.sortBy="updatedAtDescending"}}),n(class extends i{constructor(){super({id:`workbench.actions.${s}.toggleSortByResource`,title:t("toggle sorting by resource","File"),category:t("comments","Comments"),icon:c.history,viewId:s,toggled:{condition:m.equals("commentsView.sortBy","resourceAscending"),title:t("sorting by file","File")},menu:{id:v,group:"navigation",order:0,isHiddenByDefault:!1}})}async runInView(r,e){e.filters.sortBy="resourceAscending"}});export{Y as CommentsFilters,I as CommentsSortOrder};