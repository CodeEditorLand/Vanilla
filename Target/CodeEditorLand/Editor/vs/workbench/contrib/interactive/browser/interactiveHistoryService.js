import{HistoryNavigator2 as i}from"../../../../../vs/base/common/history.js";import{Disposable as s}from"../../../../../vs/base/common/lifecycle.js";import{ResourceMap as o}from"../../../../../vs/base/common/map.js";import"../../../../../vs/base/common/uri.js";import{createDecorator as n}from"../../../../../vs/platform/instantiation/common/instantiation.js";const I=n("IInteractiveHistoryService");class v extends s{_history;constructor(){super(),this._history=new o}matchesCurrent(r,e){const t=this._history.get(r);return t?t.current()===e:!1}addToHistory(r,e){const t=this._history.get(r);if(!t){this._history.set(r,new i([e],50));return}t.resetCursor(),t.add(e)}getPreviousValue(r){return this._history.get(r)?.previous()??null}getNextValue(r){return this._history.get(r)?.next()??null}replaceLast(r,e){const t=this._history.get(r);if(t)t.replaceLast(e),t.resetCursor();else{this._history.set(r,new i([e],50));return}}clearHistory(r){this._history.delete(r)}has(r){return!!this._history.has(r)}}export{I as IInteractiveHistoryService,v as InteractiveHistoryService};
