import{timeout as S}from"../../../base/common/async.js";import{CancellationTokenSource as D}from"../../../base/common/cancellation.js";import{Disposable as w,DisposableStore as R,MutableDisposable as E}from"../../../base/common/lifecycle.js";import{isFunction as O}from"../../../base/common/types.js";var F=(s=>(s[s.NO_ACTION=0]="NO_ACTION",s[s.CLOSE_PICKER=1]="CLOSE_PICKER",s[s.REFRESH_PICKER=2]="REFRESH_PICKER",s[s.REMOVE_ITEM=3]="REMOVE_ITEM",s))(F||{});function g(f){const P=f;return Array.isArray(P.items)}function x(f){const P=f;return!!P.picks&&P.additionalPicks instanceof Promise}class K extends w{constructor(e,I){super();this.prefix=e;this.options=I}provide(e,I,s){const l=new R;e.canAcceptInBackground=!!this.options?.canAcceptInBackground,e.matchOnLabel=e.matchOnDescription=e.matchOnDetail=e.sortByLabel=!1;let y;const C=l.add(new E),T=async()=>{const n=C.value=new R;y?.dispose(!0),e.busy=!1,y=new D(I);const t=y.token;let r=e.value.substring(this.prefix.length);this.options?.shouldSkipTrimPickFilter||(r=r.trim());const o=this._getPicks(r,n,t,s),d=(i,u)=>{let c,a;if(g(i)?(c=i.items,a=i.active):c=i,c.length===0){if(u)return!1;(r.length>0||e.hideInput)&&this.options?.noResultsPick&&(O(this.options.noResultsPick)?c=[this.options.noResultsPick(r)]:c=[this.options.noResultsPick])}return e.items=c,a&&(e.activeItems=[a]),!0},p=async i=>{let u=!1,c=!1;await Promise.all([(async()=>{typeof i.mergeDelay=="number"&&(await S(i.mergeDelay),t.isCancellationRequested)||c||(u=d(i.picks,!0))})(),(async()=>{e.busy=!0;try{const a=await i.additionalPicks;if(t.isCancellationRequested)return;let k,b;g(i.picks)?(k=i.picks.items,b=i.picks.active):k=i.picks;let m,v;if(g(a)?(m=a.items,v=a.active):m=a,m.length>0||!u){let Q;if(!b&&!v){const A=e.activeItems[0];A&&k.indexOf(A)!==-1&&(Q=A)}d({items:[...k,...m],active:b||v||Q})}}finally{t.isCancellationRequested||(e.busy=!1),c=!0}})()])};if(o!==null)if(x(o))await p(o);else if(o instanceof Promise){e.busy=!0;try{const i=await o;if(t.isCancellationRequested)return;x(i)?await p(i):d(i)}finally{t.isCancellationRequested||(e.busy=!1)}}else d(o)};l.add(e.onDidChangeValue(()=>T())),T(),l.add(e.onDidAccept(n=>{if(s?.handleAccept){n.inBackground||e.hide(),s.handleAccept?.(e.activeItems[0]);return}const[t]=e.selectedItems;typeof t?.accept=="function"&&(n.inBackground||e.hide(),t.accept(e.keyMods,n))}));const h=async(n,t)=>{if(typeof t.trigger!="function")return;const r=t.buttons?.indexOf(n)??-1;if(r>=0){const o=t.trigger(r,e.keyMods),d=typeof o=="number"?o:await o;if(I.isCancellationRequested)return;switch(d){case 0:break;case 1:e.hide();break;case 2:T();break;case 3:{const p=e.items.indexOf(t);if(p!==-1){const i=e.items.slice(),u=i.splice(p,1),c=e.activeItems.filter(k=>k!==u[0]),a=e.keepScrollPosition;e.keepScrollPosition=!0,e.items=i,c&&(e.activeItems=c),e.keepScrollPosition=a}break}}}};return l.add(e.onDidTriggerItemButton(({button:n,item:t})=>h(n,t))),l.add(e.onDidTriggerSeparatorButton(({button:n,separator:t})=>h(n,t))),l}}export{K as PickerQuickAccessProvider,F as TriggerAction};
