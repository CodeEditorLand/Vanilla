import{GlyphMarginLane as a}from"../model.js";const r=a.Right;class p{lanes;persist=0;_requiredLanes=1;constructor(i){this.lanes=new Uint8Array(Math.ceil((i+1)*r/8))}reset(i){const e=Math.ceil((i+1)*r/8);this.lanes.length<e?this.lanes=new Uint8Array(e):this.lanes.fill(0),this._requiredLanes=1}get requiredLanes(){return this._requiredLanes}push(i,e,n){n&&(this.persist|=1<<i-1);for(let t=e.startLineNumber;t<=e.endLineNumber;t++){const s=r*t+(i-1);this.lanes[s>>>3]|=1<<s%8,this._requiredLanes=Math.max(this._requiredLanes,this.countAtLine(t))}}getLanesAtLine(i){const e=[];let n=r*i;for(let t=0;t<r;t++)(this.persist&1<<t||this.lanes[n>>>3]&1<<n%8)&&e.push(t+1),n++;return e.length?e:[a.Center]}countAtLine(i){let e=r*i,n=0;for(let t=0;t<r;t++)(this.persist&1<<t||this.lanes[e>>>3]&1<<e%8)&&n++,e++;return n}}export{p as GlyphMarginLanesModel};
