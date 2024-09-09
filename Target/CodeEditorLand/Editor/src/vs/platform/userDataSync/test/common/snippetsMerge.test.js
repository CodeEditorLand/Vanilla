import e from"assert";import{ensureNoDisposablesAreLeakedInTestSuite as p}from"../../../../base/test/common/utils.js";import{merge as r}from"../../common/snippetsMerge.js";const c=`{

	// Place your snippets for TypeScript here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, Placeholders with the
	// same ids are connected.
	"Print to console": {
	// Example:
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console",
	}

}`,i=`{

	// Place your snippets for TypeScript here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position, Placeholders with the
	// same ids are connected.
	"Print to console": {
	// Example:
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console always",
	}

}`,d=`{
/*
	// Place your snippets for HTML here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted.
	// Example:
	"Print to console": {
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console"
	}
*/
"Div": {
	"prefix": "div",
		"body": [
			"<div>",
			"",
			"</div>"
		],
			"description": "New div"
	}
}`,s=`{
/*
	// Place your snippets for HTML here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted.
	// Example:
	"Print to console": {
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console"
	}
*/
"Div": {
	"prefix": "div",
		"body": [
			"<div>",
			"",
			"</div>"
		],
			"description": "New div changed"
	}
}`,n=`{
	// Place your snippets for c here. Each snippet is defined under a snippet name and has a prefix, body and
	// description. The prefix is what is used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
	// $1, $2 for tab stops, $0 for the final cursor position.Placeholders with the
	// same ids are connected.
	// Example:
	"Print to console": {
	"prefix": "log",
		"body": [
			"console.log('$1');",
			"$2"
		],
			"description": "Log output to console"
	}
}`;suite("SnippetsMerge",()=>{p(),test("merge when local and remote are same with one snippet",async()=>{const t=r({"html.json":d},{"html.json":d},null);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when local and remote are same with multiple entries",async()=>{const t=r({"html.json":d,"typescript.json":c},{"html.json":d,"typescript.json":c},null);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when local and remote are same with multiple entries in different order",async()=>{const t=r({"typescript.json":c,"html.json":d},{"html.json":d,"typescript.json":c},null);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when local and remote are same with different base content",async()=>{const o=r({"html.json":d,"typescript.json":c},{"html.json":d,"typescript.json":c},{"html.json":s,"typescript.json":i});e.deepStrictEqual(o.local.added,{}),e.deepStrictEqual(o.local.updated,{}),e.deepStrictEqual(o.local.removed,[]),e.deepStrictEqual(o.conflicts,[]),e.deepStrictEqual(o.remote.added,{}),e.deepStrictEqual(o.remote.updated,{}),e.deepStrictEqual(o.remote.removed,[])}),test("merge when a new entry is added to remote",async()=>{const t=r({"html.json":d},{"html.json":d,"typescript.json":c},null);e.deepStrictEqual(t.local.added,{"typescript.json":c}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when multiple new entries are added to remote",async()=>{const a={},l={"html.json":d,"typescript.json":c},t=r(a,l,null);e.deepStrictEqual(t.local.added,l),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when new entry is added to remote from base and local has not changed",async()=>{const a={"html.json":d},t=r(a,{"html.json":d,"typescript.json":c},a);e.deepStrictEqual(t.local.added,{"typescript.json":c}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when an entry is removed from remote from base and local has not changed",async()=>{const a={"html.json":d,"typescript.json":c},t=r(a,{"html.json":d},a);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,["typescript.json"]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when all entries are removed from base and local has not changed",async()=>{const a={"html.json":d,"typescript.json":c},t=r(a,{},a);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,["html.json","typescript.json"]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when an entry is updated in remote from base and local has not changed",async()=>{const a={"html.json":d},t=r(a,{"html.json":s},a);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{"html.json":s}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when remote has moved forwarded with multiple changes and local stays with base",async()=>{const a={"html.json":d,"typescript.json":c},t=r(a,{"html.json":s,"c.json":n},a);e.deepStrictEqual(t.local.added,{"c.json":n}),e.deepStrictEqual(t.local.updated,{"html.json":s}),e.deepStrictEqual(t.local.removed,["typescript.json"]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when a new entries are added to local",async()=>{const t=r({"html.json":d,"typescript.json":c,"c.json":n},{"html.json":d,"typescript.json":c},null);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{"c.json":n}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when multiple new entries are added to local from base and remote is not changed",async()=>{const a={"html.json":d,"typescript.json":c,"c.json":n},l={"typescript.json":c},t=r(a,l,l);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{"html.json":d,"c.json":n}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when an entry is removed from local from base and remote has not changed",async()=>{const a={"html.json":d},l={"html.json":d,"typescript.json":c},t=r(a,l,l);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,["typescript.json"])}),test("merge when an entry is updated in local from base and remote has not changed",async()=>{const a={"html.json":s,"typescript.json":c},l={"html.json":d,"typescript.json":c},t=r(a,l,l);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{"html.json":s}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when local has moved forwarded with multiple changes and remote stays with base",async()=>{const a={"html.json":s,"c.json":n},l={"html.json":d,"typescript.json":c},t=r(a,l,l);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,[]),e.deepStrictEqual(t.remote.added,{"c.json":n}),e.deepStrictEqual(t.remote.updated,{"html.json":s}),e.deepStrictEqual(t.remote.removed,["typescript.json"])}),test("merge when local and remote with one entry but different value",async()=>{const t=r({"html.json":d},{"html.json":s},null);e.deepStrictEqual(t.local.added,{}),e.deepStrictEqual(t.local.updated,{}),e.deepStrictEqual(t.local.removed,[]),e.deepStrictEqual(t.conflicts,["html.json"]),e.deepStrictEqual(t.remote.added,{}),e.deepStrictEqual(t.remote.updated,{}),e.deepStrictEqual(t.remote.removed,[])}),test("merge when the entry is removed in remote but updated in local and a new entry is added in remote",async()=>{const o=r({"html.json":s},{"typescript.json":c},{"html.json":d});e.deepStrictEqual(o.local.added,{"typescript.json":c}),e.deepStrictEqual(o.local.updated,{}),e.deepStrictEqual(o.local.removed,[]),e.deepStrictEqual(o.conflicts,["html.json"]),e.deepStrictEqual(o.remote.added,{}),e.deepStrictEqual(o.remote.updated,{}),e.deepStrictEqual(o.remote.removed,[])}),test("merge with single entry and local is empty",async()=>{const o=r({},{"html.json":s},{"html.json":d});e.deepStrictEqual(o.local.added,{"html.json":s}),e.deepStrictEqual(o.local.updated,{}),e.deepStrictEqual(o.local.removed,[]),e.deepStrictEqual(o.conflicts,[]),e.deepStrictEqual(o.remote.added,{}),e.deepStrictEqual(o.remote.updated,{}),e.deepStrictEqual(o.remote.removed,[])}),test("merge when local and remote has moved forwareded with conflicts",async()=>{const o=r({"html.json":s,"c.json":n},{"typescript.json":i},{"html.json":d,"typescript.json":c});e.deepStrictEqual(o.local.added,{"typescript.json":i}),e.deepStrictEqual(o.local.updated,{}),e.deepStrictEqual(o.local.removed,[]),e.deepStrictEqual(o.conflicts,["html.json"]),e.deepStrictEqual(o.remote.added,{"c.json":n}),e.deepStrictEqual(o.remote.updated,{}),e.deepStrictEqual(o.remote.removed,[])}),test("merge when local and remote has moved forwareded with multiple conflicts",async()=>{const o=r({"html.json":s,"typescript.json":i,"c.json":n},{"c.json":n},{"html.json":d,"typescript.json":c});e.deepStrictEqual(o.local.added,{}),e.deepStrictEqual(o.local.updated,{}),e.deepStrictEqual(o.local.removed,[]),e.deepStrictEqual(o.conflicts,["html.json","typescript.json"]),e.deepStrictEqual(o.remote.added,{}),e.deepStrictEqual(o.remote.updated,{}),e.deepStrictEqual(o.remote.removed,[])})});
