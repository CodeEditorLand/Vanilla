import{AbstractNonRecursiveWatcherClient as t}from"../../../common/watcher.js";import{NodeJSWatcher as s}from"./nodejsWatcher.js";class l extends t{constructor(e,r,o){super(e,r,o),this.init()}createWatcher(e){return e.add(new s(void 0))}}export{l as NodeJSWatcherClient};
