import assert from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import product from "../../../product/common/product.js";
import {
  RemoteAuthorityResolverError,
  RemoteAuthorityResolverErrorCode
} from "../../common/remoteAuthorityResolver.js";
import { RemoteAuthorityResolverService } from "../../electron-sandbox/remoteAuthorityResolverService.js";
suite("RemoteAuthorityResolverService", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("issue #147318: RemoteAuthorityResolverError keeps the same type", async () => {
    const productService = {
      _serviceBrand: void 0,
      ...product
    };
    const service = new RemoteAuthorityResolverService(
      productService,
      void 0
    );
    const result = service.resolveAuthority("test+x");
    service._setResolvedAuthorityError(
      "test+x",
      new RemoteAuthorityResolverError(
        "something",
        RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable
      )
    );
    try {
      await result;
      assert.fail();
    } catch (err) {
      assert.strictEqual(
        RemoteAuthorityResolverError.isTemporarilyNotAvailable(err),
        true
      );
    }
    service.dispose();
  });
});
