import{Emitter as p}from"../../../../base/common/event.js";import{Disposable as l}from"../../../../base/common/lifecycle.js";import*as u from"../../../../nls.js";import{StorageScope as a,StorageTarget as d}from"../../../../platform/storage/common/storage.js";import{Memento as c}from"../../../common/memento.js";import{CustomEditorInfo as m}from"./customEditor.js";import{customEditorsExtensionPoint as E}from"./extensionPoint.js";import{RegisteredEditorPriority as i}from"../../../services/editor/common/editorResolverService.js";class s extends l{static CUSTOM_EDITORS_STORAGE_ID="customEditors";static CUSTOM_EDITORS_ENTRY_ID="editors";_editors=new Map;_memento;constructor(t){super(),this._memento=new c(s.CUSTOM_EDITORS_STORAGE_ID,t);const o=this._memento.getMemento(a.PROFILE,d.MACHINE);for(const e of o[s.CUSTOM_EDITORS_ENTRY_ID]||[])this.add(new m(e));E.setHandler(e=>{this.update(e)})}_onChange=this._register(new p);onChange=this._onChange.event;update(t){this._editors.clear();for(const e of t)for(const r of e.value)this.add(new m({id:r.viewType,displayName:r.displayName,providerDisplayName:e.description.isBuiltin?u.localize("builtinProviderDisplayName","Built-in"):e.description.displayName||e.description.identifier.value,selector:r.selector||[],priority:f(r,e.description)}));const o=this._memento.getMemento(a.PROFILE,d.MACHINE);o[s.CUSTOM_EDITORS_ENTRY_ID]=Array.from(this._editors.values()),this._memento.saveMemento(),this._onChange.fire()}[Symbol.iterator](){return this._editors.values()}get(t){return this._editors.get(t)}getContributedEditors(t){return Array.from(this._editors.values()).filter(o=>o.matches(t))}add(t){if(this._editors.has(t.id)){console.error(`Custom editor with id '${t.id}' already registered`);return}this._editors.set(t.id,t)}}function f(n,t){switch(n.priority){case i.default:case i.option:return n.priority;case i.builtin:return t.isBuiltin?i.builtin:i.default;default:return i.default}}export{s as ContributedCustomEditors};
