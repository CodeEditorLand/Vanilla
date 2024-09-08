import { VSBuffer } from "../../../../../base/common/buffer.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { join } from "../../../../../base/common/path.js";
import { isWeb } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { FileService } from "../../../../../platform/files/common/fileService.js";
import {
  IFileService
} from "../../../../../platform/files/common/files.js";
import { ServiceCollection } from "../../../../../platform/instantiation/common/serviceCollection.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import { UriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentityService.js";
import {
  TestBrowserTextFileServiceWithEncodingOverrides,
  TestInMemoryFileSystemProvider,
  workbenchInstantiationService
} from "../../../../test/browser/workbenchTestServices.js";
import {
  IWorkingCopyFileService,
  WorkingCopyFileService
} from "../../../workingCopy/common/workingCopyFileService.js";
import { WorkingCopyService } from "../../../workingCopy/common/workingCopyService.js";
import {
  detectEncodingByBOMFromBuffer,
  toCanonicalName
} from "../../common/encoding.js";
import files from "../common/fixtures/files.js";
import createSuite from "../common/textFileService.io.test.js";
if (isWeb) {
  suite("Files - BrowserTextFileService i/o", () => {
    const disposables = new DisposableStore();
    let service;
    let fileProvider;
    const testDir = "test";
    createSuite({
      setup: async () => {
        const instantiationService = workbenchInstantiationService(
          void 0,
          disposables
        );
        const logService = new NullLogService();
        const fileService = disposables.add(
          new FileService(logService)
        );
        fileProvider = disposables.add(
          new TestInMemoryFileSystemProvider()
        );
        disposables.add(
          fileService.registerProvider(Schemas.file, fileProvider)
        );
        const collection = new ServiceCollection();
        collection.set(IFileService, fileService);
        collection.set(
          IWorkingCopyFileService,
          disposables.add(
            new WorkingCopyFileService(
              fileService,
              disposables.add(new WorkingCopyService()),
              instantiationService,
              disposables.add(
                new UriIdentityService(fileService)
              )
            )
          )
        );
        service = disposables.add(
          instantiationService.createChild(collection).createInstance(
            TestBrowserTextFileServiceWithEncodingOverrides
          )
        );
        disposables.add(service.files);
        await fileProvider.mkdir(URI.file(testDir));
        for (const fileName in files) {
          await fileProvider.writeFile(
            URI.file(join(testDir, fileName)),
            files[fileName],
            {
              create: true,
              overwrite: false,
              unlock: false,
              atomic: false
            }
          );
        }
        return { service, testDir };
      },
      teardown: async () => {
        disposables.clear();
      },
      exists,
      stat,
      readFile,
      detectEncodingByBOM
    });
    async function exists(fsPath) {
      try {
        await fileProvider.readFile(URI.file(fsPath));
        return true;
      } catch (e) {
        return false;
      }
    }
    async function readFile(fsPath, encoding) {
      const file = await fileProvider.readFile(URI.file(fsPath));
      if (!encoding) {
        return VSBuffer.wrap(file);
      }
      return new TextDecoder(toCanonicalName(encoding)).decode(file);
    }
    async function stat(fsPath) {
      return fileProvider.stat(URI.file(fsPath));
    }
    async function detectEncodingByBOM(fsPath) {
      try {
        const buffer = await readFile(fsPath);
        return detectEncodingByBOMFromBuffer(buffer.slice(0, 3), 3);
      } catch (error) {
        return null;
      }
    }
    ensureNoDisposablesAreLeakedInTestSuite();
  });
}
