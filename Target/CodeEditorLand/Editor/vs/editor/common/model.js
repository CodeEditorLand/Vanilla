import{equals as a}from"../../base/common/objects.js";var l=(n=>(n[n.Left=1]="Left",n[n.Center=2]="Center",n[n.Right=4]="Right",n[n.Full=7]="Full",n))(l||{}),s=(o=>(o[o.Left=1]="Left",o[o.Center=2]="Center",o[o.Right=3]="Right",o))(s||{}),d=(t=>(t[t.Inline=1]="Inline",t[t.Gutter=2]="Gutter",t))(d||{}),u=(t=>(t[t.Normal=1]="Normal",t[t.Underlined=2]="Underlined",t))(u||{}),g=(n=>(n[n.Both=0]="Both",n[n.Right=1]="Right",n[n.Left=2]="Left",n[n.None=3]="None",n))(g||{}),p=(o=>(o[o.TextDefined=0]="TextDefined",o[o.LF=1]="LF",o[o.CRLF=2]="CRLF",o))(p||{}),c=(t=>(t[t.LF=1]="LF",t[t.CRLF=2]="CRLF",t))(c||{}),m=(t=>(t[t.LF=0]="LF",t[t.CRLF=1]="CRLF",t))(m||{});class S{_textModelResolvedOptionsBrand=void 0;tabSize;indentSize;_indentSizeIsTabSize;insertSpaces;defaultEOL;trimAutoWhitespace;bracketPairColorizationOptions;get originalIndentSize(){return this._indentSizeIsTabSize?"tabSize":this.indentSize}constructor(e){this.tabSize=Math.max(1,e.tabSize|0),e.indentSize==="tabSize"?(this.indentSize=this.tabSize,this._indentSizeIsTabSize=!0):(this.indentSize=Math.max(1,e.indentSize|0),this._indentSizeIsTabSize=!1),this.insertSpaces=!!e.insertSpaces,this.defaultEOL=e.defaultEOL|0,this.trimAutoWhitespace=!!e.trimAutoWhitespace,this.bracketPairColorizationOptions=e.bracketPairColorizationOptions}equals(e){return this.tabSize===e.tabSize&&this._indentSizeIsTabSize===e._indentSizeIsTabSize&&this.indentSize===e.indentSize&&this.insertSpaces===e.insertSpaces&&this.defaultEOL===e.defaultEOL&&this.trimAutoWhitespace===e.trimAutoWhitespace&&a(this.bracketPairColorizationOptions,e.bracketPairColorizationOptions)}createChangeEvent(e){return{tabSize:this.tabSize!==e.tabSize,indentSize:this.indentSize!==e.indentSize,insertSpaces:this.insertSpaces!==e.insertSpaces,trimAutoWhitespace:this.trimAutoWhitespace!==e.trimAutoWhitespace}}}class x{_findMatchBrand=void 0;range;matches;constructor(e,t){this.range=e,this.matches=t}}var b=(n=>(n[n.AlwaysGrowsWhenTypingAtEdges=0]="AlwaysGrowsWhenTypingAtEdges",n[n.NeverGrowsWhenTypingAtEdges=1]="NeverGrowsWhenTypingAtEdges",n[n.GrowsOnlyWhenTypingBefore=2]="GrowsOnlyWhenTypingBefore",n[n.GrowsOnlyWhenTypingAfter=3]="GrowsOnlyWhenTypingAfter",n))(b||{});function M(r){return r&&typeof r.read=="function"}var h=(i=>(i[i.Left=0]="Left",i[i.Right=1]="Right",i[i.None=2]="None",i[i.LeftOfInjectedText=3]="LeftOfInjectedText",i[i.RightOfInjectedText=4]="RightOfInjectedText",i))(h||{}),I=(e=>(e[e.FIRST_LINE_DETECTION_LENGTH_LIMIT=1e3]="FIRST_LINE_DETECTION_LENGTH_LIMIT",e))(I||{});class O{constructor(e,t,o,n,i,f){this.identifier=e;this.range=t;this.text=o;this.forceMoveMarkers=n;this.isAutoWhitespaceEdit=i;this._isTracked=f}}class L{regex;wordSeparators;simpleSearch;constructor(e,t,o){this.regex=e,this.wordSeparators=t,this.simpleSearch=o}}class y{constructor(e,t,o){this.reverseEdits=e;this.changes=t;this.trimAutoWhitespaceLineNumbers=o}}function E(r){return!r.isTooLargeForSyncing()&&!r.isForSimpleWidget}export{y as ApplyEditsResult,c as DefaultEndOfLine,p as EndOfLinePreference,m as EndOfLineSequence,x as FindMatch,s as GlyphMarginLane,g as InjectedTextCursorStops,d as MinimapPosition,u as MinimapSectionHeaderStyle,I as ModelConstants,l as OverviewRulerLane,h as PositionAffinity,L as SearchData,S as TextModelResolvedOptions,b as TrackedRangeStickiness,O as ValidAnnotatedEditOperation,M as isITextSnapshot,E as shouldSynchronizeModel};
