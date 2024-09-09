import t from"assert";import{isEqual as i,isEqualOrParent as a}from"../../../../base/common/extpath.js";import{isLinux as m,isMacintosh as n,isWindows as D}from"../../../../base/common/platform.js";import{URI as l}from"../../../../base/common/uri.js";import{ensureNoDisposablesAreLeakedInTestSuite as d,toResource as e}from"../../../../base/test/common/utils.js";import{FileChangesEvent as h,FileChangeType as s,isParent as c}from"../../common/files.js";suite("Files",()=>{test("FileChangesEvent - basics",function(){const o=[{resource:e.call(this,"/foo/updated.txt"),type:s.UPDATED},{resource:e.call(this,"/foo/otherupdated.txt"),type:s.UPDATED},{resource:e.call(this,"/added.txt"),type:s.ADDED},{resource:e.call(this,"/bar/deleted.txt"),type:s.DELETED},{resource:e.call(this,"/bar/folder"),type:s.DELETED},{resource:e.call(this,"/BAR/FOLDER"),type:s.DELETED}];for(const f of[!1,!0]){const r=new h(o,f);t(!r.contains(e.call(this,"/foo"),s.UPDATED)),t(r.affects(e.call(this,"/foo"),s.UPDATED)),t(r.contains(e.call(this,"/foo/updated.txt"),s.UPDATED)),t(r.affects(e.call(this,"/foo/updated.txt"),s.UPDATED)),t(r.contains(e.call(this,"/foo/updated.txt"),s.UPDATED,s.ADDED)),t(r.affects(e.call(this,"/foo/updated.txt"),s.UPDATED,s.ADDED)),t(r.contains(e.call(this,"/foo/updated.txt"),s.UPDATED,s.ADDED,s.DELETED)),t(!r.contains(e.call(this,"/foo/updated.txt"),s.ADDED,s.DELETED)),t(!r.contains(e.call(this,"/foo/updated.txt"),s.ADDED)),t(!r.contains(e.call(this,"/foo/updated.txt"),s.DELETED)),t(!r.affects(e.call(this,"/foo/updated.txt"),s.DELETED)),t(r.contains(e.call(this,"/bar/folder"),s.DELETED)),t(r.contains(e.call(this,"/BAR/FOLDER"),s.DELETED)),t(r.affects(e.call(this,"/BAR"),s.DELETED)),f?(t(r.contains(e.call(this,"/BAR/folder"),s.DELETED)),t(r.affects(e.call(this,"/bar"),s.DELETED))):(t(!r.contains(e.call(this,"/BAR/folder"),s.DELETED)),t(r.affects(e.call(this,"/bar"),s.DELETED))),t(r.contains(e.call(this,"/bar/folder/somefile"),s.DELETED)),t(r.contains(e.call(this,"/bar/folder/somefile/test.txt"),s.DELETED)),t(r.contains(e.call(this,"/BAR/FOLDER/somefile/test.txt"),s.DELETED)),f?t(r.contains(e.call(this,"/BAR/folder/somefile/test.txt"),s.DELETED)):t(!r.contains(e.call(this,"/BAR/folder/somefile/test.txt"),s.DELETED)),t(!r.contains(e.call(this,"/bar/folder2/somefile"),s.DELETED)),t.strictEqual(1,r.rawAdded.length),t.strictEqual(2,r.rawUpdated.length),t.strictEqual(3,r.rawDeleted.length),t.strictEqual(!0,r.gotAdded()),t.strictEqual(!0,r.gotUpdated()),t.strictEqual(!0,r.gotDeleted())}}),test("FileChangesEvent - supports multiple changes on file tree",function(){for(const o of[s.ADDED,s.UPDATED,s.DELETED]){const f=[{resource:e.call(this,"/foo/bar/updated.txt"),type:o},{resource:e.call(this,"/foo/bar/otherupdated.txt"),type:o},{resource:e.call(this,"/foo/bar"),type:o},{resource:e.call(this,"/foo"),type:o},{resource:e.call(this,"/bar"),type:o},{resource:e.call(this,"/bar/foo"),type:o},{resource:e.call(this,"/bar/foo/updated.txt"),type:o},{resource:e.call(this,"/bar/foo/otherupdated.txt"),type:o}];for(const r of[!1,!0]){const u=new h(f,r);for(const E of f)t(u.contains(E.resource,o)),t(u.affects(E.resource,o));switch(t(u.affects(e.call(this,"/foo"),o)),t(u.affects(e.call(this,"/bar"),o)),t(u.affects(e.call(this,"/"),o)),t(!u.affects(e.call(this,"/foobar"),o)),t(!u.contains(e.call(this,"/some/foo/bar"),o)),t(!u.affects(e.call(this,"/some/foo/bar"),o)),t(!u.contains(e.call(this,"/some/bar"),o)),t(!u.affects(e.call(this,"/some/bar"),o)),o){case s.ADDED:t.strictEqual(8,u.rawAdded.length);break;case s.DELETED:t.strictEqual(8,u.rawDeleted.length);break}}}}),test("FileChangesEvent - correlation",function(){let o=[{resource:e.call(this,"/foo/updated.txt"),type:s.UPDATED},{resource:e.call(this,"/foo/otherupdated.txt"),type:s.UPDATED},{resource:e.call(this,"/added.txt"),type:s.ADDED}],f=new h(o,!0);t.strictEqual(f.hasCorrelation(),!1),t.strictEqual(f.correlates(100),!1),o=[{resource:e.call(this,"/foo/updated.txt"),type:s.UPDATED,cId:100},{resource:e.call(this,"/foo/otherupdated.txt"),type:s.UPDATED,cId:100},{resource:e.call(this,"/added.txt"),type:s.ADDED,cId:100}],f=new h(o,!0),t.strictEqual(f.hasCorrelation(),!0),t.strictEqual(f.correlates(100),!0),t.strictEqual(f.correlates(120),!1),o=[{resource:e.call(this,"/foo/updated.txt"),type:s.UPDATED,cId:100},{resource:e.call(this,"/foo/otherupdated.txt"),type:s.UPDATED},{resource:e.call(this,"/added.txt"),type:s.ADDED,cId:100}],f=new h(o,!0),t.strictEqual(f.hasCorrelation(),!1),t.strictEqual(f.correlates(100),!1),t.strictEqual(f.correlates(120),!1),o=[{resource:e.call(this,"/foo/updated.txt"),type:s.UPDATED,cId:100},{resource:e.call(this,"/foo/otherupdated.txt"),type:s.UPDATED,cId:120},{resource:e.call(this,"/added.txt"),type:s.ADDED,cId:100}],f=new h(o,!0),t.strictEqual(f.hasCorrelation(),!1),t.strictEqual(f.correlates(100),!1),t.strictEqual(f.correlates(120),!1)});function p(o){t(o("","",!0)),t(!o(null,"",!0)),t(!o(void 0,"",!0)),t(o("/","/",!0)),t(o("/some","/some",!0)),t(o("/some/path","/some/path",!0)),t(o("c:\\","c:\\",!0)),t(o("c:\\some","c:\\some",!0)),t(o("c:\\some\\path","c:\\some\\path",!0)),t(o("/some\xF6\xE4\xFC/path","/some\xF6\xE4\xFC/path",!0)),t(o("c:\\some\xF6\xE4\xFC\\path","c:\\some\xF6\xE4\xFC\\path",!0)),t(!o("/some/path","/some/other/path",!0)),t(!o("c:\\some\\path","c:\\some\\other\\path",!0)),t(!o("c:\\some\\path","d:\\some\\path",!0)),t(o("/some/path","/some/PATH",!0)),t(o("/some\xF6\xE4\xFC/path","/some\xD6\xC4\xDC/PATH",!0)),t(o("c:\\some\\path","c:\\some\\PATH",!0)),t(o("c:\\some\xF6\xE4\xFC\\path","c:\\some\xD6\xC4\xDC\\PATH",!0)),t(o("c:\\some\\path","C:\\some\\PATH",!0))}test("isEqual (ignoreCase)",function(){p(i),t(i(l.file("/some/path").fsPath,l.file("/some/path").fsPath,!0)),t(i(l.file("c:\\some\\path").fsPath,l.file("c:\\some\\path").fsPath,!0)),t(i(l.file("/some\xF6\xE4\xFC/path").fsPath,l.file("/some\xF6\xE4\xFC/path").fsPath,!0)),t(i(l.file("c:\\some\xF6\xE4\xFC\\path").fsPath,l.file("c:\\some\xF6\xE4\xFC\\path").fsPath,!0)),t(!i(l.file("/some/path").fsPath,l.file("/some/other/path").fsPath,!0)),t(!i(l.file("c:\\some\\path").fsPath,l.file("c:\\some\\other\\path").fsPath,!0)),t(i(l.file("/some/path").fsPath,l.file("/some/PATH").fsPath,!0)),t(i(l.file("/some\xF6\xE4\xFC/path").fsPath,l.file("/some\xD6\xC4\xDC/PATH").fsPath,!0)),t(i(l.file("c:\\some\\path").fsPath,l.file("c:\\some\\PATH").fsPath,!0)),t(i(l.file("c:\\some\xF6\xE4\xFC\\path").fsPath,l.file("c:\\some\xD6\xC4\xDC\\PATH").fsPath,!0)),t(i(l.file("c:\\some\\path").fsPath,l.file("C:\\some\\PATH").fsPath,!0))}),test("isParent (ignorecase)",function(){D&&(t(c("c:\\some\\path","c:\\",!0)),t(c("c:\\some\\path","c:\\some",!0)),t(c("c:\\some\\path","c:\\some\\",!0)),t(c("c:\\some\xF6\xE4\xFC\\path","c:\\some\xF6\xE4\xFC",!0)),t(c("c:\\some\xF6\xE4\xFC\\path","c:\\some\xF6\xE4\xFC\\",!0)),t(c("c:\\foo\\bar\\test.ts","c:\\foo\\bar",!0)),t(c("c:\\foo\\bar\\test.ts","c:\\foo\\bar\\",!0)),t(c("c:\\some\\path","C:\\",!0)),t(c("c:\\some\\path","c:\\SOME",!0)),t(c("c:\\some\\path","c:\\SOME\\",!0)),t(!c("c:\\some\\path","d:\\",!0)),t(!c("c:\\some\\path","c:\\some\\path",!0)),t(!c("c:\\some\\path","d:\\some\\path",!0)),t(!c("c:\\foo\\bar\\test.ts","c:\\foo\\barr",!0)),t(!c("c:\\foo\\bar\\test.ts","c:\\foo\\bar\\test",!0))),(n||m)&&(t(c("/some/path","/",!0)),t(c("/some/path","/some",!0)),t(c("/some/path","/some/",!0)),t(c("/some\xF6\xE4\xFC/path","/some\xF6\xE4\xFC",!0)),t(c("/some\xF6\xE4\xFC/path","/some\xF6\xE4\xFC/",!0)),t(c("/foo/bar/test.ts","/foo/bar",!0)),t(c("/foo/bar/test.ts","/foo/bar/",!0)),t(c("/some/path","/SOME",!0)),t(c("/some/path","/SOME/",!0)),t(c("/some\xF6\xE4\xFC/path","/SOME\xD6\xC4\xDC",!0)),t(c("/some\xF6\xE4\xFC/path","/SOME\xD6\xC4\xDC/",!0)),t(!c("/some/path","/some/path",!0)),t(!c("/foo/bar/test.ts","/foo/barr",!0)),t(!c("/foo/bar/test.ts","/foo/bar/test",!0)))}),test("isEqualOrParent (ignorecase)",function(){p(a),D&&(t(a("c:\\some\\path","c:\\",!0)),t(a("c:\\some\\path","c:\\some",!0)),t(a("c:\\some\\path","c:\\some\\",!0)),t(a("c:\\some\xF6\xE4\xFC\\path","c:\\some\xF6\xE4\xFC",!0)),t(a("c:\\some\xF6\xE4\xFC\\path","c:\\some\xF6\xE4\xFC\\",!0)),t(a("c:\\foo\\bar\\test.ts","c:\\foo\\bar",!0)),t(a("c:\\foo\\bar\\test.ts","c:\\foo\\bar\\",!0)),t(a("c:\\some\\path","c:\\some\\path",!0)),t(a("c:\\foo\\bar\\test.ts","c:\\foo\\bar\\test.ts",!0)),t(a("c:\\some\\path","C:\\",!0)),t(a("c:\\some\\path","c:\\SOME",!0)),t(a("c:\\some\\path","c:\\SOME\\",!0)),t(!a("c:\\some\\path","d:\\",!0)),t(!a("c:\\some\\path","d:\\some\\path",!0)),t(!a("c:\\foo\\bar\\test.ts","c:\\foo\\barr",!0)),t(!a("c:\\foo\\bar\\test.ts","c:\\foo\\bar\\test",!0)),t(!a("c:\\foo\\bar\\test.ts","c:\\foo\\bar\\test.",!0)),t(!a("c:\\foo\\bar\\test.ts","c:\\foo\\BAR\\test.",!0))),(n||m)&&(t(a("/some/path","/",!0)),t(a("/some/path","/some",!0)),t(a("/some/path","/some/",!0)),t(a("/some\xF6\xE4\xFC/path","/some\xF6\xE4\xFC",!0)),t(a("/some\xF6\xE4\xFC/path","/some\xF6\xE4\xFC/",!0)),t(a("/foo/bar/test.ts","/foo/bar",!0)),t(a("/foo/bar/test.ts","/foo/bar/",!0)),t(a("/some/path","/some/path",!0)),t(a("/some/path","/SOME",!0)),t(a("/some/path","/SOME/",!0)),t(a("/some\xF6\xE4\xFC/path","/SOME\xD6\xC4\xDC",!0)),t(a("/some\xF6\xE4\xFC/path","/SOME\xD6\xC4\xDC/",!0)),t(!a("/foo/bar/test.ts","/foo/barr",!0)),t(!a("/foo/bar/test.ts","/foo/bar/test",!0)),t(!a("foo/bar/test.ts","foo/bar/test.",!0)),t(!a("foo/bar/test.ts","foo/BAR/test.",!0)))}),d()});
