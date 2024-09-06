import{ContextKeyExprType as h,expressionsAreEqualWithConstantSubstitution as b,implies as v}from"../../contextkey/common/contextkey.js";import"./resolvedKeybindingItem.js";var K=(n=>(n[n.NoMatchingKb=0]="NoMatchingKb",n[n.MoreChordsNeeded=1]="MoreChordsNeeded",n[n.KbFound=2]="KbFound",n))(K||{});const f={kind:0},R={kind:1};function I(d,t,e){return{kind:2,commandId:d,commandArgs:t,isBubble:e}}class g{_log;_defaultKeybindings;_keybindings;_defaultBoundCommands;_map;_lookupMap;constructor(t,e,n){this._log=n,this._defaultKeybindings=t,this._defaultBoundCommands=new Map;for(const i of t){const s=i.command;s&&s.charAt(0)!=="-"&&this._defaultBoundCommands.set(s,!0)}this._map=new Map,this._lookupMap=new Map,this._keybindings=g.handleRemovals([].concat(t).concat(e));for(let i=0,s=this._keybindings.length;i<s;i++){const o=this._keybindings[i];if(o.chords.length===0)continue;const r=o.when?.substituteConstants();r&&r.type===h.False||this._addKeyPress(o.chords[0],o)}}static _isTargetedForRemoval(t,e,n){if(e){for(let i=0;i<e.length;i++)if(e[i]!==t.chords[i])return!1}return!(n&&n.type!==h.True&&(!t.when||!b(n,t.when)))}static handleRemovals(t){const e=new Map;for(let i=0,s=t.length;i<s;i++){const o=t[i];if(o.command&&o.command.charAt(0)==="-"){const r=o.command.substring(1);e.has(r)?e.get(r).push(o):e.set(r,[o])}}if(e.size===0)return t;const n=[];for(let i=0,s=t.length;i<s;i++){const o=t[i];if(!o.command||o.command.length===0){n.push(o);continue}if(o.command.charAt(0)==="-")continue;const r=e.get(o.command);if(!r||!o.isDefault){n.push(o);continue}let l=!1;for(const a of r){const u=a.when;if(this._isTargetedForRemoval(o,a.chords,u)){l=!0;break}}if(!l){n.push(o);continue}}return n}_addKeyPress(t,e){const n=this._map.get(t);if(typeof n>"u"){this._map.set(t,[e]),this._addToLookupMap(e);return}for(let i=n.length-1;i>=0;i--){const s=n[i];if(s.command===e.command)continue;let o=!0;for(let r=1;r<s.chords.length&&r<e.chords.length;r++)if(s.chords[r]!==e.chords[r]){o=!1;break}o&&g.whenIsEntirelyIncluded(s.when,e.when)&&this._removeFromLookupMap(s)}n.push(e),this._addToLookupMap(e)}_addToLookupMap(t){if(!t.command)return;let e=this._lookupMap.get(t.command);typeof e>"u"?(e=[t],this._lookupMap.set(t.command,e)):e.push(t)}_removeFromLookupMap(t){if(!t.command)return;const e=this._lookupMap.get(t.command);if(!(typeof e>"u")){for(let n=0,i=e.length;n<i;n++)if(e[n]===t){e.splice(n,1);return}}}static whenIsEntirelyIncluded(t,e){return!e||e.type===h.True?!0:!t||t.type===h.True?!1:v(t,e)}getDefaultBoundCommands(){return this._defaultBoundCommands}getDefaultKeybindings(){return this._defaultKeybindings}getKeybindings(){return this._keybindings}lookupKeybindings(t){const e=this._lookupMap.get(t);if(typeof e>"u"||e.length===0)return[];const n=[];let i=0;for(let s=e.length-1;s>=0;s--)n[i++]=e[s];return n}lookupPrimaryKeybinding(t,e){const n=this._lookupMap.get(t);if(typeof n>"u"||n.length===0)return null;if(n.length===1)return n[0];for(let i=n.length-1;i>=0;i--){const s=n[i];if(e.contextMatchesRules(s.when))return s}return n[n.length-1]}resolve(t,e,n){const i=[...e,n];this._log(`| Resolving ${i}`);const s=this._map.get(i[0]);if(s===void 0)return this._log("\\ No keybinding entries."),f;let o=null;if(i.length<2)o=s;else{o=[];for(let l=0,a=s.length;l<a;l++){const u=s[l];if(i.length>u.chords.length)continue;let m=!0;for(let c=1;c<i.length;c++)if(u.chords[c]!==i[c]){m=!1;break}m&&o.push(u)}}const r=this._findCommand(t,o);return r?i.length<r.chords.length?(this._log(`\\ From ${o.length} keybinding entries, awaiting ${r.chords.length-i.length} more chord(s), when: ${p(r.when)}, source: ${y(r)}.`),R):(this._log(`\\ From ${o.length} keybinding entries, matched ${r.command}, when: ${p(r.when)}, source: ${y(r)}.`),I(r.command,r.commandArgs,r.bubble)):(this._log(`\\ From ${o.length} keybinding entries, no when clauses matched the context.`),f)}_findCommand(t,e){for(let n=e.length-1;n>=0;n--){const i=e[n];if(g._contextMatchesRules(t,i.when))return i}return null}static _contextMatchesRules(t,e){return e?e.evaluate(t):!0}}function p(d){return d?`${d.serialize()}`:"no when condition"}function y(d){return d.extensionId?d.isBuiltinExtension?`built-in extension ${d.extensionId}`:`user extension ${d.extensionId}`:d.isDefault?"built-in":"user"}export{g as KeybindingResolver,f as NoMatchingKb,K as ResultKind};
