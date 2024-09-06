import{diffSets as n}from"../../../../../../base/common/collections.js";import{Emitter as a}from"../../../../../../base/common/event.js";import{Disposable as h,DisposableStore as b}from"../../../../../../base/common/lifecycle.js";import{isDefined as l}from"../../../../../../base/common/types.js";import{cellRangesToIndexes as C}from"../../../common/notebookRange.js";import"../../notebookBrowser.js";class D extends h{constructor(i){super();this._notebookEditor=i;this._register(this._notebookEditor.onDidChangeVisibleRanges(this._updateVisibleCells,this)),this._register(this._notebookEditor.onDidChangeModel(this._onModelChange,this)),this._updateVisibleCells()}_onDidChangeVisibleCells=this._register(new a);onDidChangeVisibleCells=this._onDidChangeVisibleCells.event;_viewModelDisposables=this._register(new b);_visibleCells=[];get visibleCells(){return this._visibleCells}_onModelChange(){this._viewModelDisposables.clear(),this._notebookEditor.hasModel()&&this._viewModelDisposables.add(this._notebookEditor.onDidChangeViewCells(()=>this.updateEverything())),this.updateEverything()}updateEverything(){this._onDidChangeVisibleCells.fire({added:[],removed:Array.from(this._visibleCells)}),this._visibleCells=[],this._updateVisibleCells()}_updateVisibleCells(){if(!this._notebookEditor.hasModel())return;const i=C(this._notebookEditor.visibleRanges).map(e=>this._notebookEditor.cellAt(e)).filter(l),t=new Set(i.map(e=>e.handle)),s=new Set(this._visibleCells.map(e=>e.handle)),o=n(s,t),d=o.added.map(e=>this._notebookEditor.getCellByHandle(e)).filter(l),r=o.removed.map(e=>this._notebookEditor.getCellByHandle(e)).filter(l);this._visibleCells=i,this._onDidChangeVisibleCells.fire({added:d,removed:r})}}export{D as NotebookVisibleCellObserver};
