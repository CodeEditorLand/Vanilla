import{DisposableStore as s}from"../common/lifecycle.js";import{autorun as a}from"../common/observable.js";import{createStyleSheet2 as b}from"./dom.js";function S(r){const e=new s,t=e.add(b());return e.add(a(o=>{t.setStyle(r.read(o))})),e}export{S as createStyleSheetFromObservable};
