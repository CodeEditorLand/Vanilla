class p{constructor(e,n,o){this.changes=e;this.moves=n;this.hitTimeout=o}}class i{lineRangeMapping;changes;constructor(e,n){this.lineRangeMapping=e,this.changes=n}flip(){return new i(this.lineRangeMapping.flip(),this.changes.map(e=>e.flip()))}}export{p as LinesDiff,i as MovedText};
