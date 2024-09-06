import{Codicon as a}from"../../../../vs/base/common/codicons.js";import"../../../../vs/base/common/color.js";import{Emitter as l}from"../../../../vs/base/common/event.js";import{Disposable as c,toDisposable as h}from"../../../../vs/base/common/lifecycle.js";import"../../../../vs/platform/environment/common/environment.js";import{createDecorator as m}from"../../../../vs/platform/instantiation/common/instantiation.js";import*as s from"../../../../vs/platform/registry/common/platform.js";import"../../../../vs/platform/theme/common/colorRegistry.js";import"../../../../vs/platform/theme/common/iconRegistry.js";import{ColorScheme as r}from"../../../../vs/platform/theme/common/theme.js";const F=m("themeService");function R(e){return{id:e}}const w=a.file,H=a.folder;function _(e){switch(e){case r.DARK:return"vs-dark";case r.HIGH_CONTRAST_DARK:return"hc-black";case r.HIGH_CONTRAST_LIGHT:return"hc-light";default:return"vs"}}const g={ThemingContribution:"base.contributions.theming"};class u{themingParticipants=[];onThemingParticipantAddedEmitter;constructor(){this.themingParticipants=[],this.onThemingParticipantAddedEmitter=new l}onColorThemeChange(i){return this.themingParticipants.push(i),this.onThemingParticipantAddedEmitter.fire(i),h(()=>{const n=this.themingParticipants.indexOf(i);this.themingParticipants.splice(n,1)})}get onThemingParticipantAdded(){return this.onThemingParticipantAddedEmitter.event}getThemingParticipants(){return this.themingParticipants}}const d=new u;s.Registry.add(g.ThemingContribution,d);function G(e){return d.onColorThemeChange(e)}class L extends c{constructor(n){super();this.themeService=n;this.theme=n.getColorTheme(),this._register(this.themeService.onDidColorThemeChange(o=>this.onThemeChange(o)))}theme;onThemeChange(n){this.theme=n,this.updateStyles()}updateStyles(){}getColor(n,o){let t=this.theme.getColor(n);return t&&o&&(t=o(t,this.theme)),t?t.toString():null}}export{g as Extensions,w as FileThemeIcon,H as FolderThemeIcon,F as IThemeService,L as Themable,_ as getThemeTypeSelector,G as registerThemingParticipant,R as themeColorFromId};