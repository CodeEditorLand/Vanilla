import"./core/position.js";var u=(e=>(e[e.Disabled=0]="Disabled",e[e.EnabledForActive=1]="EnabledForActive",e[e.Enabled=2]="Enabled",e))(u||{});class m{constructor(n,r,e,o,t,b){this.visibleColumn=n;this.column=r;this.className=e;this.horizontalLine=o;this.forWrappedLinesAfterColumn=t;this.forWrappedLinesBeforeOrAtColumn=b;if(n!==-1==(r!==-1))throw new Error}}class c{constructor(n,r){this.top=n;this.endColumn=r}}export{u as HorizontalGuidesState,m as IndentGuide,c as IndentGuideHorizontalLine};
