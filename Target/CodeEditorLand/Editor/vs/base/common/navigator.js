class s{constructor(t,e=0,n=t.length,i=e-1){this.items=t;this.start=e;this.end=n;this.index=i}current(){return this.index===this.start-1||this.index===this.end?null:this.items[this.index]}next(){return this.index=Math.min(this.index+1,this.end),this.current()}previous(){return this.index=Math.max(this.index-1,this.start-1),this.current()}first(){return this.index=this.start,this.current()}last(){return this.index=this.end-1,this.current()}}export{s as ArrayNavigator};
