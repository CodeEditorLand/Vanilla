import"../../../../base/common/cancellation.js";import{toDisposable as r}from"../../../../base/common/lifecycle.js";import{LinkedList as o}from"../../../../base/common/linkedList.js";import{InstantiationType as a,registerSingleton as s}from"../../../../platform/instantiation/common/extensions.js";import"../../../common/editor.js";import{IOutlineService as l}from"./outline.js";import{Emitter as f}from"../../../../base/common/event.js";class u{_factories=new o;_onDidChange=new f;onDidChange=this._onDidChange.event;canCreateOutline(e){for(const t of this._factories)if(t.matches(e))return!0;return!1}async createOutline(e,t,n){for(const i of this._factories)if(i.matches(e))return await i.createOutline(e,t,n)}registerOutlineCreator(e){const t=this._factories.push(e);return this._onDidChange.fire(),r(()=>{t(),this._onDidChange.fire()})}}s(l,u,a.Delayed);
