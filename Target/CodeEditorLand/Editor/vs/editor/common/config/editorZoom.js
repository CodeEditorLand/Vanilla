import{Emitter as o}from"../../../base/common/event.js";const n=new class{_zoomLevel=0;_onDidChangeZoomLevel=new o;onDidChangeZoomLevel=this._onDidChangeZoomLevel.event;getZoomLevel(){return this._zoomLevel}setZoomLevel(e){e=Math.min(Math.max(-5,e),20),this._zoomLevel!==e&&(this._zoomLevel=e,this._onDidChangeZoomLevel.fire(this._zoomLevel))}};export{n as EditorZoom};
