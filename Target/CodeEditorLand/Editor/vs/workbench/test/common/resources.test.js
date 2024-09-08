import assert from "assert";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../base/test/common/utils.js";
import { TestConfigurationService } from "../../../platform/configuration/test/common/testConfigurationService.js";
import { ResourceGlobMatcher } from "../../common/resources.js";
import { TestContextService } from "./workbenchTestServices.js";
suite("ResourceGlobMatcher", () => {
  const SETTING = "test.matcher";
  let contextService;
  let configurationService;
  const disposables = new DisposableStore();
  setup(() => {
    contextService = new TestContextService();
    configurationService = new TestConfigurationService({
      [SETTING]: {
        "**/*.md": true,
        "**/*.txt": false
      }
    });
  });
  teardown(() => {
    disposables.clear();
  });
  test("Basics", async () => {
    const matcher = disposables.add(
      new ResourceGlobMatcher(
        () => configurationService.getValue(SETTING),
        (e) => e.affectsConfiguration(SETTING),
        contextService,
        configurationService
      )
    );
    assert.equal(matcher.matches(URI.file("/foo/bar")), false);
    assert.equal(matcher.matches(URI.file("/foo/bar.md")), true);
    assert.equal(matcher.matches(URI.file("/foo/bar.txt")), false);
    let eventCounter = 0;
    disposables.add(matcher.onExpressionChange(() => eventCounter++));
    await configurationService.setUserConfiguration(SETTING, {
      "**/*.foo": true
    });
    configurationService.onDidChangeConfigurationEmitter.fire({
      affectsConfiguration: (key) => key === SETTING
    });
    assert.equal(eventCounter, 1);
    assert.equal(matcher.matches(URI.file("/foo/bar.md")), false);
    assert.equal(matcher.matches(URI.file("/foo/bar.foo")), true);
    await configurationService.setUserConfiguration(SETTING, void 0);
    configurationService.onDidChangeConfigurationEmitter.fire({
      affectsConfiguration: (key) => key === SETTING
    });
    assert.equal(eventCounter, 2);
    assert.equal(matcher.matches(URI.file("/foo/bar.md")), false);
    assert.equal(matcher.matches(URI.file("/foo/bar.foo")), false);
    await configurationService.setUserConfiguration(SETTING, {
      "**/*.md": true,
      "**/*.txt": false,
      "C:/bar/**": true,
      "/bar/**": true
    });
    configurationService.onDidChangeConfigurationEmitter.fire({
      affectsConfiguration: (key) => key === SETTING
    });
    assert.equal(matcher.matches(URI.file("/bar/foo.1")), true);
    assert.equal(matcher.matches(URI.file("C:/bar/foo.1")), true);
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
