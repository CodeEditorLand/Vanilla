import assert from "assert";
import { FileAccess, Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { FileService } from "../../../files/common/fileService.js";
import { DiskFileSystemProvider } from "../../../files/node/diskFileSystemProvider.js";
import { NullLogService } from "../../../log/common/log.js";
import { ChecksumService } from "../../node/checksumService.js";
suite("Checksum Service", () => {
  let diskFileSystemProvider;
  let fileService;
  setup(() => {
    const logService = new NullLogService();
    fileService = new FileService(logService);
    diskFileSystemProvider = new DiskFileSystemProvider(logService);
    fileService.registerProvider(Schemas.file, diskFileSystemProvider);
  });
  teardown(() => {
    diskFileSystemProvider.dispose();
    fileService.dispose();
  });
  test("checksum", async () => {
    const checksumService = new ChecksumService(fileService);
    const checksum = await checksumService.checksum(
      URI.file(
        FileAccess.asFileUri(
          "vs/platform/checksum/test/node/fixtures/lorem.txt"
        ).fsPath
      )
    );
    assert.ok(
      checksum === "d/9bMU0ydNCmc/hg8ItWeiLT/ePnf7gyPRQVGpd6tRI" || checksum === "eJeeTIS0dzi8MZY+nHhjPBVtNbmGqxfVvgEOB4sqVIc"
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
