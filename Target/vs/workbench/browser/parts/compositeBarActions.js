var Y=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var C=(h,d,e,t)=>{for(var i=t>1?void 0:t?V(d,e):d,o=h.length-1,r;o>=0;o--)(r=h[o])&&(i=(t?r(d,e,i):r(i))||i);return t&&i&&Y(d,e,i),i},n=(h,d)=>(e,t)=>d(e,t,h);import{localize as l}from"../../../nls.js";import{Action as T,Separator as U}from"../../../base/common/actions.js";import{$ as x,addDisposableListener as I,append as H,clearNode as q,EventHelper as N,EventType as y,getDomNodePagePosition as G,hide as K,show as F}from"../../../base/browser/dom.js";import{ICommandService as J}from"../../../platform/commands/common/commands.js";import{toDisposable as L,DisposableStore as Q,MutableDisposable as Z}from"../../../base/common/lifecycle.js";import{IContextMenuService as R}from"../../../platform/contextview/browser/contextView.js";import{IThemeService as k}from"../../../platform/theme/common/themeService.js";import{NumberBadge as z,ProgressBadge as ee}from"../../services/activity/common/activity.js";import{IInstantiationService as te}from"../../../platform/instantiation/common/instantiation.js";import{DelayedDragHandler as ie}from"../../../base/browser/dnd.js";import{IKeybindingService as M}from"../../../platform/keybinding/common/keybinding.js";import{Emitter as W,Event as oe}from"../../../base/common/event.js";import{CompositeDragAndDropObserver as re,toggleDropEffect as se}from"../dnd.js";import"../../../base/common/color.js";import{BaseActionViewItem as ne}from"../../../base/browser/ui/actionbar/actionViewItems.js";import{Codicon as ae}from"../../../base/common/codicons.js";import{ThemeIcon as de}from"../../../base/common/themables.js";import{IHoverService as P}from"../../../platform/hover/browser/hover.js";import{RunOnceScheduler as ce}from"../../../base/common/async.js";import{IConfigurationService as w}from"../../../platform/configuration/common/configuration.js";import"../../../base/browser/ui/hover/hoverWidget.js";import"../../../base/common/uri.js";import{badgeBackground as le,badgeForeground as he,contrastBorder as pe}from"../../../platform/theme/common/colorRegistry.js";class X extends T{constructor(e){super(e.id,e.name,e.classNames?.join(" "),!0);this.item=e}_onDidChangeCompositeBarActionItem=this._register(new W);onDidChangeCompositeBarActionItem=this._onDidChangeCompositeBarActionItem.event;_onDidChangeActivity=this._register(new W);onDidChangeActivity=this._onDidChangeActivity.event;_activity;get compositeBarActionItem(){return this.item}set compositeBarActionItem(e){this._label=e.name,this.item=e,this._onDidChangeCompositeBarActionItem.fire(this)}get activity(){return this._activity}set activity(e){this._activity=e,this._onDidChangeActivity.fire(e)}activate(){this.checked||this._setChecked(!0)}deactivate(){this.checked&&this._setChecked(!1)}}let p=class extends ne{constructor(e,t,i,o,r,a,s){super(null,e,t);this.badgesEnabled=i;this.themeService=o;this.hoverService=r;this.configurationService=a;this.keybindingService=s;this.options=t,this._register(this.themeService.onDidColorThemeChange(this.onThemeChange,this)),this._register(e.onDidChangeCompositeBarActionItem(()=>this.update())),this._register(oe.filter(s.onDidUpdateKeybindings,()=>this.keybindingLabel!==this.computeKeybindingLabel())(()=>this.updateTitle())),this._register(e.onDidChangeActivity(()=>this.updateActivity())),this._register(L(()=>this.showHoverScheduler.cancel()))}static hoverLeaveTime=0;container;label;badge;options;badgeContent;badgeDisposable=this._register(new Z);mouseUpTimeout;keybindingLabel;hoverDisposables=this._register(new Q);lastHover;showHoverScheduler=new ce(()=>this.showHover(),0);get compositeBarActionItem(){return this._action.compositeBarActionItem}updateStyles(){const e=this.themeService.getColorTheme(),t=this.options.colors(e);if(this.label){if(this.options.icon){const i=this._action.checked?t.activeForegroundColor:t.inactiveForegroundColor;this.compositeBarActionItem.iconUrl?(this.label.style.backgroundColor=i?i.toString():"",this.label.style.color=""):(this.label.style.color=i?i.toString():"",this.label.style.backgroundColor="")}else{const i=this._action.checked?t.activeForegroundColor:t.inactiveForegroundColor,o=this._action.checked?t.activeBorderBottomColor:null;this.label.style.color=i?i.toString():"",this.label.style.borderBottomColor=o?o.toString():""}this.container.style.setProperty("--insert-border-color",t.dragAndDropBorder?t.dragAndDropBorder.toString():"")}if(this.badgeContent){const i=t.badgeForeground??e.getColor(he),o=t.badgeBackground??e.getColor(le),r=e.getColor(pe);this.badgeContent.style.color=i?i.toString():"",this.badgeContent.style.backgroundColor=o?o.toString():"",this.badgeContent.style.borderStyle=r&&!this.options.compact?"solid":"",this.badgeContent.style.borderWidth=r?"1px":"",this.badgeContent.style.borderColor=r?r.toString():""}}render(e){super.render(e),this.container=e,this.options.icon&&this.container.classList.add("icon"),this.options.hasPopup?(this.container.setAttribute("role","button"),this.container.setAttribute("aria-haspopup","true")):this.container.setAttribute("role","tab"),this._register(I(this.container,y.MOUSE_DOWN,()=>{this.container.classList.add("clicked")})),this._register(I(this.container,y.MOUSE_UP,()=>{this.mouseUpTimeout&&clearTimeout(this.mouseUpTimeout),this.mouseUpTimeout=setTimeout(()=>{this.container.classList.remove("clicked")},800)})),this.label=H(e,x("a")),this.badge=H(e,x(".badge")),this.badgeContent=H(this.badge,x(".badge-content")),H(e,x(".active-item-indicator")),K(this.badge),this.update(),this.updateStyles(),this.updateHover()}onThemeChange(e){this.updateStyles()}update(){this.updateLabel(),this.updateActivity(),this.updateTitle(),this.updateStyles()}updateActivity(){const e=this.action;if(!this.badge||!this.badgeContent||!(e instanceof X))return;const t=e.activity;this.badgeDisposable.clear(),q(this.badgeContent),K(this.badge);const i=this.badgesEnabled(this.compositeBarActionItem.id);if(t&&i){const{badge:o}=t,r=[];if(this.options.compact&&r.push("compact"),o instanceof ee)F(this.badge),r.push("progress-badge");else if(o instanceof z&&o.number){let a=o.number.toString();if(o.number>999){const s=o.number/1e3,c=Math.floor(s);s>c?a=`${c}K+`:a=`${s}K`}this.options.compact&&a.length>=3&&r.push("compact-content"),this.badgeContent.textContent=a,F(this.badge)}r.length&&(this.badge.classList.add(...r),this.badgeDisposable.value=L(()=>this.badge.classList.remove(...r)))}this.updateTitle()}updateLabel(){this.label.className="action-label",this.compositeBarActionItem.classNames&&this.label.classList.add(...this.compositeBarActionItem.classNames),this.options.icon||(this.label.textContent=this.action.label)}updateTitle(){const e=this.computeTitle();[this.label,this.badge,this.container].forEach(t=>{t&&(t.setAttribute("aria-label",e),t.setAttribute("title",""),t.removeAttribute("title"))})}computeTitle(){this.keybindingLabel=this.computeKeybindingLabel();let e=this.keybindingLabel?l("titleKeybinding","{0} ({1})",this.compositeBarActionItem.name,this.keybindingLabel):this.compositeBarActionItem.name;const t=this.action.activity?.badge;return t?.getDescription()&&(e=l("badgeTitle","{0} - {1}",e,t.getDescription())),e}computeKeybindingLabel(){return(this.compositeBarActionItem.keybindingId?this.keybindingService.lookupKeybinding(this.compositeBarActionItem.keybindingId):null)?.getLabel()}updateHover(){this.hoverDisposables.clear(),this.updateTitle(),this.hoverDisposables.add(I(this.container,y.MOUSE_OVER,()=>{this.showHoverScheduler.isScheduled()||(Date.now()-p.hoverLeaveTime<200?this.showHover(!0):this.showHoverScheduler.schedule(this.configurationService.getValue("workbench.hover.delay")))},!0)),this.hoverDisposables.add(I(this.container,y.MOUSE_LEAVE,e=>{e.target===this.container&&(p.hoverLeaveTime=Date.now(),this.hoverService.hideHover(),this.showHoverScheduler.cancel())},!0)),this.hoverDisposables.add(L(()=>{this.hoverService.hideHover(),this.showHoverScheduler.cancel()}))}showHover(e=!1){if(this.lastHover&&!this.lastHover.isDisposed)return;const t=this.options.hoverOptions.position();this.lastHover=this.hoverService.showHover({target:this.container,content:this.computeTitle(),position:{hoverPosition:t},persistence:{hideOnKeyDown:!0},appearance:{showPointer:!0,compact:!0,skipFadeInAnimation:e}})}dispose(){super.dispose(),this.mouseUpTimeout&&clearTimeout(this.mouseUpTimeout),this.badge.remove()}};p=C([n(3,k),n(4,P),n(5,w),n(6,M)],p);class Ye extends X{constructor(e){super({id:"additionalComposites.action",name:l("additionalViews","Additional Views"),classNames:de.asClassNameArray(ae.more)});this.showMenu=e}async run(){this.showMenu()}}let E=class extends p{constructor(e,t,i,o,r,a,s,c,f,v,u,b){super(e,{icon:!0,colors:a,hasPopup:!0,hoverOptions:s},()=>!0,f,v,u,b);this.getOverflowingComposites=t;this.getActiveCompositeId=i;this.getBadge=o;this.getCompositeOpenAction=r;this.contextMenuService=c}showMenu(){this.contextMenuService.showContextMenu({getAnchor:()=>this.container,getActions:()=>this.getActions(),getCheckedActionsRepresentation:()=>"radio"})}getActions(){return this.getOverflowingComposites().map(e=>{const t=this.getCompositeOpenAction(e.id);t.checked=this.getActiveCompositeId()===t.id;const i=this.getBadge(e.id);let o;return i instanceof z&&(o=i.number),o?t.label=l("numberBadge","{0} ({1})",e.name,o):t.label=e.name||"",t})}};E=C([n(7,R),n(8,k),n(9,P),n(10,w),n(11,M)],E);let A=class extends T{constructor(e){super("activitybar.manage.extension",l("manageExtension","Manage Extension"));this.commandService=e}run(e){return this.commandService.executeCommand("_extensions.manage",e)}};A=C([n(0,J)],A);let m=class extends p{constructor(e,t,i,o,r,a,s,c,f,v,u,b,B,D){super(t,e,c.areBadgesEnabled.bind(c),b,B,D,v);this.compositeActivityAction=t;this.toggleCompositePinnedAction=i;this.toggleCompositeBadgeAction=o;this.compositeContextMenuActionsProvider=r;this.contextMenuActionsProvider=a;this.dndHandler=s;this.compositeBar=c;this.contextMenuService=f;m.manageExtensionAction||(m.manageExtensionAction=u.createInstance(A))}static manageExtensionAction;render(e){super.render(e),this.updateChecked(),this.updateEnabled(),this._register(I(this.container,y.CONTEXT_MENU,i=>{N.stop(i,!0),this.showContextMenu(e)}));let t;this._register(re.INSTANCE.registerDraggable(this.container,()=>({type:"composite",id:this.compositeBarActionItem.id}),{onDragOver:i=>{const o=i.dragAndDropData.getData().id!==this.compositeBarActionItem.id&&this.dndHandler.onDragOver(i.dragAndDropData,this.compositeBarActionItem.id,i.eventData);se(i.eventData.dataTransfer,"move",o),t=this.updateFromDragging(e,o,i.eventData)},onDragLeave:i=>{t=this.updateFromDragging(e,!1,i.eventData)},onDragEnd:i=>{t=this.updateFromDragging(e,!1,i.eventData)},onDrop:i=>{N.stop(i.eventData,!0),this.dndHandler.drop(i.dragAndDropData,this.compositeBarActionItem.id,i.eventData,t),t=this.updateFromDragging(e,!1,i.eventData)},onDragStart:i=>{i.dragAndDropData.getData().id===this.compositeBarActionItem.id&&(i.eventData.dataTransfer&&(i.eventData.dataTransfer.effectAllowed="move"),this.blur())}})),[this.badge,this.label].forEach(i=>this._register(new ie(i,()=>{this.action.checked||this.action.run()}))),this.updateStyles()}updateFromDragging(e,t,i){const o=e.getBoundingClientRect(),r=i.clientX,a=i.clientY,s=o.bottom-o.top,c=o.right-o.left,f=a<=o.top+s*.4,v=a>o.bottom-s*.4,u=a<=o.top+s*.5,b=r<=o.left+c*.4,B=r>o.right-c*.4,D=r<=o.left+c*.5,S=e.classList,g={vertical:S.contains("top")?"top":S.contains("bottom")?"bottom":void 0,horizontal:S.contains("left")?"left":S.contains("right")?"right":void 0},_=f||u&&!g.vertical||!v&&g.vertical==="top",$=v||!u&&!g.vertical||!f&&g.vertical==="bottom",O=b||D&&!g.horizontal||!B&&g.horizontal==="left",j=B||!D&&!g.horizontal||!b&&g.horizontal==="right";if(e.classList.toggle("top",t&&_),e.classList.toggle("bottom",t&&$),e.classList.toggle("left",t&&O),e.classList.toggle("right",t&&j),!!t)return{verticallyBefore:_,horizontallyBefore:O}}showContextMenu(e){const t=[this.toggleCompositePinnedAction,this.toggleCompositeBadgeAction],i=this.compositeContextMenuActionsProvider(this.compositeBarActionItem.id);i.length&&t.push(...i),this.compositeActivityAction.compositeBarActionItem.extensionId&&(t.push(new U),t.push(m.manageExtensionAction)),this.compositeBar.isPinned(this.compositeBarActionItem.id)?(this.toggleCompositePinnedAction.label=l("hide","Hide '{0}'",this.compositeBarActionItem.name),this.toggleCompositePinnedAction.checked=!1):this.toggleCompositePinnedAction.label=l("keep","Keep '{0}'",this.compositeBarActionItem.name),this.compositeBar.areBadgesEnabled(this.compositeBarActionItem.id)?this.toggleCompositeBadgeAction.label=l("hideBadge","Hide Badge"):this.toggleCompositeBadgeAction.label=l("showBadge","Show Badge");const a=this.contextMenuActionsProvider();a.length&&(t.push(new U),t.push(...a));const s=G(e),c={x:Math.floor(s.left+s.width/2),y:s.top+s.height};this.contextMenuService.showContextMenu({getAnchor:()=>c,getActions:()=>t,getActionsContext:()=>this.compositeBarActionItem.id})}updateChecked(){this.action.checked?(this.container.classList.add("checked"),this.container.setAttribute("aria-label",this.getTooltip()??this.container.title),this.container.setAttribute("aria-expanded","true"),this.container.setAttribute("aria-selected","true")):(this.container.classList.remove("checked"),this.container.setAttribute("aria-label",this.getTooltip()??this.container.title),this.container.setAttribute("aria-expanded","false"),this.container.setAttribute("aria-selected","false")),this.updateStyles()}updateEnabled(){this.element&&(this.action.enabled?this.element.classList.remove("disabled"):this.element.classList.add("disabled"))}dispose(){super.dispose(),this.label.remove()}};m=C([n(8,R),n(9,M),n(10,te),n(11,k),n(12,P),n(13,w)],m);class Ve extends T{constructor(e,t){super("show.toggleCompositePinned",e?e.name:l("toggle","Toggle View Pinned"));this.activity=e;this.compositeBar=t;this.checked=!!this.activity&&this.compositeBar.isPinned(this.activity.id)}async run(e){const t=this.activity?this.activity.id:e;this.compositeBar.isPinned(t)?this.compositeBar.unpin(t):this.compositeBar.pin(t)}}class qe extends T{constructor(e,t){super("show.toggleCompositeBadge",e?e.name:l("toggleBadge","Toggle View Badge"));this.compositeBarActionItem=e;this.compositeBar=t;this.checked=!1}async run(e){const t=this.compositeBarActionItem?this.compositeBarActionItem.id:e;this.compositeBar.toggleBadgeEnablement(t)}}export{m as CompositeActionViewItem,X as CompositeBarAction,p as CompositeBarActionViewItem,Ye as CompositeOverflowActivityAction,E as CompositeOverflowActivityActionViewItem,qe as ToggleCompositeBadgeAction,Ve as ToggleCompositePinnedAction};
