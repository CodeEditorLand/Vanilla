import*as h from"fs";import f from"assert";import{tmpdir as J}from"os";import{basename as j,dirname as O,join as n}from"../../../../base/common/path.js";import{Promises as l,RimRafMode as V}from"../../../../base/node/pfs.js";import{getRandomTestPath as B}from"../../../../base/test/node/testUtils.js";import{FileChangeFilter as k,FileChangeType as o}from"../../common/files.js";import"../../common/watcher.js";import{watchFileContents as K}from"../../node/watcher/nodejs/nodejsWatcherLib.js";import{isLinux as U,isMacintosh as A,isWindows as y}from"../../../../base/common/platform.js";import{getDriveLetter as R}from"../../../../base/common/extpath.js";import{ltrim as H}from"../../../../base/common/strings.js";import{DeferredPromise as C,timeout as b}from"../../../../base/common/async.js";import{CancellationTokenSource as z}from"../../../../base/common/cancellation.js";import{NodeJSWatcher as G}from"../../node/watcher/nodejs/nodejsWatcher.js";import{FileAccess as Q}from"../../../../base/common/network.js";import{extUriBiasedIgnorePathCase as X}from"../../../../base/common/resources.js";import{URI as I}from"../../../../base/common/uri.js";import{addUNCHostToAllowlist as S}from"../../../../base/node/unc.js";import{Emitter as Y,Event as p}from"../../../../base/common/event.js";import{TestParcelWatcher as Z}from"./parcelWatcher.integrationTest.js";suite.skip("File Watcher (node.js)",()=>{class N extends G{suspendedWatchRequestPollingInterval=100;_onDidWatch=this._register(new Y);onDidWatch=this._onDidWatch.event;onWatchFail=this._onDidWatchFail.event;getUpdateWatchersDelay(){return 0}async doWatch(i){await super.doWatch(i);for(const r of this.watchers)await r.instance.ready;this._onDidWatch.fire()}}let a,t,F=!1;function $(e){F=e,t?.setVerboseLogging(e)}$(!1),setup(async()=>{await T(void 0),a=I.file(B(J(),"vsctests","filewatcher")).fsPath;const e=Q.asFileUri("vs/platform/files/test/node/fixtures/service").fsPath;await l.copy(e,a,{preserveSymlinks:!1})});async function T(e){await t?.stop(),t?.dispose(),t=new N(e),t?.setVerboseLogging(F),t.onDidLogMessage(i=>{F&&console.log(`[non-recursive watcher test message] ${i.message}`)}),t.onDidError(i=>{F&&console.log(`[non-recursive watcher test error] ${i}`)})}teardown(async()=>(await t.stop(),t.dispose(),l.rm(a).catch(e=>console.error(e))));function M(e){switch(e){case o.ADDED:return"added";case o.DELETED:return"deleted";default:return"changed"}}async function c(e,i,r,s,d){F&&console.log(`Awaiting change type '${M(r)}' on file '${i}'`),await new Promise(w=>{let m=0;const P=e.onDidChangeFile(g=>{for(const D of g)if(X.isEqual(D.resource,I.file(i))&&D.type===r&&(s===null||D.cId===s)){if(m++,typeof d=="number"&&m<d)continue;P.dispose(),w();break}})})}test("basics (folder watch)",async function(){const e={path:a,excludes:[],recursive:!1};await t.watch([e]),f.strictEqual(t.isSuspended(e),!1);const i=Array.from(t.watchers)[0].instance;f.strictEqual(i.isReusingRecursiveWatcher,!1),f.strictEqual(i.failed,!1);const r=n(a,"newFile.txt");let s=c(t,r,o.ADDED);await l.writeFile(r,"Hello World"),await s;const d=n(a,"New Folder");s=c(t,d,o.ADDED),await h.promises.mkdir(d),await s;let w=n(a,"renamedFile.txt");s=Promise.all([c(t,r,o.DELETED),c(t,w,o.ADDED)]),await l.rename(r,w),await s;let m=n(a,"Renamed Folder");s=Promise.all([c(t,d,o.DELETED),c(t,m,o.ADDED)]),await l.rename(d,m),await s;const P=n(a,"RenamedFile.txt");s=Promise.all([c(t,w,o.DELETED),c(t,P,o.ADDED)]),await l.rename(w,P),await s,w=P;const g=n(a,"REnamed Folder");s=Promise.all([c(t,m,o.DELETED),c(t,g,o.ADDED)]),await l.rename(m,g),await s,m=g;const D=n(a,"movedFile.txt");s=Promise.all([c(t,w,o.DELETED),c(t,D,o.ADDED)]),await l.rename(w,D),await s;const v=n(a,"Moved Folder");s=Promise.all([c(t,m,o.DELETED),c(t,v,o.ADDED)]),await l.rename(m,v),await s;const E=n(a,"copiedFile.txt");s=c(t,E,o.ADDED),await h.promises.copyFile(D,E),await s;const x=n(a,"Copied Folder");s=c(t,x,o.ADDED),await l.copy(v,x,{preserveSymlinks:!1}),await s,s=c(t,E,o.UPDATED),await l.writeFile(E,"Hello Change"),await s;const W=n(a,"anotherNewFile.txt");s=c(t,W,o.ADDED),await l.writeFile(W,"Hello Another World"),await s,s=c(t,E,o.DELETED),await h.promises.unlink(E),await s,s=c(t,x,o.DELETED),await h.promises.rmdir(x),await s,t.dispose()}),test("basics (file watch)",async function(){const e=n(a,"lorem.txt"),i={path:e,excludes:[],recursive:!1};await t.watch([i]),f.strictEqual(t.isSuspended(i),!1);const r=Array.from(t.watchers)[0].instance;f.strictEqual(r.isReusingRecursiveWatcher,!1),f.strictEqual(r.failed,!1);let s=c(t,e,o.UPDATED);await l.writeFile(e,"Hello Change"),await s,s=c(t,e,o.DELETED),await h.promises.unlink(e),await s,await l.writeFile(e,"Hello Change"),await t.watch([]),await t.watch([{path:e,excludes:[],recursive:!1}]),s=c(t,e,o.DELETED),await l.rename(e,`${e}-moved`),await s}),test("atomic writes (folder watch)",async function(){await t.watch([{path:a,excludes:[],recursive:!1}]);const e=n(a,"lorem.txt"),i=c(t,e,o.UPDATED);await h.promises.unlink(e),l.writeFile(e,"Hello Atomic World"),await i}),test("atomic writes (file watch)",async function(){const e=n(a,"lorem.txt");await t.watch([{path:e,excludes:[],recursive:!1}]);const i=n(e),r=c(t,i,o.UPDATED);await h.promises.unlink(i),l.writeFile(i,"Hello Atomic World"),await r}),test("multiple events (folder watch)",async function(){await t.watch([{path:a,excludes:[],recursive:!1}]);const e=n(a,"newFile-1.txt"),i=n(a,"newFile-2.txt"),r=n(a,"newFile-3.txt"),s=c(t,e,o.ADDED),d=c(t,i,o.ADDED),w=c(t,r,o.ADDED);await Promise.all([await l.writeFile(e,"Hello World 1"),await l.writeFile(i,"Hello World 2"),await l.writeFile(r,"Hello World 3")]),await Promise.all([s,d,w]);const m=c(t,e,o.UPDATED),P=c(t,i,o.UPDATED),g=c(t,r,o.UPDATED);await Promise.all([await l.writeFile(e,"Hello Update 1"),await l.writeFile(i,"Hello Update 2"),await l.writeFile(r,"Hello Update 3")]),await Promise.all([m,P,g]);const D=c(t,n(a,"newFile-1-copy.txt"),o.ADDED),v=c(t,n(a,"newFile-2-copy.txt"),o.ADDED),E=c(t,n(a,"newFile-3-copy.txt"),o.ADDED);await Promise.all([l.copy(n(a,"newFile-1.txt"),n(a,"newFile-1-copy.txt"),{preserveSymlinks:!1}),l.copy(n(a,"newFile-2.txt"),n(a,"newFile-2-copy.txt"),{preserveSymlinks:!1}),l.copy(n(a,"newFile-3.txt"),n(a,"newFile-3-copy.txt"),{preserveSymlinks:!1})]),await Promise.all([D,v,E]);const x=c(t,e,o.DELETED),W=c(t,i,o.DELETED),_=c(t,r,o.DELETED);await Promise.all([await h.promises.unlink(e),await h.promises.unlink(i),await h.promises.unlink(r)]),await Promise.all([x,W,_])}),test("multiple events (file watch)",async function(){const e=n(a,"lorem.txt");await t.watch([{path:e,excludes:[],recursive:!1}]);const i=c(t,e,o.UPDATED);await Promise.all([await l.writeFile(e,"Hello Update 1"),await l.writeFile(e,"Hello Update 2"),await l.writeFile(e,"Hello Update 3")]),await Promise.all([i])}),test("excludes can be updated (folder watch)",async function(){return await t.watch([{path:a,excludes:["**"],recursive:!1}]),await t.watch([{path:a,excludes:[],recursive:!1}]),u(n(a,"files-excludes.txt"))}),test("excludes are ignored (file watch)",async function(){const e=n(a,"lorem.txt");return await t.watch([{path:e,excludes:["**"],recursive:!1}]),u(e,!0)}),test("includes can be updated (folder watch)",async function(){return await t.watch([{path:a,excludes:[],includes:["nothing"],recursive:!1}]),await t.watch([{path:a,excludes:[],recursive:!1}]),u(n(a,"files-includes.txt"))}),test("non-includes are ignored (file watch)",async function(){const e=n(a,"lorem.txt");return await t.watch([{path:e,excludes:[],includes:["nothing"],recursive:!1}]),u(e,!0)}),test("includes are supported (folder watch)",async function(){return await t.watch([{path:a,excludes:[],includes:["**/files-includes.txt"],recursive:!1}]),u(n(a,"files-includes.txt"))}),test("includes are supported (folder watch, relative pattern explicit)",async function(){return await t.watch([{path:a,excludes:[],includes:[{base:a,pattern:"files-includes.txt"}],recursive:!1}]),u(n(a,"files-includes.txt"))}),test("includes are supported (folder watch, relative pattern implicit)",async function(){return await t.watch([{path:a,excludes:[],includes:["files-includes.txt"],recursive:!1}]),u(n(a,"files-includes.txt"))}),test("correlationId is supported",async function(){const e=Math.random();return await t.watch([{correlationId:e,path:a,excludes:[],recursive:!1}]),u(n(a,"newFile.txt"),void 0,e)}),(y?test.skip:test)("symlink support (folder watch)",async function(){const e=n(a,"deep-linked"),i=n(a,"deep");return await h.promises.symlink(i,e),await t.watch([{path:e,excludes:[],recursive:!1}]),u(n(e,"newFile.txt"))});async function u(e,i,r,s,d){let w;i||(w=c(t,e,o.ADDED,r,s),await l.writeFile(e,"Hello World"),await w,d&&await p.toPromise(t.onDidWatch)),w=c(t,e,o.UPDATED,r,s),await l.writeFile(e,"Hello Change"),await w,w=c(t,e,o.DELETED,r,s),await h.promises.unlink(await l.realpath(e)),await w}(y?test.skip:test)("symlink support (file watch)",async function(){const e=n(a,"lorem.txt-linked"),i=n(a,"lorem.txt");return await h.promises.symlink(i,e),await t.watch([{path:e,excludes:[],recursive:!1}]),u(e,!0)}),(y?test:test.skip)("unc support (folder watch)",async function(){S("localhost");const e=`\\\\localhost\\${R(a)?.toLowerCase()}$\\${H(a.substr(a.indexOf(":")+1),"\\")}`;return await t.watch([{path:e,excludes:[],recursive:!1}]),u(n(e,"newFile.txt"))}),(y?test:test.skip)("unc support (file watch)",async function(){S("localhost");const e=`\\\\localhost\\${R(a)?.toLowerCase()}$\\${H(a.substr(a.indexOf(":")+1),"\\")}\\lorem.txt`;return await t.watch([{path:e,excludes:[],recursive:!1}]),u(e,!0)}),(U?test.skip:test)("wrong casing (folder watch)",async function(){const e=n(O(a),j(a).toUpperCase());return await t.watch([{path:e,excludes:[],recursive:!1}]),u(n(e,"newFile.txt"))}),(U?test.skip:test)("wrong casing (file watch)",async function(){const e=n(a,"LOREM.txt");return await t.watch([{path:e,excludes:[],recursive:!1}]),u(e,!0)}),test("invalid path does not explode",async function(){const e=n(a,"invalid");await t.watch([{path:e,excludes:[],recursive:!1}])}),test("watchFileContents",async function(){const e=n(a,"lorem.txt"),i=new z,r=new C,s=new C,d=K(e,()=>s.complete(),()=>r.complete(),i.token);return await r.p,l.writeFile(e,"Hello World"),await s.p,i.cancel(),d}),test("watching same or overlapping paths supported when correlation is applied",async function(){await t.watch([{path:a,excludes:[],recursive:!1,correlationId:1}]),await u(n(a,"newFile_1.txt"),void 0,null,1),await t.watch([{path:a,excludes:[],recursive:!1,correlationId:1},{path:a,excludes:[],recursive:!1,correlationId:2},{path:a,excludes:[],recursive:!1,correlationId:void 0}]),await u(n(a,"newFile_2.txt"),void 0,null,3),await u(n(a,"otherNewFile.txt"),void 0,null,3)}),test("watching missing path emits watcher fail event",async function(){const e=p.toPromise(t.onWatchFail),i=n(a,"missing");t.watch([{path:i,excludes:[],recursive:!0}]),await e}),test("deleting watched path emits watcher fail and delete event when correlated (file watch)",async function(){const e=n(a,"lorem.txt");await t.watch([{path:e,excludes:[],recursive:!1,correlationId:1}]);const i=Array.from(t.watchers)[0].instance,r=p.toPromise(t.onWatchFail),s=c(t,e,o.DELETED,1);h.promises.unlink(e),await r,await s,f.strictEqual(i.failed,!0)}),(A||y?test.skip:test)("deleting watched path emits watcher fail and delete event when correlated (folder watch)",async function(){const e=n(a,"deep");await t.watch([{path:e,excludes:[],recursive:!1,correlationId:1}]);const i=p.toPromise(t.onWatchFail),r=c(t,e,o.DELETED,1);l.rm(e,V.UNLINK),await i,await r}),test("correlated watch requests support suspend/resume (file, does not exist in beginning)",async function(){const e=n(a,"not-found.txt"),i=p.toPromise(t.onWatchFail),r={path:e,excludes:[],recursive:!1,correlationId:1};await t.watch([r]),await i,f.strictEqual(t.isSuspended(r),"polling"),await u(e,void 0,1,void 0,!0),await u(e,void 0,1,void 0,!0)}),test("correlated watch requests support suspend/resume (file, exists in beginning)",async function(){const e=n(a,"lorem.txt"),i={path:e,excludes:[],recursive:!1,correlationId:1};await t.watch([i]);const r=p.toPromise(t.onWatchFail);await u(e,!0,1),await r,f.strictEqual(t.isSuspended(i),"polling"),await u(e,void 0,1,void 0,!0)}),test("correlated watch requests support suspend/resume (folder, does not exist in beginning)",async function(){let e=p.toPromise(t.onWatchFail);const i=n(a,"not-found"),r={path:i,excludes:[],recursive:!1,correlationId:1};await t.watch([r]),await e,f.strictEqual(t.isSuspended(r),"polling");let s=c(t,i,o.ADDED,1),d=p.toPromise(t.onDidWatch);await h.promises.mkdir(i),await s,await d,f.strictEqual(t.isSuspended(r),!1);const w=n(i,"newFile.txt");await u(w,void 0,1),A||(e=p.toPromise(t.onWatchFail),await h.promises.rmdir(i),await e,s=c(t,i,o.ADDED,1),d=p.toPromise(t.onDidWatch),await h.promises.mkdir(i),await s,await d,await b(500),await u(w,void 0,1))}),(A?test.skip:test)("correlated watch requests support suspend/resume (folder, exists in beginning)",async function(){const e=n(a,"deep");await t.watch([{path:e,excludes:[],recursive:!1,correlationId:1}]);const i=n(e,"newFile.txt");await u(i,void 0,1);const r=p.toPromise(t.onWatchFail);await l.rm(e),await r;const s=c(t,e,o.ADDED,1),d=p.toPromise(t.onDidWatch);await h.promises.mkdir(e),await s,await d,await b(500),await u(i,void 0,1)}),test("parcel watcher reused when present for non-recursive file watching (uncorrelated)",function(){return L(void 0)}),test("parcel watcher reused when present for non-recursive file watching (correlated)",function(){return L(2)});function q(){const e=new Z;return e.setVerboseLogging(F),e.onDidLogMessage(i=>{F&&console.log(`[recursive watcher test message] ${i.message}`)}),e.onDidError(i=>{F&&console.log(`[recursive watcher test error] ${i.error}`)}),e}async function L(e){const i=q();await i.watch([{path:a,excludes:[],recursive:!0,correlationId:1}]);const r=Array.from(i.watchers)[0];f.strictEqual(r.subscriptionsCount,0),await T(i);const s=n(a,"deep","conway.js");await t.watch([{path:s,excludes:[],recursive:!1,correlationId:e}]);const{instance:d}=Array.from(t.watchers)[0];f.strictEqual(d.isReusingRecursiveWatcher,!0),f.strictEqual(r.subscriptionsCount,1);let w=c(t,s,A?o.ADDED:o.UPDATED,e);await l.writeFile(s,"Hello World"),await w,await i.stop(),i.dispose(),await b(500),w=c(t,s,o.UPDATED,e),await l.writeFile(s,"Hello World"),await w,f.strictEqual(d.isReusingRecursiveWatcher,!1)}test("correlated watch requests support suspend/resume (file, does not exist in beginning, parcel watcher reused)",async function(){const e=q();await e.watch([{path:a,excludes:[],recursive:!0}]),await T(e);const i=n(a,"not-found-2.txt"),r=p.toPromise(t.onWatchFail),s={path:i,excludes:[],recursive:!1,correlationId:1};await t.watch([s]),await r,f.strictEqual(t.isSuspended(s),!0);const d=c(t,i,o.ADDED,1);await l.writeFile(i,"Hello World"),await d,f.strictEqual(t.isSuspended(s),!1)}),test("event type filter (file watch)",async function(){const e=n(a,"lorem.txt"),i={path:e,excludes:[],recursive:!1,filter:k.UPDATED|k.DELETED,correlationId:1};await t.watch([i]);let r=c(t,e,o.UPDATED,1);await l.writeFile(e,"Hello Change"),await r,r=c(t,e,o.DELETED,1),await h.promises.unlink(e),await r}),test("event type filter (folder watch)",async function(){const e={path:a,excludes:[],recursive:!1,filter:k.UPDATED|k.DELETED,correlationId:1};await t.watch([e]);const i=n(a,"lorem.txt");let r=c(t,i,o.UPDATED,1);await l.writeFile(i,"Hello Change"),await r,r=c(t,i,o.DELETED,1),await h.promises.unlink(i),await r})});
