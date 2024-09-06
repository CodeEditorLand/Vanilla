import{KeybindingParser as d}from"../../../../../vs/base/common/keybindingParser.js";import"../../../../../vs/base/common/keybindings.js";import{ContextKeyExpr as g}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/keybinding/common/resolvedKeybindingItem.js";class b{static writeKeybindingItem(e,n){if(!n.resolvedKeybinding)return;const s=JSON.stringify(n.resolvedKeybinding.getUserSettingsLabel());e.write(`{ "key": ${o(s+",",25)} "command": `);const r=n.when?JSON.stringify(n.when.serialize()):"",t=JSON.stringify(n.command);r.length>0?(e.write(`${t},`),e.writeLine(),e.write(`                                     "when": ${r}`)):e.write(`${t}`),n.commandArgs&&(e.write(","),e.writeLine(),e.write(`                                     "args": ${JSON.stringify(n.commandArgs)}`)),e.write(" }")}static readUserKeybindingItem(e){const n="key"in e&&typeof e.key=="string"?d.parseKeybinding(e.key):null,s="when"in e&&typeof e.when=="string"?g.deserialize(e.when):void 0,r="command"in e&&typeof e.command=="string"?e.command:null,t="args"in e&&typeof e.args<"u"?e.args:void 0;return{keybinding:n,command:r,commandArgs:t,when:s,_sourceKey:"key"in e&&typeof e.key=="string"?e.key:void 0}}}function o(i,e){return i.length<e?i+new Array(e-i.length).join(" "):i}class h{_lines=[];_currentLine="";write(e){this._currentLine+=e}writeLine(e=""){this._lines.push(this._currentLine+e),this._currentLine=""}toString(){return this.writeLine(),this._lines.join(`
`)}}export{b as KeybindingIO,h as OutputBuilder};