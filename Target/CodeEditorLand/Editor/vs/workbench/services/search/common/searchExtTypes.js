class o{constructor(e,r){this.line=e;this.character=r}isBefore(e){return!1}isBeforeOrEqual(e){return!1}isAfter(e){return!1}isAfterOrEqual(e){return!1}isEqual(e){return!1}compareTo(e){return 0}translate(e,r){return new o(0,0)}with(e){return new o(0,0)}}class n{start;end;constructor(e,r,t,i){this.start=new o(e,r),this.end=new o(t,i)}isEmpty=!1;isSingleLine=!1;contains(e){return!1}isEqual(e){return!1}intersection(e){}union(e){return new n(0,0,0,0)}with(e){return new n(0,0,0,0)}}class c{constructor(e,r,t){this.uri=e;this.ranges=r;this.previewText=t}}class u{constructor(e,r,t){this.uri=e;this.text=r;this.lineNumber=t}}var s=(t=>(t[t.None=1]="None",t[t.FilesExclude=2]="FilesExclude",t[t.SearchAndFilesExclude=3]="SearchAndFilesExclude",t))(s||{}),l=(r=>(r[r.Information=1]="Information",r[r.Warning=2]="Warning",r))(l||{});export{s as ExcludeSettingOptions,o as Position,n as Range,l as TextSearchCompleteMessageType,u as TextSearchContextNew,c as TextSearchMatchNew};
