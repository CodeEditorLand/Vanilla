import{createDecorator as n}from"../../instantiation/common/instantiation.js";const p=n("undoRedoService");var t=(e=>(e[e.Resource=0]="Resource",e[e.Workspace=1]="Workspace",e))(t||{});class m{constructor(d,e){this.resource=d;this.elements=e}}class o{static _ID=0;id;order;constructor(){this.id=o._ID++,this.order=1}nextOrder(){return this.id===0?0:this.order++}static None=new o}class r{static _ID=0;id;order;constructor(){this.id=r._ID++,this.order=1}nextOrder(){return this.id===0?0:this.order++}static None=new r}export{p as IUndoRedoService,m as ResourceEditStackSnapshot,t as UndoRedoElementType,o as UndoRedoGroup,r as UndoRedoSource};
