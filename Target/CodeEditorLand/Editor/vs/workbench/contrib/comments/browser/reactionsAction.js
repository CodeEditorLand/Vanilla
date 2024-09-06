import*as o from"../../../../base/browser/dom.js";import{ActionViewItem as m}from"../../../../base/browser/ui/actionbar/actionViewItems.js";import{Action as a}from"../../../../base/common/actions.js";import{URI as u}from"../../../../base/common/uri.js";import*as n from"../../../../nls.js";class r extends a{static ID="toolbar.toggle.pickReactions";_menuActions=[];toggleDropdownMenu;constructor(e,t){super(r.ID,t||n.localize("pickReactions","Pick Reactions..."),"toggle-reactions",!0),this.toggleDropdownMenu=e}run(){return this.toggleDropdownMenu(),Promise.resolve(!0)}get menuActions(){return this._menuActions}set menuActions(e){this._menuActions=e}}class j extends m{constructor(e){super(null,e,{})}updateLabel(){if(!this.label)return;const e=this.action;if(e.class&&this.label.classList.add(e.class),e.icon){const t=o.append(this.label,o.$(".reaction-icon")),i=u.revive(e.icon);t.style.backgroundImage=o.asCSSUrl(i)}else{const t=o.append(this.label,o.$("span.reaction-label"));t.innerText=e.label}if(e.count){const t=o.append(this.label,o.$("span.reaction-count"));t.innerText=`${e.count}`}}getTooltip(){const e=this.action,t=e.enabled?n.localize("comment.toggleableReaction","Toggle reaction, "):"";if(e.count===void 0)return n.localize({key:"comment.reactionLabelNone",comment:["This is a tooltip for an emoji button so that the current user can toggle their reaction to a comment.",`The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second is the name of the reaction.`]},"{0}{1} reaction",t,e.label);if(e.reactors===void 0||e.reactors.length===0){if(e.count===1)return n.localize({key:"comment.reactionLabelOne",comment:['This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is 1.',"The emoji is also a button so that the current user can also toggle their own emoji reaction.",`The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second is the name of the reaction.`]},"{0}1 reaction with {1}",t,e.label);if(e.count>1)return n.localize({key:"comment.reactionLabelMany",comment:['This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is greater than 1.',"The emoji is also a button so that the current user can also toggle their own emoji reaction.",`The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second is number of users who have reacted with that reaction, and the third is the name of the reaction.`]},"{0}{1} reactions with {2}",t,e.count,e.label)}else{if(e.reactors.length<=10&&e.reactors.length===e.count)return n.localize({key:"comment.reactionLessThanTen",comment:['This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is less than or equal to 10.',"The emoji is also a button so that the current user can also toggle their own emoji reaction.",`The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second iis a list of the reactors, and the third is the name of the reaction.`]},"{0}{1} reacted with {2}",t,e.reactors.join(", "),e.label);if(e.count>1){const i=e.reactors.slice(0,10);return n.localize({key:"comment.reactionMoreThanTen",comment:['This is a tooltip for an emoji that is a "reaction" to a comment where the count of the reactions is less than or equal to 10.',"The emoji is also a button so that the current user can also toggle their own emoji reaction.",`The first arg is localized message "Toggle reaction" or empty if the user doesn't have permission to toggle the reaction, the second iis a list of the reactors, and the third is the name of the reaction.`]},"{0}{1} and {2} more reacted with {3}",t,i.join(", "),e.count-i.length,e.label)}}}}class s extends a{constructor(t,i="",c="",l=!0,h,d,p,f){super(s.ID,i,c,l,h);this.reactors=d;this.icon=p;this.count=f}static ID="toolbar.toggle.reaction"}export{s as ReactionAction,j as ReactionActionViewItem,r as ToggleReactionsAction};
