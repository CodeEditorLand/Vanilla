import assert from "assert";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  extractLocalHostUriMetaDataForPortMapping,
  extractQueryLocalHostUriMetaDataForPortMapping
} from "../../common/tunnel.js";
suite("Tunnel", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function portMappingDoTest(uri, func, expectedAddress, expectedPort) {
    const res = func(URI.parse(uri));
    assert.strictEqual(!expectedAddress, !res);
    assert.strictEqual(res?.address, expectedAddress);
    assert.strictEqual(res?.port, expectedPort);
  }
  function portMappingTest(uri, expectedAddress, expectedPort) {
    portMappingDoTest(
      uri,
      extractLocalHostUriMetaDataForPortMapping,
      expectedAddress,
      expectedPort
    );
  }
  function portMappingTestQuery(uri, expectedAddress, expectedPort) {
    portMappingDoTest(
      uri,
      extractQueryLocalHostUriMetaDataForPortMapping,
      expectedAddress,
      expectedPort
    );
  }
  test("portMapping", () => {
    portMappingTest("file:///foo.bar/baz");
    portMappingTest("http://foo.bar:1234");
    portMappingTest("http://localhost:8080", "localhost", 8080);
    portMappingTest("https://localhost:443", "localhost", 443);
    portMappingTest("http://127.0.0.1:3456", "127.0.0.1", 3456);
    portMappingTest("http://0.0.0.0:7654", "0.0.0.0", 7654);
    portMappingTest(
      "http://localhost:8080/path?foo=bar",
      "localhost",
      8080
    );
    portMappingTest(
      "http://localhost:8080/path?foo=http%3A%2F%2Flocalhost%3A8081",
      "localhost",
      8080
    );
    portMappingTestQuery(
      "http://foo.bar/path?url=http%3A%2F%2Flocalhost%3A8081",
      "localhost",
      8081
    );
    portMappingTestQuery(
      "http://foo.bar/path?url=http%3A%2F%2Flocalhost%3A8081&url2=http%3A%2F%2Flocalhost%3A8082",
      "localhost",
      8081
    );
    portMappingTestQuery(
      "http://foo.bar/path?url=http%3A%2F%2Fmicrosoft.com%2Fbad&url2=http%3A%2F%2Flocalhost%3A8081",
      "localhost",
      8081
    );
  });
});
