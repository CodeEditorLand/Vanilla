import{trackFocus as d}from"../../base/browser/dom.js";import"../../base/browser/ui/actionbar/actionbar.js";import"../../base/browser/ui/actionbar/actionViewItems.js";import"../../base/browser/ui/sash/sash.js";import{ActionRunner as c}from"../../base/common/actions.js";import{Emitter as n}from"../../base/common/event.js";import{Disposable as a}from"../../base/common/lifecycle.js";import{assertIsDefined as u}from"../../base/common/types.js";import"../../platform/actions/common/actions.js";import"../../platform/instantiation/common/instantiation.js";import"../../platform/storage/common/storage.js";import"../../platform/telemetry/common/telemetry.js";import"../../platform/theme/common/themeService.js";import{Component as p}from"../common/component.js";import"../common/composite.js";class G extends p{constructor(e,i,o,r){super(e,o,r);this.telemetryService=i}_onTitleAreaUpdate=this._register(new n);onTitleAreaUpdate=this._onTitleAreaUpdate.event;_onDidFocus;get onDidFocus(){return this._onDidFocus||(this._onDidFocus=this.registerFocusTrackEvents().onDidFocus),this._onDidFocus.event}_onDidBlur;get onDidBlur(){return this._onDidBlur||(this._onDidBlur=this.registerFocusTrackEvents().onDidBlur),this._onDidBlur.event}_hasFocus=!1;hasFocus(){return this._hasFocus}registerFocusTrackEvents(){const e=u(this.getContainer()),i=this._register(d(e)),o=this._onDidFocus=this._register(new n);this._register(i.onDidFocus(()=>{this._hasFocus=!0,o.fire()}));const r=this._onDidBlur=this._register(new n);return this._register(i.onDidBlur(()=>{this._hasFocus=!1,r.fire()})),{onDidFocus:o,onDidBlur:r}}actionRunner;visible=!1;parent;getTitle(){}create(e){this.parent=e}getContainer(){return this.parent}setVisible(e){this.visible!==!!e&&(this.visible=e)}focus(){}getMenuIds(){return[]}getActions(){return[]}getSecondaryActions(){return[]}getContextMenuActions(){return[]}getActionViewItem(e,i){}getActionsContext(){return null}getActionRunner(){return this.actionRunner||(this.actionRunner=this._register(new c)),this.actionRunner}updateTitleArea(){this._onTitleAreaUpdate.fire()}isVisible(){return this.visible}getControl(){}}class J{constructor(t,e,i,o,r,m){this.ctor=t;this.id=e;this.name=i;this.cssClass=o;this.order=r;this.requestedIndex=m}instantiate(t){return t.createInstance(this.ctor)}}class K extends a{_onDidRegister=this._register(new n);onDidRegister=this._onDidRegister.event;_onDidDeregister=this._register(new n);onDidDeregister=this._onDidDeregister.event;composites=[];registerComposite(t){this.compositeById(t.id)||(this.composites.push(t),this._onDidRegister.fire(t))}deregisterComposite(t){const e=this.compositeById(t);e&&(this.composites.splice(this.composites.indexOf(e),1),this._onDidDeregister.fire(e))}getComposite(t){return this.compositeById(t)}getComposites(){return this.composites.slice(0)}compositeById(t){return this.composites.find(e=>e.id===t)}}export{G as Composite,J as CompositeDescriptor,K as CompositeRegistry};
