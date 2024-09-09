import t from"assert";import{HistoryNavigator as r,HistoryNavigator2 as i}from"../../common/history.js";import{ensureNoDisposablesAreLeakedInTestSuite as c}from"./utils.js";suite("History Navigator",()=>{c(),test("create reduces the input to limit",()=>{const e=new r(["1","2","3","4"],2);t.deepStrictEqual(["3","4"],s(e))}),test("create sets the position after last",()=>{const e=new r(["1","2","3","4"],100);t.strictEqual(e.current(),null),t.strictEqual(e.isNowhere(),!0),t.strictEqual(e.isFirst(),!1),t.strictEqual(e.isLast(),!1),t.strictEqual(e.next(),null),t.strictEqual(e.previous(),"4"),t.strictEqual(e.isNowhere(),!1),t.strictEqual(e.isFirst(),!1),t.strictEqual(e.isLast(),!0)}),test("last returns last element",()=>{const e=new r(["1","2","3","4"],100);t.strictEqual(e.first(),"1"),t.strictEqual(e.last(),"4"),t.strictEqual(e.isFirst(),!1),t.strictEqual(e.isLast(),!0)}),test("first returns first element",()=>{const e=new r(["1","2","3","4"],3);t.strictEqual("2",e.first()),t.strictEqual(e.isFirst(),!0),t.strictEqual(e.isLast(),!1)}),test("next returns next element",()=>{const e=new r(["1","2","3","4"],3);e.first(),t.strictEqual(e.next(),"3"),t.strictEqual(e.next(),"4"),t.strictEqual(e.next(),null)}),test("previous returns previous element",()=>{const e=new r(["1","2","3","4"],3);t.strictEqual(e.previous(),"4"),t.strictEqual(e.previous(),"3"),t.strictEqual(e.previous(),"2"),t.strictEqual(e.previous(),null)}),test("next on last element returns null and remains on last",()=>{const e=new r(["1","2","3","4"],3);e.first(),e.last(),t.strictEqual(e.isLast(),!0),t.strictEqual(e.current(),"4"),t.strictEqual(e.next(),null),t.strictEqual(e.isLast(),!1)}),test("previous on first element returns null and remains on first",()=>{const e=new r(["1","2","3","4"],3);e.first(),t.strictEqual(e.isFirst(),!0),t.strictEqual(e.current(),"2"),t.strictEqual(e.previous(),null),t.strictEqual(e.isFirst(),!0)}),test("add reduces the input to limit",()=>{const e=new r(["1","2","3","4"],2);e.add("5"),t.deepStrictEqual(s(e),["4","5"])}),test("adding existing element changes the position",()=>{const e=new r(["1","2","3","4"],5);e.add("2"),t.deepStrictEqual(s(e),["1","3","4","2"])}),test("add resets the navigator to last",()=>{const e=new r(["1","2","3","4"],3);e.first(),e.add("5"),t.strictEqual(e.previous(),"5"),t.strictEqual(e.isLast(),!0),t.strictEqual(e.next(),null),t.strictEqual(e.isLast(),!1)}),test("adding an existing item changes the order",()=>{const e=new r(["1","2","3"]);e.add("1"),t.deepStrictEqual(["2","3","1"],s(e))}),test("previous returns null if the current position is the first one",()=>{const e=new r(["1","2","3"]);e.first(),t.deepStrictEqual(e.previous(),null),t.strictEqual(e.isFirst(),!0)}),test("previous returns object if the current position is not the first one",()=>{const e=new r(["1","2","3"]);e.first(),e.next(),t.deepStrictEqual(e.previous(),"1")}),test("next returns null if the current position is the last one",()=>{const e=new r(["1","2","3"]);e.last(),t.strictEqual(e.isLast(),!0),t.deepStrictEqual(e.next(),null),t.strictEqual(e.isLast(),!1)}),test("next returns object if the current position is not the last one",()=>{const e=new r(["1","2","3"]);e.last(),e.previous(),t.deepStrictEqual(e.next(),"3")}),test("clear",()=>{const e=new r(["a","b","c"]);t.strictEqual(e.previous(),"c"),e.clear(),t.strictEqual(e.current(),null),t.strictEqual(e.isNowhere(),!0)});function s(e){const u=[];if(e.first(),e.current())do u.push(e.current());while(e.next());return u}}),suite("History Navigator 2",()=>{c(),test("constructor",()=>{const s=new i(["1","2","3","4"]);t.strictEqual(s.current(),"4"),t.strictEqual(s.isAtEnd(),!0)}),test("constructor - initial history is not empty",()=>{t.throws(()=>new i([]))}),test("constructor - capacity limit",()=>{const s=new i(["1","2","3","4"],3);t.strictEqual(s.current(),"4"),t.strictEqual(s.isAtEnd(),!0),t.strictEqual(s.has("1"),!1)}),test("constructor - duplicate values",()=>{const s=new i(["1","2","3","4","3","2","1"]);t.strictEqual(s.current(),"1"),t.strictEqual(s.isAtEnd(),!0)}),test("navigation",()=>{const s=new i(["1","2","3","4"]);t.strictEqual(s.current(),"4"),t.strictEqual(s.isAtEnd(),!0),t.strictEqual(s.next(),"4"),t.strictEqual(s.previous(),"3"),t.strictEqual(s.previous(),"2"),t.strictEqual(s.previous(),"1"),t.strictEqual(s.previous(),"1"),t.strictEqual(s.current(),"1"),t.strictEqual(s.next(),"2"),t.strictEqual(s.resetCursor(),"4")}),test("add",()=>{const s=new i(["1","2","3","4"]);s.add("5"),t.strictEqual(s.current(),"5"),t.strictEqual(s.isAtEnd(),!0)}),test("add - existing value",()=>{const s=new i(["1","2","3","4"]);s.add("2"),t.strictEqual(s.current(),"2"),t.strictEqual(s.isAtEnd(),!0),t.strictEqual(s.previous(),"4"),t.strictEqual(s.previous(),"3"),t.strictEqual(s.previous(),"1")}),test("replaceLast",()=>{const s=new i(["1","2","3","4"]);s.replaceLast("5"),t.strictEqual(s.current(),"5"),t.strictEqual(s.isAtEnd(),!0),t.strictEqual(s.has("4"),!1),t.strictEqual(s.previous(),"3"),t.strictEqual(s.previous(),"2"),t.strictEqual(s.previous(),"1")}),test("replaceLast - existing value",()=>{const s=new i(["1","2","3","4"]);s.replaceLast("2"),t.strictEqual(s.current(),"2"),t.strictEqual(s.isAtEnd(),!0),t.strictEqual(s.has("4"),!1),t.strictEqual(s.previous(),"3"),t.strictEqual(s.previous(),"1")}),test("prepend",()=>{const s=new i(["1","2","3","4"]);t.strictEqual(s.current(),"4"),t.ok(s.isAtEnd()),t.deepStrictEqual(Array.from(s),["1","2","3","4"]),s.prepend("0"),t.strictEqual(s.current(),"4"),t.ok(s.isAtEnd()),t.deepStrictEqual(Array.from(s),["0","1","2","3","4"]),s.prepend("2"),t.strictEqual(s.current(),"4"),t.ok(s.isAtEnd()),t.deepStrictEqual(Array.from(s),["0","1","2","3","4"])})});
