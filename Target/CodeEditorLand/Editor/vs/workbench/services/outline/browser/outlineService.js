import"../../../../../vs/base/common/cancellation.js";import{Emitter as r}from"../../../../../vs/base/common/event.js";import{toDisposable as o}from"../../../../../vs/base/common/lifecycle.js";import{LinkedList as a}from"../../../../../vs/base/common/linkedList.js";import{InstantiationType as s,registerSingleton as l}from"../../../../../vs/platform/instantiation/common/extensions.js";import"../../../../../vs/workbench/common/editor.js";import{IOutlineService as f}from"../../../../../vs/workbench/services/outline/browser/outline.js";class u{_factories=new a;_onDidChange=new r;onDidChange=this._onDidChange.event;canCreateOutline(e){for(const t of this._factories)if(t.matches(e))return!0;return!1}async createOutline(e,t,n){for(const i of this._factories)if(i.matches(e))return await i.createOutline(e,t,n)}registerOutlineCreator(e){const t=this._factories.push(e);return this._onDidChange.fire(),o(()=>{t(),this._onDidChange.fire()})}}l(f,u,s.Delayed);