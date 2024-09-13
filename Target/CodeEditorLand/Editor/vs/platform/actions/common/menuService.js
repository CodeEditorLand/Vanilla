var R=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var _=(a,t,e,n)=>{for(var i=n>1?void 0:n?L(t,e):t,s=a.length-1,o;s>=0;s--)(o=a[s])&&(i=(n?o(t,e,i):o(i))||i);return n&&i&&R(t,e,i),i},l=(a,t)=>(e,n)=>t(e,n,a);import{Separator as F,toAction as x}from"../../../base/common/actions.js";import{removeFastWithoutKeepingOrder as G}from"../../../base/common/arrays.js";import{RunOnceScheduler as H}from"../../../base/common/async.js";import{DebounceEmitter as B,Emitter as $}from"../../../base/common/event.js";import{DisposableStore as M}from"../../../base/common/lifecycle.js";import{localize as w}from"../../../nls.js";import{ICommandService as D}from"../../commands/common/commands.js";import{IContextKeyService as k}from"../../contextkey/common/contextkey.js";import{IKeybindingService as A}from"../../keybinding/common/keybinding.js";import{IStorageService as O,StorageScope as C,StorageTarget as T}from"../../storage/common/storage.js";import{MenuItemAction as z,MenuRegistry as E,SubmenuItemAction as j,isIMenuItem as v,isISubmenuItem as N}from"./actions.js";let b=class{constructor(t,e,n){this._commandService=t;this._keybindingService=e;this._hiddenStates=new h(n)}_hiddenStates;createMenu(t,e,n){return new y(t,this._hiddenStates,{emitEventsForSubmenuChanges:!1,eventDebounceDelay:50,...n},this._commandService,this._keybindingService,e)}getMenuActions(t,e,n){const i=new y(t,this._hiddenStates,{emitEventsForSubmenuChanges:!1,eventDebounceDelay:50,...n},this._commandService,this._keybindingService,e),s=i.getActions(n);return i.dispose(),s}getMenuContexts(t){const e=new I(t,!1);return new Set([...e.structureContextKeys,...e.preconditionContextKeys,...e.toggledContextKeys])}resetHiddenStates(t){this._hiddenStates.reset(t)}};b=_([l(0,D),l(1,A),l(2,O)],b);let h=class{constructor(t){this._storageService=t;try{const e=t.get(h._key,C.PROFILE,"{}");this._data=JSON.parse(e)}catch{this._data=Object.create(null)}this._disposables.add(t.onDidChangeValue(C.PROFILE,h._key,this._disposables)(()=>{if(!this._ignoreChangeEvent)try{const e=t.get(h._key,C.PROFILE,"{}");this._data=JSON.parse(e)}catch{}this._onDidChange.fire()}))}static _key="menu.hiddenCommands";_disposables=new M;_onDidChange=new $;onDidChange=this._onDidChange.event;_ignoreChangeEvent=!1;_data;_hiddenByDefaultCache=new Map;dispose(){this._onDidChange.dispose(),this._disposables.dispose()}_isHiddenByDefault(t,e){return this._hiddenByDefaultCache.get(`${t.id}/${e}`)??!1}setDefaultState(t,e,n){this._hiddenByDefaultCache.set(`${t.id}/${e}`,n)}isHidden(t,e){const n=this._isHiddenByDefault(t,e),i=this._data[t.id]?.includes(e)??!1;return n?!i:i}updateHidden(t,e,n){this._isHiddenByDefault(t,e)&&(n=!n);const s=this._data[t.id];if(n)s?s.indexOf(e)<0&&s.push(e):this._data[t.id]=[e];else if(s){const o=s.indexOf(e);o>=0&&G(s,o),s.length===0&&delete this._data[t.id]}this._persist()}reset(t){if(t===void 0)this._data=Object.create(null),this._persist();else{for(const{id:e}of t)this._data[e]&&delete this._data[e];this._persist()}}_persist(){try{this._ignoreChangeEvent=!0;const t=JSON.stringify(this._data);this._storageService.store(h._key,t,C.PROFILE,T.USER)}finally{this._ignoreChangeEvent=!1}}};h=_([l(0,O)],h);class I{constructor(t,e){this._id=t;this._collectContextKeysForSubmenus=e;this.refresh()}_menuGroups=[];_allMenuIds=new Set;_structureContextKeys=new Set;_preconditionContextKeys=new Set;_toggledContextKeys=new Set;get allMenuIds(){return this._allMenuIds}get structureContextKeys(){return this._structureContextKeys}get preconditionContextKeys(){return this._preconditionContextKeys}get toggledContextKeys(){return this._toggledContextKeys}refresh(){this._menuGroups.length=0,this._allMenuIds.clear(),this._structureContextKeys.clear(),this._preconditionContextKeys.clear(),this._toggledContextKeys.clear();const t=this._sort(E.getMenuItems(this._id));let e;for(const n of t){const i=n.group||"";(!e||e[0]!==i)&&(e=[i,[]],this._menuGroups.push(e)),e[1].push(n),this._collectContextKeysAndSubmenuIds(n)}this._allMenuIds.add(this._id)}_sort(t){return t}_collectContextKeysAndSubmenuIds(t){if(I._fillInKbExprKeys(t.when,this._structureContextKeys),v(t)){if(t.command.precondition&&I._fillInKbExprKeys(t.command.precondition,this._preconditionContextKeys),t.command.toggled){const e=t.command.toggled.condition||t.command.toggled;I._fillInKbExprKeys(e,this._toggledContextKeys)}}else this._collectContextKeysForSubmenus&&(E.getMenuItems(t.submenu).forEach(this._collectContextKeysAndSubmenuIds,this),this._allMenuIds.add(t.submenu))}static _fillInKbExprKeys(t,e){if(t)for(const n of t.keys())e.add(n)}}let m=class extends I{constructor(e,n,i,s,o,d){super(e,i);this._hiddenStates=n;this._commandService=s;this._keybindingService=o;this._contextKeyService=d;this.refresh()}createActionGroups(e){const n=[];for(const i of this._menuGroups){const[s,o]=i;let d;for(const r of o)if(this._contextKeyService.contextMatchesRules(r.when)){const f=v(r);f&&this._hiddenStates.setDefaultState(this._id,r.command.id,!!r.isHiddenByDefault);const S=P(this._id,f?r.command:r,this._hiddenStates);if(f){const u=J(this._commandService,this._keybindingService,r.command.id,r.when);(d??=[]).push(new z(r.command,r.alt,e,S,u,this._contextKeyService,this._commandService))}else{const u=new m(r.submenu,this._hiddenStates,this._collectContextKeysForSubmenus,this._commandService,this._keybindingService,this._contextKeyService).createActionGroups(e),c=F.join(...u.map(g=>g[1]));c.length>0&&(d??=[]).push(new j(r,S,c))}}d&&d.length>0&&n.push([s,d])}return n}_sort(e){return e.sort(m._compareMenuItems)}static _compareMenuItems(e,n){const i=e.group,s=n.group;if(i!==s){if(i){if(!s)return-1}else return 1;if(i==="navigation")return-1;if(s==="navigation")return 1;const r=i.localeCompare(s);if(r!==0)return r}const o=e.order||0,d=n.order||0;return o<d?-1:o>d?1:m._compareTitles(v(e)?e.command.title:e.title,v(n)?n.command.title:n.title)}static _compareTitles(e,n){const i=typeof e=="string"?e:e.original,s=typeof n=="string"?n:n.original;return i.localeCompare(s)}};m=_([l(3,D),l(4,A),l(5,k)],m);let y=class{_menuInfo;_disposables=new M;_onDidChange;onDidChange;constructor(t,e,n,i,s,o){this._menuInfo=new m(t,e,n.emitEventsForSubmenuChanges,i,s,o);const d=new H(()=>{this._menuInfo.refresh(),this._onDidChange.fire({menu:this,isStructuralChange:!0,isEnablementChange:!0,isToggleChange:!0})},n.eventDebounceDelay);this._disposables.add(d),this._disposables.add(E.onDidChangeMenu(u=>{for(const c of this._menuInfo.allMenuIds)if(u.has(c)){d.schedule();break}}));const r=this._disposables.add(new M),f=u=>{let c=!1,g=!1,p=!1;for(const K of u)if(c=c||K.isStructuralChange,g=g||K.isEnablementChange,p=p||K.isToggleChange,c&&g&&p)break;return{menu:this,isStructuralChange:c,isEnablementChange:g,isToggleChange:p}},S=()=>{r.add(o.onDidChangeContext(u=>{const c=u.affectsSome(this._menuInfo.structureContextKeys),g=u.affectsSome(this._menuInfo.preconditionContextKeys),p=u.affectsSome(this._menuInfo.toggledContextKeys);(c||g||p)&&this._onDidChange.fire({menu:this,isStructuralChange:c,isEnablementChange:g,isToggleChange:p})})),r.add(e.onDidChange(u=>{this._onDidChange.fire({menu:this,isStructuralChange:!0,isEnablementChange:!1,isToggleChange:!1})}))};this._onDidChange=new B({onWillAddFirstListener:S,onDidRemoveLastListener:r.clear.bind(r),delay:n.eventDebounceDelay,merge:f}),this.onDidChange=this._onDidChange.event}getActions(t){return this._menuInfo.createActionGroups(t)}dispose(){this._disposables.dispose(),this._onDidChange.dispose()}};y=_([l(3,D),l(4,A),l(5,k)],y);function P(a,t,e){const n=N(t)?t.submenu.id:t.id,i=typeof t.title=="string"?t.title:t.title.value,s=x({id:`hide/${a.id}/${n}`,label:w("hide.label","Hide '{0}'",i),run(){e.updateHidden(a,n,!0)}}),o=x({id:`toggle/${a.id}/${n}`,label:i,get checked(){return!e.isHidden(a,n)},run(){e.updateHidden(a,n,!!this.checked)}});return{hide:s,toggle:o,get isHidden(){return!o.checked}}}function J(a,t,e,n=void 0,i=!0){return x({id:`configureKeybinding/${e}`,label:w("configure keybinding","Configure Keybinding"),enabled:i,run(){const o=!!!t.lookupKeybinding(e)&&n?n.serialize():void 0;a.executeCommand("workbench.action.openGlobalKeybindings",`@command:${e}`+(o?` +when:${o}`:""))}})}export{b as MenuService,J as createConfigureKeybindingAction};
