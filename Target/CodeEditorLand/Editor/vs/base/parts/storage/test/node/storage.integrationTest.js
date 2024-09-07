import*as I from"fs";import{deepStrictEqual as z,ok as c,strictEqual as o}from"assert";import{tmpdir as P}from"os";import{timeout as S}from"../../../../common/async.js";import{Emitter as N}from"../../../../common/event.js";import{join as u}from"../../../../common/path.js";import{isWindows as O}from"../../../../common/platform.js";import{URI as E}from"../../../../common/uri.js";import{generateUuid as D}from"../../../../common/uuid.js";import{Promises as h}from"../../../../node/pfs.js";import{isStorageItemsChangeEvent as x,Storage as b}from"../../common/storage.js";import{SQLiteStorageDatabase as p}from"../../node/storage.js";import{runWithFakedTimers as v}from"../../../../test/common/timeTravelScheduler.js";import{flakySuite as j,getRandomTestPath as B}from"../../../../test/node/testUtils.js";j("Storage Library",function(){let d;setup(function(){return d=B(P(),"vsctests","storagelibrary"),I.promises.mkdir(d,{recursive:!0})}),teardown(function(){return h.rm(d)}),test("objects",()=>v({},async function(){const e=new b(new p(u(d,"storage.db")));await e.init(),c(!e.getObject("foo"));const n=E.file("path/to/folder");e.set("foo",{bar:n}),z(e.getObject("foo"),{bar:n}),await e.close()})),test("basics",()=>v({},async function(){const e=new b(new p(u(d,"storage.db")));await e.init(),o(e.get("foo","bar"),"bar"),o(e.getNumber("foo",55),55),o(e.getBoolean("foo",!0),!0),z(e.getObject("foo",{bar:"baz"}),{bar:"baz"});let n=new Set;e.onDidChangeStorage(y=>{n.add(y.key)}),await e.whenFlushed();const m=e.set("bar","foo"),l=e.set("barNumber",55),s=e.set("barBoolean",!0),t=e.set("barObject",{bar:"baz"});let r=!1;e.whenFlushed().then(()=>r=!0),o(e.get("bar"),"foo"),o(e.getNumber("barNumber"),55),o(e.getBoolean("barBoolean"),!0),z(e.getObject("barObject"),{bar:"baz"}),o(n.size,4),c(n.has("bar")),c(n.has("barNumber")),c(n.has("barBoolean")),c(n.has("barObject"));let a=!1;await Promise.all([m,l,s,t]).then(()=>a=!0),o(a,!0),o(r,!0),n=new Set,e.set("bar","foo"),e.set("barNumber",55),e.set("barBoolean",!0),e.set("barObject",{bar:"baz"}),o(n.size,0);const i=e.delete("bar"),g=e.delete("barNumber"),f=e.delete("barBoolean"),k=e.delete("barObject");c(!e.get("bar")),c(!e.getNumber("barNumber")),c(!e.getBoolean("barBoolean")),c(!e.getObject("barObject")),o(n.size,4),c(n.has("bar")),c(n.has("barNumber")),c(n.has("barBoolean")),c(n.has("barObject")),n=new Set,e.delete("bar"),e.delete("barNumber"),e.delete("barBoolean"),e.delete("barObject"),o(n.size,0);let w=!1;await Promise.all([i,g,f,k]).then(()=>w=!0),o(w,!0),await e.close(),await e.close()})),test("external changes",()=>v({},async function(){class e extends p{_onDidChangeItemsExternal=new N;get onDidChangeItemsExternal(){return this._onDidChangeItemsExternal.event}fireDidChangeItemsExternal(a){this._onDidChangeItemsExternal.fire(a)}}const n=new e(u(d,"storage.db")),m=new b(n),l=new Set;m.onDidChangeStorage(r=>{l.add(r.key)}),await m.init(),await m.set("foo","bar"),c(l.has("foo")),l.clear();const s=new Map;s.set("foo","bar"),n.fireDidChangeItemsExternal({changed:s}),o(l.size,0),s.set("foo","bar1"),n.fireDidChangeItemsExternal({changed:s}),c(l.has("foo")),o(m.get("foo"),"bar1"),l.clear();const t=new Set(["foo"]);n.fireDidChangeItemsExternal({deleted:t}),c(l.has("foo")),o(m.get("foo",void 0),void 0),l.clear(),n.fireDidChangeItemsExternal({deleted:t}),o(l.size,0),o(x({changed:s}),!0),o(x({deleted:t}),!0),o(x({changed:s,deleted:t}),!0),o(x(void 0),!1),o(x({changed:"yes",deleted:!1}),!1),await m.close()})),test("close flushes data",async()=>{let e=new b(new p(u(d,"storage.db")));await e.init();const n=e.set("foo","bar"),m=e.set("bar","foo");let l=!1;e.whenFlushed().then(()=>l=!0),o(e.get("foo"),"bar"),o(e.get("bar"),"foo");let s=!1;Promise.all([n,m]).then(()=>s=!0),await e.close(),o(s,!0),o(l,!0),e=new b(new p(u(d,"storage.db"))),await e.init(),o(e.get("foo"),"bar"),o(e.get("bar"),"foo"),await e.close(),e=new b(new p(u(d,"storage.db"))),await e.init();const t=e.delete("foo"),r=e.delete("bar");c(!e.get("foo")),c(!e.get("bar"));let a=!1;Promise.all([t,r]).then(()=>a=!0),await e.close(),o(a,!0),e=new b(new p(u(d,"storage.db"))),await e.init(),c(!e.get("foo")),c(!e.get("bar")),await e.close()}),test("explicit flush",async()=>{const e=new b(new p(u(d,"storage.db")));await e.init(),e.set("foo","bar"),e.set("bar","foo");let n=!1;e.whenFlushed().then(()=>n=!0),o(n,!1),await e.flush(0),o(n,!0),await e.close()}),test("conflicting updates",()=>v({},async function(){const e=new b(new p(u(d,"storage.db")));await e.init();let n=new Set;e.onDidChangeStorage(f=>{n.add(f.key)});const m=e.set("foo","bar1"),l=e.set("foo","bar2"),s=e.set("foo","bar3");let t=!1;e.whenFlushed().then(()=>t=!0),o(e.get("foo"),"bar3"),o(n.size,1),c(n.has("foo"));let r=!1;await Promise.all([m,l,s]).then(()=>r=!0),c(r),c(t),n=new Set;const a=e.set("bar","foo"),i=e.delete("bar");c(!e.get("bar")),o(n.size,1),c(n.has("bar"));let g=!1;await Promise.all([a,i]).then(()=>g=!0),c(g),await e.close()})),test("corrupt DB recovers",async()=>v({},async function(){const e=u(d,"storage.db");let n=new b(new p(e));await n.init(),await n.set("bar","foo"),await h.writeFile(e,"This is a broken DB"),await n.set("foo","bar"),o(n.get("bar"),"foo"),o(n.get("foo"),"bar"),await n.close(),n=new b(new p(e)),await n.init(),o(n.get("bar"),"foo"),o(n.get("foo"),"bar"),await n.close()}))}),j("SQLite Storage Library",function(){function d(s){const t=new Set;return s.forEach(r=>t.add(r)),t}let e;setup(function(){return e=B(P(),"vsctests","storagelibrary"),I.promises.mkdir(e,{recursive:!0})}),teardown(function(){return h.rm(e)});async function n(s,t){let r;t&&(r={logging:{logError:t}});const a=new p(s,r),i=new Map;i.set("foo","bar"),i.set("some/foo/path","some/bar/path"),i.set(JSON.stringify({foo:"bar"}),JSON.stringify({bar:"foo"}));let g=await a.getItems();o(g.size,0),await a.updateItems({insert:i}),g=await a.getItems(),o(g.size,i.size),o(g.get("foo"),"bar"),o(g.get("some/foo/path"),"some/bar/path"),o(g.get(JSON.stringify({foo:"bar"})),JSON.stringify({bar:"foo"})),await a.updateItems({delete:d(["foo"])}),g=await a.getItems(),o(g.size,i.size-1),c(!g.has("foo")),o(g.get("some/foo/path"),"some/bar/path"),o(g.get(JSON.stringify({foo:"bar"})),JSON.stringify({bar:"foo"})),await a.updateItems({insert:i}),g=await a.getItems(),o(g.size,i.size),o(g.get("foo"),"bar"),o(g.get("some/foo/path"),"some/bar/path"),o(g.get(JSON.stringify({foo:"bar"})),JSON.stringify({bar:"foo"}));const f=new Map;f.set("foo","otherbar"),await a.updateItems({insert:f}),g=await a.getItems(),o(g.get("foo"),"otherbar"),await a.updateItems({delete:d(["foo","bar","some/foo/path",JSON.stringify({foo:"bar"})])}),g=await a.getItems(),o(g.size,0),await a.updateItems({insert:i,delete:d(["foo","some/foo/path","other"])}),g=await a.getItems(),o(g.size,1),o(g.get(JSON.stringify({foo:"bar"})),JSON.stringify({bar:"foo"})),await a.updateItems({delete:d([JSON.stringify({foo:"bar"})])}),g=await a.getItems(),o(g.size,0);let k=!1;await a.close(()=>(k=!0,new Map)),o(k,!1)}test("basics",async()=>{await n(u(e,"storage.db"))}),test("basics (open multiple times)",async()=>{await n(u(e,"storage.db")),await n(u(e,"storage.db"))}),test("basics (corrupt DB falls back to empty DB)",async()=>{const s=u(e,"broken.db");await h.writeFile(s,"This is a broken DB");let t;await n(s,r=>{t=r}),c(t)}),test("basics (corrupt DB restores from previous backup)",async()=>{const s=u(e,"storage.db");let t=new p(s);const r=new Map;r.set("foo","bar"),r.set("some/foo/path","some/bar/path"),r.set(JSON.stringify({foo:"bar"}),JSON.stringify({bar:"foo"})),await t.updateItems({insert:r}),await t.close(),await h.writeFile(s,"This is now a broken DB"),t=new p(s);const a=await t.getItems();o(a.size,r.size),o(a.get("foo"),"bar"),o(a.get("some/foo/path"),"some/bar/path"),o(a.get(JSON.stringify({foo:"bar"})),JSON.stringify({bar:"foo"}));let i=!1;await t.close(()=>(i=!0,new Map)),o(i,!1)}),test("basics (corrupt DB falls back to empty DB if backup is corrupt)",async()=>{const s=u(e,"storage.db");let t=new p(s);const r=new Map;r.set("foo","bar"),r.set("some/foo/path","some/bar/path"),r.set(JSON.stringify({foo:"bar"}),JSON.stringify({bar:"foo"})),await t.updateItems({insert:r}),await t.close(),await h.writeFile(s,"This is now a broken DB"),await h.writeFile(`${s}.backup`,"This is now also a broken DB"),t=new p(s);const a=await t.getItems();o(a.size,0),await n(s)}),(O?test.skip:test)("basics (DB that becomes corrupt during runtime stores all state from cache on close)",async()=>{const s=u(e,"storage.db");let t=new p(s);const r=new Map;r.set("foo","bar"),r.set("some/foo/path","some/bar/path"),r.set(JSON.stringify({foo:"bar"}),JSON.stringify({bar:"foo"})),await t.updateItems({insert:r}),await t.close();const a=`${s}.backup`;o(await h.exists(a),!0),t=new p(s),await t.getItems(),await h.writeFile(s,"This is now a broken DB"),await t.checkIntegrity(!0).then(null,f=>{}),await I.promises.unlink(a);let i=!1;await t.close(()=>(i=!0,r)),o(i,!0),o(await h.exists(a),!0),t=new p(s);const g=await t.getItems();o(g.size,r.size),o(g.get("foo"),"bar"),o(g.get("some/foo/path"),"some/bar/path"),o(g.get(JSON.stringify({foo:"bar"})),JSON.stringify({bar:"foo"})),i=!1,await t.close(()=>(i=!0,new Map)),o(i,!1)}),test("real world example",async function(){let s=new p(u(e,"storage.db"));const t=new Map;t.set("colorthemedata",'{"id":"vs vscode-theme-defaults-themes-light_plus-json","label":"Light+ (default light)","settingsId":"Default Light+","selector":"vs.vscode-theme-defaults-themes-light_plus-json","themeTokenColors":[{"settings":{"foreground":"#000000ff","background":"#ffffffff"}},{"scope":["meta.embedded","source.groovy.embedded"],"settings":{"foreground":"#000000ff"}},{"scope":"emphasis","settings":{"fontStyle":"italic"}},{"scope":"strong","settings":{"fontStyle":"bold"}},{"scope":"meta.diff.header","settings":{"foreground":"#000080"}},{"scope":"comment","settings":{"foreground":"#008000"}},{"scope":"constant.language","settings":{"foreground":"#0000ff"}},{"scope":["constant.numeric"],"settings":{"foreground":"#098658"}},{"scope":"constant.regexp","settings":{"foreground":"#811f3f"}},{"name":"css tags in selectors, xml tags","scope":"entity.name.tag","settings":{"foreground":"#800000"}},{"scope":"entity.name.selector","settings":{"foreground":"#800000"}},{"scope":"entity.other.attribute-name","settings":{"foreground":"#ff0000"}},{"scope":["entity.other.attribute-name.class.css","entity.other.attribute-name.class.mixin.css","entity.other.attribute-name.id.css","entity.other.attribute-name.parent-selector.css","entity.other.attribute-name.pseudo-class.css","entity.other.attribute-name.pseudo-element.css","source.css.less entity.other.attribute-name.id","entity.other.attribute-name.attribute.scss","entity.other.attribute-name.scss"],"settings":{"foreground":"#800000"}},{"scope":"invalid","settings":{"foreground":"#cd3131"}},{"scope":"markup.underline","settings":{"fontStyle":"underline"}},{"scope":"markup.bold","settings":{"fontStyle":"bold","foreground":"#000080"}},{"scope":"markup.heading","settings":{"fontStyle":"bold","foreground":"#800000"}},{"scope":"markup.italic","settings":{"fontStyle":"italic"}},{"scope":"markup.inserted","settings":{"foreground":"#098658"}},{"scope":"markup.deleted","settings":{"foreground":"#a31515"}},{"scope":"markup.changed","settings":{"foreground":"#0451a5"}},{"scope":["punctuation.definition.quote.begin.markdown","punctuation.definition.list.begin.markdown"],"settings":{"foreground":"#0451a5"}},{"scope":"markup.inline.raw","settings":{"foreground":"#800000"}},{"name":"brackets of XML/HTML tags","scope":"punctuation.definition.tag","settings":{"foreground":"#800000"}},{"scope":"meta.preprocessor","settings":{"foreground":"#0000ff"}},{"scope":"meta.preprocessor.string","settings":{"foreground":"#a31515"}},{"scope":"meta.preprocessor.numeric","settings":{"foreground":"#098658"}},{"scope":"meta.structure.dictionary.key.python","settings":{"foreground":"#0451a5"}},{"scope":"storage","settings":{"foreground":"#0000ff"}},{"scope":"storage.type","settings":{"foreground":"#0000ff"}},{"scope":"storage.modifier","settings":{"foreground":"#0000ff"}},{"scope":"string","settings":{"foreground":"#a31515"}},{"scope":["string.comment.buffered.block.pug","string.quoted.pug","string.interpolated.pug","string.unquoted.plain.in.yaml","string.unquoted.plain.out.yaml","string.unquoted.block.yaml","string.quoted.single.yaml","string.quoted.double.xml","string.quoted.single.xml","string.unquoted.cdata.xml","string.quoted.double.html","string.quoted.single.html","string.unquoted.html","string.quoted.single.handlebars","string.quoted.double.handlebars"],"settings":{"foreground":"#0000ff"}},{"scope":"string.regexp","settings":{"foreground":"#811f3f"}},{"name":"String interpolation","scope":["punctuation.definition.template-expression.begin","punctuation.definition.template-expression.end","punctuation.section.embedded"],"settings":{"foreground":"#0000ff"}},{"name":"Reset JavaScript string interpolation expression","scope":["meta.template.expression"],"settings":{"foreground":"#000000"}},{"scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"scope":["support.type.vendored.property-name","support.type.property-name","variable.css","variable.scss","variable.other.less","source.coffee.embedded"],"settings":{"foreground":"#ff0000"}},{"scope":["support.type.property-name.json"],"settings":{"foreground":"#0451a5"}},{"scope":"keyword","settings":{"foreground":"#0000ff"}},{"scope":"keyword.control","settings":{"foreground":"#0000ff"}},{"scope":"keyword.operator","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.new","keyword.operator.expression","keyword.operator.cast","keyword.operator.sizeof","keyword.operator.instanceof","keyword.operator.logical.python"],"settings":{"foreground":"#0000ff"}},{"scope":"keyword.other.unit","settings":{"foreground":"#098658"}},{"scope":["punctuation.section.embedded.begin.php","punctuation.section.embedded.end.php"],"settings":{"foreground":"#800000"}},{"scope":"support.function.git-rebase","settings":{"foreground":"#0451a5"}},{"scope":"constant.sha.git-rebase","settings":{"foreground":"#098658"}},{"name":"coloring of the Java import and package identifiers","scope":["storage.modifier.import.java","variable.language.wildcard.java","storage.modifier.package.java"],"settings":{"foreground":"#000000"}},{"name":"this.self","scope":"variable.language","settings":{"foreground":"#0000ff"}},{"name":"Function declarations","scope":["entity.name.function","support.function","support.constant.handlebars"],"settings":{"foreground":"#795E26"}},{"name":"Types declaration and references","scope":["meta.return-type","support.class","support.type","entity.name.type","entity.name.class","storage.type.numeric.go","storage.type.byte.go","storage.type.boolean.go","storage.type.string.go","storage.type.uintptr.go","storage.type.error.go","storage.type.rune.go","storage.type.cs","storage.type.generic.cs","storage.type.modifier.cs","storage.type.variable.cs","storage.type.annotation.java","storage.type.generic.java","storage.type.java","storage.type.object.array.java","storage.type.primitive.array.java","storage.type.primitive.java","storage.type.token.java","storage.type.groovy","storage.type.annotation.groovy","storage.type.parameters.groovy","storage.type.generic.groovy","storage.type.object.array.groovy","storage.type.primitive.array.groovy","storage.type.primitive.groovy"],"settings":{"foreground":"#267f99"}},{"name":"Types declaration and references, TS grammar specific","scope":["meta.type.cast.expr","meta.type.new.expr","support.constant.math","support.constant.dom","support.constant.json","entity.other.inherited-class"],"settings":{"foreground":"#267f99"}},{"name":"Control flow keywords","scope":"keyword.control","settings":{"foreground":"#AF00DB"}},{"name":"Variable and parameter name","scope":["variable","meta.definition.variable.name","support.variable","entity.name.variable"],"settings":{"foreground":"#001080"}},{"name":"Object keys, TS grammar specific","scope":["meta.object-literal.key"],"settings":{"foreground":"#001080"}},{"name":"CSS property value","scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"name":"Regular expression groups","scope":["punctuation.definition.group.regexp","punctuation.definition.group.assertion.regexp","punctuation.definition.character-class.regexp","punctuation.character.set.begin.regexp","punctuation.character.set.end.regexp","keyword.operator.negation.regexp","support.other.parenthesis.regexp"],"settings":{"foreground":"#d16969"}},{"scope":["constant.character.character-class.regexp","constant.other.character-class.set.regexp","constant.other.character-class.regexp","constant.character.set.regexp"],"settings":{"foreground":"#811f3f"}},{"scope":"keyword.operator.quantifier.regexp","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.or.regexp","keyword.control.anchor.regexp"],"settings":{"foreground":"#ff0000"}},{"scope":"constant.character","settings":{"foreground":"#0000ff"}},{"scope":"constant.character.escape","settings":{"foreground":"#ff0000"}},{"scope":"token.info-token","settings":{"foreground":"#316bcd"}},{"scope":"token.warn-token","settings":{"foreground":"#cd9731"}},{"scope":"token.error-token","settings":{"foreground":"#cd3131"}},{"scope":"token.debug-token","settings":{"foreground":"#800080"}}],"extensionData":{"extensionId":"vscode.theme-defaults","extensionPublisher":"vscode","extensionName":"theme-defaults","extensionIsBuiltin":true},"colorMap":{"editor.background":"#ffffff","editor.foreground":"#000000","editor.inactiveSelectionBackground":"#e5ebf1","editorIndentGuide.background":"#d3d3d3","editorIndentGuide.activeBackground":"#939393","editor.selectionHighlightBackground":"#add6ff4d","editorSuggestWidget.background":"#f3f3f3","activityBarBadge.background":"#007acc","sideBarTitle.foreground":"#6f6f6f","list.hoverBackground":"#e8e8e8","input.placeholderForeground":"#767676","settings.textInputBorder":"#cecece","settings.numberInputBorder":"#cecece"}}'),t.set("commandpalette.mru.cache",'{"usesLRU":true,"entries":[{"key":"revealFileInOS","value":3},{"key":"extension.openInGitHub","value":4},{"key":"workbench.extensions.action.openExtensionsFolder","value":11},{"key":"workbench.action.showRuntimeExtensions","value":14},{"key":"workbench.action.toggleTabsVisibility","value":15},{"key":"extension.liveServerPreview.open","value":16},{"key":"workbench.action.openIssueReporter","value":18},{"key":"workbench.action.openProcessExplorer","value":19},{"key":"workbench.action.toggleSharedProcess","value":20},{"key":"workbench.action.configureLocale","value":21},{"key":"workbench.action.appPerf","value":22},{"key":"workbench.action.reportPerformanceIssueUsingReporter","value":23},{"key":"workbench.action.openGlobalKeybindings","value":25},{"key":"workbench.action.output.toggleOutput","value":27},{"key":"extension.sayHello","value":29}]}'),t.set("cpp.1.lastsessiondate","Fri Oct 05 2018"),t.set("debug.actionswidgetposition","0.6880952380952381");const r=new Map;r.set("workbench.editors.files.textfileeditor",'{"textEditorViewState":[["file:///Users/dummy/Documents/ticino-playground/play.htm",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":6,"column":16},"position":{"lineNumber":6,"column":16}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":0},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}],["file:///Users/dummy/Documents/ticino-playground/nakefile.js",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":7,"column":81},"position":{"lineNumber":7,"column":81}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":20},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}],["file:///Users/dummy/Desktop/vscode2/.gitattributes",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":9,"column":12},"position":{"lineNumber":9,"column":12}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":20},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}],["file:///Users/dummy/Desktop/vscode2/src/vs/workbench/contrib/search/browser/openAnythingHandler.ts",{"0":{"cursorState":[{"inSelectionMode":false,"selectionStart":{"lineNumber":1,"column":1},"position":{"lineNumber":1,"column":1}}],"viewState":{"scrollLeft":0,"firstPosition":{"lineNumber":1,"column":1},"firstPositionDeltaTop":0},"contributionsState":{"editor.contrib.folding":{},"editor.contrib.wordHighlighter":false}}}]]}');const a=new Map;a.set("nps/iscandidate","false"),a.set("telemetry.instanceid","d52bfcd4-4be6-476b-a38f-d44c717c41d6"),a.set("workbench.activity.pinnedviewlets",'[{"id":"workbench.view.explorer","pinned":true,"order":0,"visible":true},{"id":"workbench.view.search","pinned":true,"order":1,"visible":true},{"id":"workbench.view.scm","pinned":true,"order":2,"visible":true},{"id":"workbench.view.debug","pinned":true,"order":3,"visible":true},{"id":"workbench.view.extensions","pinned":true,"order":4,"visible":true},{"id":"workbench.view.extension.gitlens","pinned":true,"order":7,"visible":true},{"id":"workbench.view.extension.test","pinned":false,"visible":false}]'),a.set("workbench.panel.height","419"),a.set("very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.very.long.key.","is long");let i=await s.getItems();o(i.size,0),await Promise.all([await s.updateItems({insert:t}),await s.updateItems({insert:r}),await s.updateItems({insert:a})]),o(await s.checkIntegrity(!0),"ok"),o(await s.checkIntegrity(!1),"ok"),i=await s.getItems(),o(i.size,t.size+r.size+a.size);const g=[];t.forEach((w,y)=>{g.push(y),o(i.get(y),w)});const f=[];r.forEach((w,y)=>{f.push(y),o(i.get(y),w)});const k=[];a.forEach((w,y)=>{k.push(y),o(i.get(y),w)}),await Promise.all([await s.updateItems({delete:d(g)}),await s.updateItems({delete:d(f)}),await s.updateItems({delete:d(k)})]),i=await s.getItems(),o(i.size,0),await Promise.all([await s.updateItems({insert:t}),await s.getItems(),await s.updateItems({insert:r}),await s.getItems(),await s.updateItems({insert:a}),await s.getItems()]),i=await s.getItems(),o(i.size,t.size+r.size+a.size),await s.close(),s=new p(u(e,"storage.db")),i=await s.getItems(),o(i.size,t.size+r.size+a.size),await s.close()}),test("very large item value",async function(){const s=new p(u(e,"storage.db"));let t=l();await s.updateItems({insert:t.items});let r=await s.getItems();o(t.items.get("colorthemedata"),r.get("colorthemedata")),o(t.items.get("commandpalette.mru.cache"),r.get("commandpalette.mru.cache")),o(t.items.get("super.large.string"),r.get("super.large.string")),t=l(),await s.updateItems({insert:t.items}),r=await s.getItems(),o(t.items.get("colorthemedata"),r.get("colorthemedata")),o(t.items.get("commandpalette.mru.cache"),r.get("commandpalette.mru.cache")),o(t.items.get("super.large.string"),r.get("super.large.string"));const a=new Set;a.add("super.large.string"),await s.updateItems({delete:a}),r=await s.getItems(),o(t.items.get("colorthemedata"),r.get("colorthemedata")),o(t.items.get("commandpalette.mru.cache"),r.get("commandpalette.mru.cache")),c(!r.get("super.large.string")),await s.close()}),test("multiple concurrent writes execute in sequence",async()=>v({},async()=>{class s extends b{getStorage(){return this.database}}const t=new s(new p(u(e,"storage.db")));await t.init(),t.set("foo","bar"),t.set("some/foo/path","some/bar/path"),await S(2),t.set("foo1","bar"),t.set("some/foo1/path","some/bar/path"),await S(2),t.set("foo2","bar"),t.set("some/foo2/path","some/bar/path"),await S(2),t.delete("foo1"),t.delete("some/foo1/path"),await S(2),t.delete("foo4"),t.delete("some/foo4/path"),await S(5),t.set("foo3","bar"),await t.set("some/foo3/path","some/bar/path");const r=await t.getStorage().getItems();o(r.get("foo"),"bar"),o(r.get("some/foo/path"),"some/bar/path"),o(r.has("foo1"),!1),o(r.has("some/foo1/path"),!1),o(r.get("foo2"),"bar"),o(r.get("some/foo2/path"),"some/bar/path"),o(r.get("foo3"),"bar"),o(r.get("some/foo3/path"),"some/bar/path"),await t.close()})),test("lots of INSERT & DELETE (below inline max)",async()=>{const s=new p(u(e,"storage.db")),{items:t,keys:r}=m(200);await s.updateItems({insert:t});let a=await s.getItems();o(a.size,t.size),await s.updateItems({delete:r}),a=await s.getItems(),o(a.size,0),await s.close()}),test("lots of INSERT & DELETE (above inline max)",async()=>{const s=new p(u(e,"storage.db")),{items:t,keys:r}=m();await s.updateItems({insert:t});let a=await s.getItems();o(a.size,t.size),await s.updateItems({delete:r}),a=await s.getItems(),o(a.size,0),await s.close()}),test("invalid path does not hang",async()=>{const s=new p(u(e,"nonexist","storage.db"));let t;try{await s.getItems(),await s.close()}catch(r){t=r}c(t)}),test("optimize",async()=>{const s=u(e,"storage.db");let t=new p(s);const{items:r,keys:a}=m(400,!0);await t.updateItems({insert:r});let i=await t.getItems();o(i.size,r.size),await t.optimize(),await t.close();const g=(await I.promises.stat(s)).size;t=new p(s),i=await t.getItems(),o(i.size,r.size),await t.updateItems({delete:a}),i=await t.getItems(),o(i.size,0),await t.optimize(),await t.close(),t=new p(s),i=await t.getItems(),o(i.size,0),await t.close();const f=(await I.promises.stat(s)).size;o(f<g,!0)});function m(s=400,t=!1){const r=new Map,a=new Set;for(let i=0;i<s;i++){const g=D(),f=`key: ${g}`;r.set(f,`value: ${g}`),a.add(f)}if(t){const i=l();for(const[g,f]of i.items)r.set(g,f),a.add(g)}return{items:r,keys:a}}function l(){const s=new Map;s.set("colorthemedata",'{"id":"vs vscode-theme-defaults-themes-light_plus-json","label":"Light+ (default light)","settingsId":"Default Light+","selector":"vs.vscode-theme-defaults-themes-light_plus-json","themeTokenColors":[{"settings":{"foreground":"#000000ff","background":"#ffffffff"}},{"scope":["meta.embedded","source.groovy.embedded"],"settings":{"foreground":"#000000ff"}},{"scope":"emphasis","settings":{"fontStyle":"italic"}},{"scope":"strong","settings":{"fontStyle":"bold"}},{"scope":"meta.diff.header","settings":{"foreground":"#000080"}},{"scope":"comment","settings":{"foreground":"#008000"}},{"scope":"constant.language","settings":{"foreground":"#0000ff"}},{"scope":["constant.numeric"],"settings":{"foreground":"#098658"}},{"scope":"constant.regexp","settings":{"foreground":"#811f3f"}},{"name":"css tags in selectors, xml tags","scope":"entity.name.tag","settings":{"foreground":"#800000"}},{"scope":"entity.name.selector","settings":{"foreground":"#800000"}},{"scope":"entity.other.attribute-name","settings":{"foreground":"#ff0000"}},{"scope":["entity.other.attribute-name.class.css","entity.other.attribute-name.class.mixin.css","entity.other.attribute-name.id.css","entity.other.attribute-name.parent-selector.css","entity.other.attribute-name.pseudo-class.css","entity.other.attribute-name.pseudo-element.css","source.css.less entity.other.attribute-name.id","entity.other.attribute-name.attribute.scss","entity.other.attribute-name.scss"],"settings":{"foreground":"#800000"}},{"scope":"invalid","settings":{"foreground":"#cd3131"}},{"scope":"markup.underline","settings":{"fontStyle":"underline"}},{"scope":"markup.bold","settings":{"fontStyle":"bold","foreground":"#000080"}},{"scope":"markup.heading","settings":{"fontStyle":"bold","foreground":"#800000"}},{"scope":"markup.italic","settings":{"fontStyle":"italic"}},{"scope":"markup.inserted","settings":{"foreground":"#098658"}},{"scope":"markup.deleted","settings":{"foreground":"#a31515"}},{"scope":"markup.changed","settings":{"foreground":"#0451a5"}},{"scope":["punctuation.definition.quote.begin.markdown","punctuation.definition.list.begin.markdown"],"settings":{"foreground":"#0451a5"}},{"scope":"markup.inline.raw","settings":{"foreground":"#800000"}},{"name":"brackets of XML/HTML tags","scope":"punctuation.definition.tag","settings":{"foreground":"#800000"}},{"scope":"meta.preprocessor","settings":{"foreground":"#0000ff"}},{"scope":"meta.preprocessor.string","settings":{"foreground":"#a31515"}},{"scope":"meta.preprocessor.numeric","settings":{"foreground":"#098658"}},{"scope":"meta.structure.dictionary.key.python","settings":{"foreground":"#0451a5"}},{"scope":"storage","settings":{"foreground":"#0000ff"}},{"scope":"storage.type","settings":{"foreground":"#0000ff"}},{"scope":"storage.modifier","settings":{"foreground":"#0000ff"}},{"scope":"string","settings":{"foreground":"#a31515"}},{"scope":["string.comment.buffered.block.pug","string.quoted.pug","string.interpolated.pug","string.unquoted.plain.in.yaml","string.unquoted.plain.out.yaml","string.unquoted.block.yaml","string.quoted.single.yaml","string.quoted.double.xml","string.quoted.single.xml","string.unquoted.cdata.xml","string.quoted.double.html","string.quoted.single.html","string.unquoted.html","string.quoted.single.handlebars","string.quoted.double.handlebars"],"settings":{"foreground":"#0000ff"}},{"scope":"string.regexp","settings":{"foreground":"#811f3f"}},{"name":"String interpolation","scope":["punctuation.definition.template-expression.begin","punctuation.definition.template-expression.end","punctuation.section.embedded"],"settings":{"foreground":"#0000ff"}},{"name":"Reset JavaScript string interpolation expression","scope":["meta.template.expression"],"settings":{"foreground":"#000000"}},{"scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"scope":["support.type.vendored.property-name","support.type.property-name","variable.css","variable.scss","variable.other.less","source.coffee.embedded"],"settings":{"foreground":"#ff0000"}},{"scope":["support.type.property-name.json"],"settings":{"foreground":"#0451a5"}},{"scope":"keyword","settings":{"foreground":"#0000ff"}},{"scope":"keyword.control","settings":{"foreground":"#0000ff"}},{"scope":"keyword.operator","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.new","keyword.operator.expression","keyword.operator.cast","keyword.operator.sizeof","keyword.operator.instanceof","keyword.operator.logical.python"],"settings":{"foreground":"#0000ff"}},{"scope":"keyword.other.unit","settings":{"foreground":"#098658"}},{"scope":["punctuation.section.embedded.begin.php","punctuation.section.embedded.end.php"],"settings":{"foreground":"#800000"}},{"scope":"support.function.git-rebase","settings":{"foreground":"#0451a5"}},{"scope":"constant.sha.git-rebase","settings":{"foreground":"#098658"}},{"name":"coloring of the Java import and package identifiers","scope":["storage.modifier.import.java","variable.language.wildcard.java","storage.modifier.package.java"],"settings":{"foreground":"#000000"}},{"name":"this.self","scope":"variable.language","settings":{"foreground":"#0000ff"}},{"name":"Function declarations","scope":["entity.name.function","support.function","support.constant.handlebars"],"settings":{"foreground":"#795E26"}},{"name":"Types declaration and references","scope":["meta.return-type","support.class","support.type","entity.name.type","entity.name.class","storage.type.numeric.go","storage.type.byte.go","storage.type.boolean.go","storage.type.string.go","storage.type.uintptr.go","storage.type.error.go","storage.type.rune.go","storage.type.cs","storage.type.generic.cs","storage.type.modifier.cs","storage.type.variable.cs","storage.type.annotation.java","storage.type.generic.java","storage.type.java","storage.type.object.array.java","storage.type.primitive.array.java","storage.type.primitive.java","storage.type.token.java","storage.type.groovy","storage.type.annotation.groovy","storage.type.parameters.groovy","storage.type.generic.groovy","storage.type.object.array.groovy","storage.type.primitive.array.groovy","storage.type.primitive.groovy"],"settings":{"foreground":"#267f99"}},{"name":"Types declaration and references, TS grammar specific","scope":["meta.type.cast.expr","meta.type.new.expr","support.constant.math","support.constant.dom","support.constant.json","entity.other.inherited-class"],"settings":{"foreground":"#267f99"}},{"name":"Control flow keywords","scope":"keyword.control","settings":{"foreground":"#AF00DB"}},{"name":"Variable and parameter name","scope":["variable","meta.definition.variable.name","support.variable","entity.name.variable"],"settings":{"foreground":"#001080"}},{"name":"Object keys, TS grammar specific","scope":["meta.object-literal.key"],"settings":{"foreground":"#001080"}},{"name":"CSS property value","scope":["support.constant.property-value","support.constant.font-name","support.constant.media-type","support.constant.media","constant.other.color.rgb-value","constant.other.rgb-value","support.constant.color"],"settings":{"foreground":"#0451a5"}},{"name":"Regular expression groups","scope":["punctuation.definition.group.regexp","punctuation.definition.group.assertion.regexp","punctuation.definition.character-class.regexp","punctuation.character.set.begin.regexp","punctuation.character.set.end.regexp","keyword.operator.negation.regexp","support.other.parenthesis.regexp"],"settings":{"foreground":"#d16969"}},{"scope":["constant.character.character-class.regexp","constant.other.character-class.set.regexp","constant.other.character-class.regexp","constant.character.set.regexp"],"settings":{"foreground":"#811f3f"}},{"scope":"keyword.operator.quantifier.regexp","settings":{"foreground":"#000000"}},{"scope":["keyword.operator.or.regexp","keyword.control.anchor.regexp"],"settings":{"foreground":"#ff0000"}},{"scope":"constant.character","settings":{"foreground":"#0000ff"}},{"scope":"constant.character.escape","settings":{"foreground":"#ff0000"}},{"scope":"token.info-token","settings":{"foreground":"#316bcd"}},{"scope":"token.warn-token","settings":{"foreground":"#cd9731"}},{"scope":"token.error-token","settings":{"foreground":"#cd3131"}},{"scope":"token.debug-token","settings":{"foreground":"#800080"}}],"extensionData":{"extensionId":"vscode.theme-defaults","extensionPublisher":"vscode","extensionName":"theme-defaults","extensionIsBuiltin":true},"colorMap":{"editor.background":"#ffffff","editor.foreground":"#000000","editor.inactiveSelectionBackground":"#e5ebf1","editorIndentGuide.background":"#d3d3d3","editorIndentGuide.activeBackground":"#939393","editor.selectionHighlightBackground":"#add6ff4d","editorSuggestWidget.background":"#f3f3f3","activityBarBadge.background":"#007acc","sideBarTitle.foreground":"#6f6f6f","list.hoverBackground":"#e8e8e8","input.placeholderForeground":"#767676","settings.textInputBorder":"#cecece","settings.numberInputBorder":"#cecece"}}'),s.set("commandpalette.mru.cache",'{"usesLRU":true,"entries":[{"key":"revealFileInOS","value":3},{"key":"extension.openInGitHub","value":4},{"key":"workbench.extensions.action.openExtensionsFolder","value":11},{"key":"workbench.action.showRuntimeExtensions","value":14},{"key":"workbench.action.toggleTabsVisibility","value":15},{"key":"extension.liveServerPreview.open","value":16},{"key":"workbench.action.openIssueReporter","value":18},{"key":"workbench.action.openProcessExplorer","value":19},{"key":"workbench.action.toggleSharedProcess","value":20},{"key":"workbench.action.configureLocale","value":21},{"key":"workbench.action.appPerf","value":22},{"key":"workbench.action.reportPerformanceIssueUsingReporter","value":23},{"key":"workbench.action.openGlobalKeybindings","value":25},{"key":"workbench.action.output.toggleOutput","value":27},{"key":"extension.sayHello","value":29}]}');const t=D(),r=[];for(let a=0;a<1e5;a++)r.push(t);return s.set("super.large.string",r.join()),{items:s,uuid:t,value:r}}});