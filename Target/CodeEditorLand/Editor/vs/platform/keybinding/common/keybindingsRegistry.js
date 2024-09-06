import{decodeKeybinding as m}from"../../../base/common/keybindings.js";import{combinedDisposable as l,DisposableStore as u,toDisposable as b}from"../../../base/common/lifecycle.js";import{LinkedList as c}from"../../../base/common/linkedList.js";import{OperatingSystem as y,OS as o}from"../../../base/common/platform.js";import{CommandsRegistry as K}from"../../commands/common/commands.js";import"../../contextkey/common/contextkey.js";import{Registry as p}from"../../registry/common/platform.js";var I=(i=>(i[i.EditorCore=0]="EditorCore",i[i.EditorContrib=100]="EditorContrib",i[i.WorkbenchContrib=200]="WorkbenchContrib",i[i.BuiltinExtension=300]="BuiltinExtension",i[i.ExternalExtension=400]="ExternalExtension",i))(I||{});class g{_coreKeybindings;_extensionKeybindings;_cachedMergedKeybindings;constructor(){this._coreKeybindings=new c,this._extensionKeybindings=[],this._cachedMergedKeybindings=null}static bindToCurrentPlatform(n){if(o===y.Windows){if(n&&n.win)return n.win}else if(o===y.Macintosh){if(n&&n.mac)return n.mac}else if(n&&n.linux)return n.linux;return n}registerKeybindingRule(n){const t=g.bindToCurrentPlatform(n),r=new u;if(t&&t.primary){const e=m(t.primary,o);e&&r.add(this._registerDefaultKeybinding(e,n.id,n.args,n.weight,0,n.when))}if(t&&Array.isArray(t.secondary))for(let e=0,i=t.secondary.length;e<i;e++){const a=t.secondary[e],d=m(a,o);d&&r.add(this._registerDefaultKeybinding(d,n.id,n.args,n.weight,-e-1,n.when))}return r}setExtensionKeybindings(n){const t=[];let r=0;for(const e of n)e.keybinding&&(t[r++]={keybinding:e.keybinding,command:e.id,commandArgs:e.args,when:e.when,weight1:e.weight,weight2:0,extensionId:e.extensionId||null,isBuiltinExtension:e.isBuiltinExtension||!1});this._extensionKeybindings=t,this._cachedMergedKeybindings=null}registerCommandAndKeybindingRule(n){return l(this.registerKeybindingRule(n),K.registerCommand(n))}_registerDefaultKeybinding(n,t,r,e,i,a){const d=this._coreKeybindings.push({keybinding:n,command:t,commandArgs:r,when:a,weight1:e,weight2:i,extensionId:null,isBuiltinExtension:!1});return this._cachedMergedKeybindings=null,b(()=>{d(),this._cachedMergedKeybindings=null})}getDefaultKeybindings(){return this._cachedMergedKeybindings||(this._cachedMergedKeybindings=Array.from(this._coreKeybindings).concat(this._extensionKeybindings),this._cachedMergedKeybindings.sort(h)),this._cachedMergedKeybindings.slice(0)}}const f=new g,x={EditorModes:"platform.keybindingsRegistry"};p.add(x.EditorModes,f);function h(s,n){if(s.weight1!==n.weight1)return s.weight1-n.weight1;if(s.command&&n.command){if(s.command<n.command)return-1;if(s.command>n.command)return 1}return s.weight2-n.weight2}export{x as Extensions,I as KeybindingWeight,f as KeybindingsRegistry};
