import assert from "assert";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  FileSystemProviderCapabilities
} from "../../../files/common/files.js";
import { UriIdentityService } from "../../common/uriIdentityService.js";
suite("URI Identity", () => {
  class FakeFileService extends mock() {
    constructor(data) {
      super();
      this.data = data;
    }
    onDidChangeFileSystemProviderCapabilities = Event.None;
    onDidChangeFileSystemProviderRegistrations = Event.None;
    hasProvider(uri) {
      return this.data.has(uri.scheme);
    }
    hasCapability(uri, flag) {
      const mask = this.data.get(uri.scheme) ?? 0;
      return Boolean(mask & flag);
    }
  }
  let _service;
  setup(() => {
    _service = new UriIdentityService(
      new FakeFileService(
        /* @__PURE__ */ new Map([
          ["bar", FileSystemProviderCapabilities.PathCaseSensitive],
          ["foo", FileSystemProviderCapabilities.None]
        ])
      )
    );
  });
  teardown(() => {
    _service.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function assertCanonical(input, expected, service = _service) {
    const actual = service.asCanonicalUri(input);
    assert.strictEqual(actual.toString(), expected.toString());
    assert.ok(service.extUri.isEqual(actual, expected));
  }
  test("extUri (isEqual)", () => {
    const a = URI.parse("foo://bar/bang");
    const a1 = URI.parse("foo://bar/BANG");
    const b = URI.parse("bar://bar/bang");
    const b1 = URI.parse("bar://bar/BANG");
    assert.strictEqual(_service.extUri.isEqual(a, a1), true);
    assert.strictEqual(_service.extUri.isEqual(a1, a), true);
    assert.strictEqual(_service.extUri.isEqual(b, b1), false);
    assert.strictEqual(_service.extUri.isEqual(b1, b), false);
  });
  test("asCanonicalUri (casing)", () => {
    const a = URI.parse("foo://bar/bang");
    const a1 = URI.parse("foo://bar/BANG");
    const b = URI.parse("bar://bar/bang");
    const b1 = URI.parse("bar://bar/BANG");
    assertCanonical(a, a);
    assertCanonical(a1, a);
    assertCanonical(b, b);
    assertCanonical(b1, b1);
  });
  test("asCanonicalUri (normalization)", () => {
    const a = URI.parse("foo://bar/bang");
    assertCanonical(a, a);
    assertCanonical(URI.parse("foo://bar/./bang"), a);
    assertCanonical(URI.parse("foo://bar/./bang"), a);
    assertCanonical(URI.parse("foo://bar/./foo/../bang"), a);
  });
  test("asCanonicalUri (keep fragement)", () => {
    const a = URI.parse("foo://bar/bang");
    assertCanonical(a, a);
    assertCanonical(
      URI.parse("foo://bar/./bang#frag"),
      a.with({ fragment: "frag" })
    );
    assertCanonical(
      URI.parse("foo://bar/./bang#frag"),
      a.with({ fragment: "frag" })
    );
    assertCanonical(
      URI.parse("foo://bar/./bang#frag"),
      a.with({ fragment: "frag" })
    );
    assertCanonical(
      URI.parse("foo://bar/./foo/../bang#frag"),
      a.with({ fragment: "frag" })
    );
    const b = URI.parse("foo://bar/bazz#frag");
    assertCanonical(b, b);
    assertCanonical(URI.parse("foo://bar/bazz"), b.with({ fragment: "" }));
    assertCanonical(
      URI.parse("foo://bar/BAZZ#DDD"),
      b.with({ fragment: "DDD" })
    );
  });
  test.skip("[perf] CPU pegged after some builds #194853", () => {
    const n = 100 + 2 ** 16;
    for (let i = 0; i < n; i++) {
      const uri = URI.parse(`foo://bar/${i}`);
      const uri2 = _service.asCanonicalUri(uri);
      assert.ok(uri2);
    }
  });
});
