import assert from "assert";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import {
  Disposable,
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { ExternalUriOpenerPriority } from "../../../../../editor/common/languages.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { TestInstantiationService } from "../../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import {
  IQuickInputService
} from "../../../../../platform/quickinput/common/quickInput.js";
import {
  ExternalUriOpenerService
} from "../../common/externalUriOpenerService.js";
class MockQuickInputService {
  constructor(pickIndex) {
    this.pickIndex = pickIndex;
  }
  async pick(picks, options, token) {
    const resolvedPicks = await picks;
    const item = resolvedPicks[this.pickIndex];
    if (item.type === "separator") {
      return void 0;
    }
    return item;
  }
}
suite("ExternalUriOpenerService", () => {
  let disposables;
  let instantiationService;
  setup(() => {
    disposables = new DisposableStore();
    instantiationService = disposables.add(new TestInstantiationService());
    instantiationService.stub(
      IConfigurationService,
      new TestConfigurationService()
    );
    instantiationService.stub(IOpenerService, {
      registerExternalOpener: () => {
        return Disposable.None;
      }
    });
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  test("Should not open if there are no openers", async () => {
    const externalUriOpenerService = disposables.add(
      instantiationService.createInstance(ExternalUriOpenerService)
    );
    externalUriOpenerService.registerExternalOpenerProvider(
      new class {
        async *getOpeners(_targetUri) {
        }
      }()
    );
    const uri = URI.parse("http://contoso.com");
    const didOpen = await externalUriOpenerService.openExternal(
      uri.toString(),
      { sourceUri: uri },
      CancellationToken.None
    );
    assert.strictEqual(didOpen, false);
  });
  test("Should prompt if there is at least one enabled opener", async () => {
    instantiationService.stub(
      IQuickInputService,
      new MockQuickInputService(0)
    );
    const externalUriOpenerService = disposables.add(
      instantiationService.createInstance(ExternalUriOpenerService)
    );
    let openedWithEnabled = false;
    externalUriOpenerService.registerExternalOpenerProvider(
      new class {
        async *getOpeners(_targetUri) {
          yield {
            id: "disabled-id",
            label: "disabled",
            canOpen: async () => ExternalUriOpenerPriority.None,
            openExternalUri: async () => true
          };
          yield {
            id: "enabled-id",
            label: "enabled",
            canOpen: async () => ExternalUriOpenerPriority.Default,
            openExternalUri: async () => {
              openedWithEnabled = true;
              return true;
            }
          };
        }
      }()
    );
    const uri = URI.parse("http://contoso.com");
    const didOpen = await externalUriOpenerService.openExternal(
      uri.toString(),
      { sourceUri: uri },
      CancellationToken.None
    );
    assert.strictEqual(didOpen, true);
    assert.strictEqual(openedWithEnabled, true);
  });
  test("Should automatically pick single preferred opener without prompt", async () => {
    const externalUriOpenerService = disposables.add(
      instantiationService.createInstance(ExternalUriOpenerService)
    );
    let openedWithPreferred = false;
    externalUriOpenerService.registerExternalOpenerProvider(
      new class {
        async *getOpeners(_targetUri) {
          yield {
            id: "other-id",
            label: "other",
            canOpen: async () => ExternalUriOpenerPriority.Default,
            openExternalUri: async () => {
              return true;
            }
          };
          yield {
            id: "preferred-id",
            label: "preferred",
            canOpen: async () => ExternalUriOpenerPriority.Preferred,
            openExternalUri: async () => {
              openedWithPreferred = true;
              return true;
            }
          };
        }
      }()
    );
    const uri = URI.parse("http://contoso.com");
    const didOpen = await externalUriOpenerService.openExternal(
      uri.toString(),
      { sourceUri: uri },
      CancellationToken.None
    );
    assert.strictEqual(didOpen, true);
    assert.strictEqual(openedWithPreferred, true);
  });
});
