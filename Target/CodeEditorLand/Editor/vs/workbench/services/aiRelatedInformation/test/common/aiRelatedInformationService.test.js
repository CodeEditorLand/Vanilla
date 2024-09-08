import assert from "assert";
import * as sinon from "sinon";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { NullLogService } from "../../../../../platform/log/common/log.js";
import {
  RelatedInformationType
} from "../../common/aiRelatedInformation.js";
import { AiRelatedInformationService } from "../../common/aiRelatedInformationService.js";
suite("AiRelatedInformationService", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let service;
  setup(() => {
    service = new AiRelatedInformationService(
      store.add(new NullLogService())
    );
  });
  test("should check if providers are registered", () => {
    assert.equal(service.isEnabled(), false);
    store.add(
      service.registerAiRelatedInformationProvider(
        RelatedInformationType.CommandInformation,
        { provideAiRelatedInformation: () => Promise.resolve([]) }
      )
    );
    assert.equal(service.isEnabled(), true);
  });
  test("should register and unregister providers", () => {
    const provider = {
      provideAiRelatedInformation: () => Promise.resolve([])
    };
    const disposable = service.registerAiRelatedInformationProvider(
      RelatedInformationType.CommandInformation,
      provider
    );
    assert.strictEqual(service.isEnabled(), true);
    disposable.dispose();
    assert.strictEqual(service.isEnabled(), false);
  });
  test("should get related information", async () => {
    const command = "command";
    const provider = {
      provideAiRelatedInformation: () => Promise.resolve([
        {
          type: RelatedInformationType.CommandInformation,
          command,
          weight: 1
        }
      ])
    };
    service.registerAiRelatedInformationProvider(
      RelatedInformationType.CommandInformation,
      provider
    );
    const result = await service.getRelatedInformation(
      "query",
      [RelatedInformationType.CommandInformation],
      CancellationToken.None
    );
    assert.strictEqual(result.length, 1);
    assert.strictEqual(
      result[0].command,
      command
    );
  });
  test("should get different types of related information", async () => {
    const command = "command";
    const commandProvider = {
      provideAiRelatedInformation: () => Promise.resolve([
        {
          type: RelatedInformationType.CommandInformation,
          command,
          weight: 1
        }
      ])
    };
    service.registerAiRelatedInformationProvider(
      RelatedInformationType.CommandInformation,
      commandProvider
    );
    const setting = "setting";
    const settingProvider = {
      provideAiRelatedInformation: () => Promise.resolve([
        {
          type: RelatedInformationType.SettingInformation,
          setting,
          weight: 1
        }
      ])
    };
    service.registerAiRelatedInformationProvider(
      RelatedInformationType.SettingInformation,
      settingProvider
    );
    const result = await service.getRelatedInformation(
      "query",
      [
        RelatedInformationType.CommandInformation,
        RelatedInformationType.SettingInformation
      ],
      CancellationToken.None
    );
    assert.strictEqual(result.length, 2);
    assert.strictEqual(
      result[0].command,
      command
    );
    assert.strictEqual(
      result[1].setting,
      setting
    );
  });
  test("should return empty array on timeout", async () => {
    const clock = sinon.useFakeTimers({
      shouldAdvanceTime: true
    });
    const provider = {
      provideAiRelatedInformation: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              type: RelatedInformationType.CommandInformation,
              command: "command",
              weight: 1
            }
          ]);
        }, AiRelatedInformationService.DEFAULT_TIMEOUT + 100);
      })
    };
    service.registerAiRelatedInformationProvider(
      RelatedInformationType.CommandInformation,
      provider
    );
    try {
      const promise = service.getRelatedInformation(
        "query",
        [RelatedInformationType.CommandInformation],
        CancellationToken.None
      );
      clock.tick(AiRelatedInformationService.DEFAULT_TIMEOUT + 200);
      const result = await promise;
      assert.strictEqual(result.length, 0);
    } finally {
      clock.restore();
    }
  });
});
