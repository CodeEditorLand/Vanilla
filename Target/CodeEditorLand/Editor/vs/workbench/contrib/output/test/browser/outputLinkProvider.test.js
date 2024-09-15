var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { URI } from "../../../../../base/common/uri.js";
import { isMacintosh, isLinux, isWindows } from "../../../../../base/common/platform.js";
import { OutputLinkComputer } from "../../common/outputLinkComputer.js";
import { TestContextService } from "../../../../test/common/workbenchTestServices.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
suite("OutputLinkProvider", () => {
  function toOSPath(p) {
    if (isMacintosh || isLinux) {
      return p.replace(/\\/g, "/");
    }
    return p;
  }
  __name(toOSPath, "toOSPath");
  test("OutputLinkProvider - Link detection", function() {
    const rootFolder = isWindows ? URI.file("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala") : URI.file("C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala");
    const patterns = OutputLinkComputer.createPatterns(rootFolder);
    const contextService = new TestContextService();
    let line = toOSPath("Foo bar");
    let result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 0);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString());
    assert.strictEqual(result[0].range.startColumn, 5);
    assert.strictEqual(result[0].range.endColumn, 84);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336 in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#336");
    assert.strictEqual(result[0].range.startColumn, 5);
    assert.strictEqual(result[0].range.endColumn, 88);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9 in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#336,9");
    assert.strictEqual(result[0].range.startColumn, 5);
    assert.strictEqual(result[0].range.endColumn, 90);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9 in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#336,9");
    assert.strictEqual(result[0].range.startColumn, 5);
    assert.strictEqual(result[0].range.endColumn, 90);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts>dir in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString());
    assert.strictEqual(result[0].range.startColumn, 5);
    assert.strictEqual(result[0].range.endColumn, 84);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9] in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#336,9");
    assert.strictEqual(result[0].range.startColumn, 5);
    assert.strictEqual(result[0].range.endColumn, 90);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts] in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts]").toString());
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on line 8");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#8");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 90);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on line 8, column 13");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#8,13");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 101);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on LINE 8, COLUMN 13");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#8,13");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 101);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:line 8");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#8");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 87);
    line = toOSPath(" at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts)");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString());
    assert.strictEqual(result[0].range.startColumn, 15);
    assert.strictEqual(result[0].range.endColumn, 94);
    line = toOSPath(" at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278)");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#278");
    assert.strictEqual(result[0].range.startColumn, 15);
    assert.strictEqual(result[0].range.endColumn, 98);
    line = toOSPath(" at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#278,34");
    assert.strictEqual(result[0].range.startColumn, 15);
    assert.strictEqual(result[0].range.endColumn, 101);
    line = toOSPath(" at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString() + "#278,34");
    assert.strictEqual(result[0].range.startColumn, 15);
    assert.strictEqual(result[0].range.endColumn, 101);
    line = toOSPath("C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 102);
    line = toOSPath("C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 103);
    line = toOSPath("C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 105);
    line = toOSPath("C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 105);
    line = toOSPath("C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 106);
    line = toOSPath("C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 106);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 102);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 103);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 105);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 105);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 106);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 106);
    line = toOSPath("C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features Special.ts (45,18): error");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/lib/something/Features Special.ts").toString() + "#45,18");
    assert.strictEqual(result[0].range.startColumn, 1);
    assert.strictEqual(result[0].range.endColumn, 114);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts. in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString());
    assert.strictEqual(result[0].range.startColumn, 5);
    assert.strictEqual(result[0].range.endColumn, 84);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    line = toOSPath(" at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game\\ in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    line = toOSPath(' at "C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts" in');
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString());
    assert.strictEqual(result[0].range.startColumn, 6);
    assert.strictEqual(result[0].range.endColumn, 85);
    line = toOSPath(" at 'C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts' in");
    result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].url, contextService.toResource("/Game.ts").toString());
    assert.strictEqual(result[0].range.startColumn, 6);
    assert.strictEqual(result[0].range.endColumn, 85);
  });
  test("OutputLinkProvider - #106847", function() {
    const rootFolder = isWindows ? URI.file("C:\\Users\\username\\Desktop\\test-ts") : URI.file("C:/Users/username/Desktop");
    const patterns = OutputLinkComputer.createPatterns(rootFolder);
    const contextService = new TestContextService();
    const line = toOSPath("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa C:\\Users\\username\\Desktop\\test-ts\\prj.conf C:\\Users\\username\\Desktop\\test-ts\\prj.conf C:\\Users\\username\\Desktop\\test-ts\\prj.conf");
    const result = OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
    assert.strictEqual(result.length, 3);
    for (const res of result) {
      assert.ok(res.range.startColumn > 0 && res.range.endColumn > 0);
    }
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=outputLinkProvider.test.js.map
