var n=(t=>(t[t.MaxRecorderDataSize=10485760]="MaxRecorderDataSize",t))(n||{});class i{_entries;_totalDataLength=0;constructor(t,a){this._entries=[{cols:t,rows:a,data:[]}]}handleResize(t,a){if(this._entries.length>0&&this._entries[this._entries.length-1].data.length===0&&this._entries.pop(),this._entries.length>0){const e=this._entries[this._entries.length-1];if(e.cols===t&&e.rows===a)return;if(e.cols===0&&e.rows===0){e.cols=t,e.rows=a;return}}this._entries.push({cols:t,rows:a,data:[]})}handleData(t){for(this._entries[this._entries.length-1].data.push(t),this._totalDataLength+=t.length;this._totalDataLength>10485760;){const e=this._entries[0],s=this._totalDataLength-10485760;s>=e.data[0].length?(this._totalDataLength-=e.data[0].length,e.data.shift(),e.data.length===0&&this._entries.shift()):(e.data[0]=e.data[0].substr(s),this._totalDataLength-=s)}}generateReplayEventSync(){return this._entries.forEach(t=>{t.data.length>0&&(t.data=[t.data.join("")])}),{events:this._entries.map(t=>({cols:t.cols,rows:t.rows,data:t.data[0]??""})),commands:{isWindowsPty:!1,commands:[],promptInputModel:void 0}}}async generateReplayEvent(){return this.generateReplayEventSync()}}export{i as TerminalRecorder};
