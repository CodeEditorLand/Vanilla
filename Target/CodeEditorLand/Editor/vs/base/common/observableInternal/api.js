import{ObservableValue as u}from"./base.js";import{strictEquals as r}from"./commonFacade/deps.js";import{DebugNameData as b}from"./debugName.js";import{LazyObservableValue as l}from"./lazyObservableValue.js";function y(e,a){return e.lazy?new l(new b(e.owner,e.debugName,void 0),a,e.equalsFn??r):new u(new b(e.owner,e.debugName,void 0),a,e.equalsFn??r)}export{y as observableValueOpts};
