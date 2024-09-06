import"../../base/common/buffer.js";import"../../base/common/cancellation.js";import{Codicon as o}from"../../base/common/codicons.js";import"../../base/common/color.js";import"../../base/common/dataTransfer.js";import"../../base/common/event.js";import"../../base/common/hierarchicalKind.js";import"../../base/common/htmlContent.js";import"../../base/common/lifecycle.js";import"../../base/common/themables.js";import{URI as I}from"../../base/common/uri.js";import{localize as l}from"../../nls.js";import"../../platform/extensions/common/extensions.js";import"../../platform/markers/common/markers.js";import{EditOperation as x}from"./core/editOperation.js";import"./core/position.js";import{Range as p}from"./core/range.js";import"./core/selection.js";import"./encodedTokenAttributes.js";import"./languageSelector.js";import"./model.js";import{TokenizationRegistry as g}from"./tokenizationRegistry.js";import"./tokens/contiguousMultilineTokens.js";class ze{constructor(a,e,i){this.offset=a;this.type=e;this.language=i}_tokenBrand=void 0;toString(){return"("+this.offset+", "+this.type+")"}}class He{constructor(a,e){this.tokens=a;this.endState=e}_tokenizationResultBrand=void 0}class Ne{constructor(a,e){this.tokens=a;this.endState=e}_encodedTokenizationResultBrand=void 0}var y=(e=>(e[e.Increase=0]="Increase",e[e.Decrease=1]="Decrease",e))(y||{}),f=(n=>(n[n.Method=0]="Method",n[n.Function=1]="Function",n[n.Constructor=2]="Constructor",n[n.Field=3]="Field",n[n.Variable=4]="Variable",n[n.Class=5]="Class",n[n.Struct=6]="Struct",n[n.Interface=7]="Interface",n[n.Module=8]="Module",n[n.Property=9]="Property",n[n.Event=10]="Event",n[n.Operator=11]="Operator",n[n.Unit=12]="Unit",n[n.Value=13]="Value",n[n.Constant=14]="Constant",n[n.Enum=15]="Enum",n[n.EnumMember=16]="EnumMember",n[n.Keyword=17]="Keyword",n[n.Text=18]="Text",n[n.Color=19]="Color",n[n.File=20]="File",n[n.Reference=21]="Reference",n[n.Customcolor=22]="Customcolor",n[n.Folder=23]="Folder",n[n.TypeParameter=24]="TypeParameter",n[n.User=25]="User",n[n.Issue=26]="Issue",n[n.Snippet=27]="Snippet",n))(f||{}),C;(s=>{const t=new Map;t.set(0,o.symbolMethod),t.set(1,o.symbolFunction),t.set(2,o.symbolConstructor),t.set(3,o.symbolField),t.set(4,o.symbolVariable),t.set(5,o.symbolClass),t.set(6,o.symbolStruct),t.set(7,o.symbolInterface),t.set(8,o.symbolModule),t.set(9,o.symbolProperty),t.set(10,o.symbolEvent),t.set(11,o.symbolOperator),t.set(12,o.symbolUnit),t.set(13,o.symbolValue),t.set(15,o.symbolEnum),t.set(14,o.symbolConstant),t.set(15,o.symbolEnum),t.set(16,o.symbolEnumMember),t.set(17,o.symbolKeyword),t.set(27,o.symbolSnippet),t.set(18,o.symbolText),t.set(19,o.symbolColor),t.set(20,o.symbolFile),t.set(21,o.symbolReference),t.set(22,o.symbolCustomColor),t.set(23,o.symbolFolder),t.set(24,o.symbolTypeParameter),t.set(25,o.account),t.set(26,o.issues);function a(c){let m=t.get(c);return m||(console.info("No codicon found for CompletionItemKind "+c),m=o.symbolProperty),m}s.toIcon=a;const e=new Map;e.set("method",0),e.set("function",1),e.set("constructor",2),e.set("field",3),e.set("variable",4),e.set("class",5),e.set("struct",6),e.set("interface",7),e.set("module",8),e.set("property",9),e.set("event",10),e.set("operator",11),e.set("unit",12),e.set("value",13),e.set("constant",14),e.set("enum",15),e.set("enum-member",16),e.set("enumMember",16),e.set("keyword",17),e.set("snippet",27),e.set("text",18),e.set("color",19),e.set("file",20),e.set("reference",21),e.set("customcolor",22),e.set("folder",23),e.set("type-parameter",24),e.set("typeParameter",24),e.set("account",25),e.set("issue",26);function i(c,m){let u=e.get(c);return typeof u>"u"&&!m&&(u=9),u}s.fromString=i})(C||={});var b=(a=>(a[a.Deprecated=1]="Deprecated",a))(b||{}),k=(i=>(i[i.None=0]="None",i[i.KeepWhitespace=1]="KeepWhitespace",i[i.InsertAsSnippet=4]="InsertAsSnippet",i))(k||{}),T=(i=>(i[i.Word=0]="Word",i[i.Line=1]="Line",i[i.Suggest=2]="Suggest",i))(T||{}),v=(i=>(i[i.Invoke=0]="Invoke",i[i.TriggerCharacter=1]="TriggerCharacter",i[i.TriggerForIncompleteCompletions=2]="TriggerForIncompleteCompletions",i))(v||{}),R=(e=>(e[e.Automatic=0]="Automatic",e[e.Explicit=1]="Explicit",e))(R||{});class Ae{constructor(a,e,i,s){this.range=a;this.text=e;this.completionKind=i;this.isSnippetText=s}equals(a){return p.lift(this.range).equalsRange(a.range)&&this.text===a.text&&this.completionKind===a.completionKind&&this.isSnippetText===a.isSnippetText}}var S=(e=>(e[e.Invoke=1]="Invoke",e[e.Auto=2]="Auto",e))(S||{}),P=(e=>(e[e.Automatic=0]="Automatic",e[e.PasteAs=1]="PasteAs",e))(P||{}),E=(i=>(i[i.Invoke=1]="Invoke",i[i.TriggerCharacter=2]="TriggerCharacter",i[i.ContentChange=3]="ContentChange",i))(E||{}),h=(i=>(i[i.Text=0]="Text",i[i.Read=1]="Read",i[i.Write=2]="Write",i))(h||{});function Ve(t){return t&&I.isUri(t.uri)&&p.isIRange(t.range)&&(p.isIRange(t.originSelectionRange)||p.isIRange(t.targetSelectionRange))}var M=(r=>(r[r.File=0]="File",r[r.Module=1]="Module",r[r.Namespace=2]="Namespace",r[r.Package=3]="Package",r[r.Class=4]="Class",r[r.Method=5]="Method",r[r.Property=6]="Property",r[r.Field=7]="Field",r[r.Constructor=8]="Constructor",r[r.Enum=9]="Enum",r[r.Interface=10]="Interface",r[r.Function=11]="Function",r[r.Variable=12]="Variable",r[r.Constant=13]="Constant",r[r.String=14]="String",r[r.Number=15]="Number",r[r.Boolean=16]="Boolean",r[r.Array=17]="Array",r[r.Object=18]="Object",r[r.Key=19]="Key",r[r.Null=20]="Null",r[r.EnumMember=21]="EnumMember",r[r.Struct=22]="Struct",r[r.Event=23]="Event",r[r.Operator=24]="Operator",r[r.TypeParameter=25]="TypeParameter",r))(M||{});const D={17:l("Array","array"),16:l("Boolean","boolean"),4:l("Class","class"),13:l("Constant","constant"),8:l("Constructor","constructor"),9:l("Enum","enumeration"),21:l("EnumMember","enumeration member"),23:l("Event","event"),7:l("Field","field"),0:l("File","file"),11:l("Function","function"),10:l("Interface","interface"),19:l("Key","key"),5:l("Method","method"),1:l("Module","module"),2:l("Namespace","namespace"),20:l("Null","null"),15:l("Number","number"),18:l("Object","object"),24:l("Operator","operator"),3:l("Package","package"),6:l("Property","property"),14:l("String","string"),22:l("Struct","struct"),25:l("TypeParameter","type parameter"),12:l("Variable","variable")};function we(t,a){return l("symbolAriaLabel","{0} ({1})",t,D[a])}var L=(a=>(a[a.Deprecated=1]="Deprecated",a))(L||{}),F;(e=>{const t=new Map;t.set(0,o.symbolFile),t.set(1,o.symbolModule),t.set(2,o.symbolNamespace),t.set(3,o.symbolPackage),t.set(4,o.symbolClass),t.set(5,o.symbolMethod),t.set(6,o.symbolProperty),t.set(7,o.symbolField),t.set(8,o.symbolConstructor),t.set(9,o.symbolEnum),t.set(10,o.symbolInterface),t.set(11,o.symbolFunction),t.set(12,o.symbolVariable),t.set(13,o.symbolConstant),t.set(14,o.symbolString),t.set(15,o.symbolNumber),t.set(16,o.symbolBoolean),t.set(17,o.symbolArray),t.set(18,o.symbolObject),t.set(19,o.symbolKey),t.set(20,o.symbolNull),t.set(21,o.symbolEnumMember),t.set(22,o.symbolStruct),t.set(23,o.symbolEvent),t.set(24,o.symbolOperator),t.set(25,o.symbolTypeParameter);function a(i){let s=t.get(i);return s||(console.info("No codicon found for SymbolKind "+i),s=o.symbolProperty),s}e.toIcon=a})(F||={});class Oe{static asEditOperation(a){return x.replace(p.lift(a.range),a.text)}}class d{constructor(a){this.value=a}static Comment=new d("comment");static Imports=new d("imports");static Region=new d("region");static fromValue(a){switch(a){case"comment":return d.Comment;case"imports":return d.Imports;case"region":return d.Region}return new d(a)}}var z=(a=>(a[a.AIGenerated=1]="AIGenerated",a))(z||{}),H=(e=>(e[e.Invoke=0]="Invoke",e[e.Automatic=1]="Automatic",e))(H||{}),N;(a=>{function t(e){return!e||typeof e!="object"?!1:typeof e.id=="string"&&typeof e.title=="string"}a.is=t})(N||={});var A=(e=>(e[e.Collapsed=0]="Collapsed",e[e.Expanded=1]="Expanded",e))(A||{}),V=(e=>(e[e.Unresolved=0]="Unresolved",e[e.Resolved=1]="Resolved",e))(V||{}),w=(e=>(e[e.Current=0]="Current",e[e.Outdated=1]="Outdated",e))(w||{}),O=(e=>(e[e.Editing=0]="Editing",e[e.Preview=1]="Preview",e))(O||{}),U=(e=>(e[e.Published=0]="Published",e[e.Draft=1]="Draft",e))(U||{}),B=(e=>(e[e.Type=1]="Type",e[e.Parameter=2]="Parameter",e))(B||{});class Ue{constructor(a){this.createSupport=a}_tokenizationSupport=null;dispose(){this._tokenizationSupport&&this._tokenizationSupport.then(a=>{a&&a.dispose()})}get tokenizationSupport(){return this._tokenizationSupport||(this._tokenizationSupport=this.createSupport()),this._tokenizationSupport}}const Be=new g,We=new g;var W=(s=>(s[s.None=0]="None",s[s.Option=1]="Option",s[s.Default=2]="Default",s[s.Preferred=3]="Preferred",s))(W||{}),j=(e=>(e[e.Invoke=0]="Invoke",e[e.Automatic=1]="Automatic",e))(j||{});export{S as CodeActionTriggerType,N as Command,O as CommentMode,U as CommentState,w as CommentThreadApplicability,A as CommentThreadCollapsibleState,V as CommentThreadState,k as CompletionItemInsertTextRule,f as CompletionItemKind,C as CompletionItemKinds,b as CompletionItemTag,v as CompletionTriggerKind,h as DocumentHighlightKind,P as DocumentPasteTriggerKind,Ne as EncodedTokenizationResult,W as ExternalUriOpenerPriority,d as FoldingRangeKind,y as HoverVerbosityAction,B as InlayHintKind,R as InlineCompletionTriggerKind,j as InlineEditTriggerKind,Ue as LazyTokenizationSupport,z as NewSymbolNameTag,H as NewSymbolNameTriggerKind,T as PartialAcceptTriggerKind,Ae as SelectedSuggestionInfo,E as SignatureHelpTriggerKind,M as SymbolKind,F as SymbolKinds,L as SymbolTag,Oe as TextEdit,ze as Token,Be as TokenizationRegistry,He as TokenizationResult,We as TreeSitterTokenizationRegistry,we as getAriaLabelForSymbol,Ve as isLocationLink,D as symbolKindNames};
