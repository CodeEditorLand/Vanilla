import"../../base/common/event.js";import"../../base/common/lifecycle.js";import"../../platform/storage/common/storage.js";import{Themable as r}from"../../platform/theme/common/themeService.js";import{Memento as n}from"./memento.js";class b extends r{constructor(e,t,o){super(t);this.id=e;this.memento=new n(this.id,o),this._register(o.onWillSaveState(()=>{this.saveState(),this.memento.saveMemento()}))}memento;getId(){return this.id}getMemento(e,t){return this.memento.getMemento(e,t)}reloadMemento(e){return this.memento.reloadMemento(e)}onDidChangeMementoValue(e,t){return this.memento.onDidChangeValue(e,t)}saveState(){}}export{b as Component};
