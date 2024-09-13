import{Emitter as s}from"../../../../base/common/event.js";import{StorageScope as o,StorageTarget as n}from"../../../../platform/storage/common/storage.js";import{OutlineSortOrder as i}from"./outline.js";class h{_followCursor=!1;_filterOnType=!0;_sortBy=i.ByPosition;_onDidChange=new s;onDidChange=this._onDidChange.event;dispose(){this._onDidChange.dispose()}set followCursor(t){t!==this._followCursor&&(this._followCursor=t,this._onDidChange.fire({followCursor:!0}))}get followCursor(){return this._followCursor}get filterOnType(){return this._filterOnType}set filterOnType(t){t!==this._filterOnType&&(this._filterOnType=t,this._onDidChange.fire({filterOnType:!0}))}set sortBy(t){t!==this._sortBy&&(this._sortBy=t,this._onDidChange.fire({sortBy:!0}))}get sortBy(){return this._sortBy}persist(t){t.store("outline/state",JSON.stringify({followCursor:this.followCursor,sortBy:this.sortBy,filterOnType:this.filterOnType}),o.WORKSPACE,n.MACHINE)}restore(t){const r=t.get("outline/state",o.WORKSPACE);if(!r)return;let e;try{e=JSON.parse(r)}catch{return}this.followCursor=e.followCursor,this.sortBy=e.sortBy??i.ByPosition,typeof e.filterOnType=="boolean"&&(this.filterOnType=e.filterOnType)}}export{h as OutlineViewState};
