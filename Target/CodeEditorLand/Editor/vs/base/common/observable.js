import{ConsoleObservableLogger as e,setLogger as r}from"../../../vs/base/common/observableInternal/logging.js";import{observableValue as s,disposableObservableValue as n,transaction as l,subtransaction as i}from"../../../vs/base/common/observableInternal/base.js";import{derived as d,derivedOpts as m,derivedHandleChanges as u,derivedWithStore as g}from"../../../vs/base/common/observableInternal/derived.js";import{autorun as p,autorunDelta as c,autorunHandleChanges as h,autorunWithStore as I,autorunOpts as f,autorunWithStoreHandleChanges as C}from"../../../vs/base/common/observableInternal/autorun.js";import{constObservable as S,debouncedObservable as W,derivedObservableWithCache as y,derivedObservableWithWritableCache as L,keepObserved as F,recomputeInitiallyAndOnChange as P,observableFromEvent as T,observableFromPromise as k,observableSignal as w,observableSignalFromEvent as E,wasEventTriggeredRecently as H}from"../../../vs/base/common/observableInternal/utils.js";import{ObservableLazy as V,ObservableLazyPromise as z,ObservablePromise as A,PromiseResult as D,waitForState as j,derivedWithCancellationToken as q}from"../../../vs/base/common/observableInternal/promise.js";import{observableValueOpts as G}from"../../../vs/base/common/observableInternal/api.js";const a=!1;a&&r(new e);export{V as ObservableLazy,z as ObservableLazyPromise,A as ObservablePromise,D as PromiseResult,p as autorun,c as autorunDelta,h as autorunHandleChanges,f as autorunOpts,I as autorunWithStore,C as autorunWithStoreHandleChanges,S as constObservable,W as debouncedObservable,d as derived,u as derivedHandleChanges,y as derivedObservableWithCache,L as derivedObservableWithWritableCache,m as derivedOpts,q as derivedWithCancellationToken,g as derivedWithStore,n as disposableObservableValue,F as keepObserved,T as observableFromEvent,k as observableFromPromise,w as observableSignal,E as observableSignalFromEvent,s as observableValue,G as observableValueOpts,P as recomputeInitiallyAndOnChange,i as subtransaction,l as transaction,j as waitForState,H as wasEventTriggeredRecently};
