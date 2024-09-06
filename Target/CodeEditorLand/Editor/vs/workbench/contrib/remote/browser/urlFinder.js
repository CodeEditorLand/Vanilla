import{Emitter as a}from"../../../../../vs/base/common/event.js";import{Disposable as p}from"../../../../../vs/base/common/lifecycle.js";import{removeAnsiEscapeCodes as c}from"../../../../../vs/base/common/strings.js";import"../../../../../vs/workbench/contrib/debug/common/debug.js";import"../../../../../vs/workbench/contrib/terminal/browser/terminal.js";class n extends p{static localUrlRegex=/\b\w{0,20}(?::\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0|:\d{2,5})[\w\-\.\~:\/\?\#[\]\@!\$&\(\)\*\+\,\;\=]*/gim;static extractPortRegex=/(localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{1,5})/;static localPythonServerRegex=/HTTP\son\s(127\.0\.0\.1|0\.0\.0\.0)\sport\s(\d+)/;static excludeTerminals=["Dev Containers"];_onDidMatchLocalUrl=new a;onDidMatchLocalUrl=this._onDidMatchLocalUrl.event;listeners=new Map;constructor(t,s){super(),t.instances.forEach(e=>{this.registerTerminalInstance(e)}),this._register(t.onDidCreateInstance(e=>{this.registerTerminalInstance(e)})),this._register(t.onDidDisposeInstance(e=>{this.listeners.get(e)?.dispose(),this.listeners.delete(e)})),this._register(s.onDidNewSession(e=>{(!e.parentSession||e.parentSession&&e.hasSeparateRepl())&&this.listeners.set(e.getId(),e.onDidChangeReplElements(()=>{this.processNewReplElements(e)}))})),this._register(s.onDidEndSession(({session:e})=>{this.listeners.has(e.getId())&&(this.listeners.get(e.getId())?.dispose(),this.listeners.delete(e.getId()))}))}registerTerminalInstance(t){n.excludeTerminals.includes(t.title)||this.listeners.set(t,t.onData(s=>{this.processData(s)}))}replPositions=new Map;processNewReplElements(t){const s=this.replPositions.get(t.getId()),e=t.getReplElements();if(this.replPositions.set(t.getId(),{position:e.length-1,tail:e[e.length-1]}),!s&&e.length>0)e.forEach(i=>this.processData(i.toString()));else if(s&&e.length-1!==s.position)for(let i=e.length-1;i>=0;i--){const r=e[i];if(r===s.tail)break;this.processData(r.toString())}}dispose(){super.dispose();const t=this.listeners.values();for(const s of t)s.dispose()}processData(t){t=c(t);const s=t.match(n.localUrlRegex)||[];if(s&&s.length>0)s.forEach(e=>{let i;try{i=new URL(e)}catch{}if(i){const r=e.match(n.extractPortRegex),o=parseFloat(i.port?i.port:r?r[2]:"NaN");if(!isNaN(o)&&Number.isInteger(o)&&o>0&&o<=65535){let l=i.hostname;if(l!=="0.0.0.0"&&l!=="127.0.0.1"&&(l="localhost"),o!==9229&&t.startsWith("Debugger listening on"))return;this._onDidMatchLocalUrl.fire({port:o,host:l})}}});else{const e=t.match(n.localPythonServerRegex);e&&e.length===3&&this._onDidMatchLocalUrl.fire({host:e[1],port:Number(e[2])})}}}export{n as UrlFinder};