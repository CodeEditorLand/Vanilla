import{Memento as r}from"./memento.js";import{Themable as n}from"../../platform/theme/common/themeService.js";class b extends n{constructor(e,t,o){super(t);this.id=e;this.memento=new r(this.id,o),this._register(o.onWillSaveState(()=>{this.saveState(),this.memento.saveMemento()}))}memento;getId(){return this.id}getMemento(e,t){return this.memento.getMemento(e,t)}reloadMemento(e){return this.memento.reloadMemento(e)}onDidChangeMementoValue(e,t){return this.memento.onDidChangeValue(e,t)}saveState(){}}export{b as Component};
