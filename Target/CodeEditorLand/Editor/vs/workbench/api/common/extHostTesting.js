var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { RunOnceScheduler } from "../../../base/common/async.js";
import { VSBuffer } from "../../../base/common/buffer.js";
import {
  CancellationToken,
  CancellationTokenSource
} from "../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../base/common/event.js";
import { createSingleCallFunction } from "../../../base/common/functional.js";
import { hash } from "../../../base/common/hash.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../base/common/lifecycle.js";
import { MarshalledId } from "../../../base/common/marshallingIds.js";
import { isDefined } from "../../../base/common/types.js";
import { URI } from "../../../base/common/uri.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../platform/log/common/log.js";
import { TestCommandId } from "../../contrib/testing/common/constants.js";
import { TestId, TestPosition } from "../../contrib/testing/common/testId.js";
import { InvalidTestItemError } from "../../contrib/testing/common/testItemCollection.js";
import {
  AbstractIncrementalTestCollection,
  TestControllerCapability,
  TestResultState,
  TestRunProfileBitset,
  TestsDiffOp,
  isStartControllerTests
} from "../../contrib/testing/common/testTypes.js";
import { checkProposedApiEnabled } from "../../services/extensions/common/extensions.js";
import {
  MainContext
} from "./extHost.protocol.js";
import { IExtHostCommands } from "./extHostCommands.js";
import { IExtHostDocumentsAndEditors } from "./extHostDocumentsAndEditors.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import {
  ExtHostTestItemCollection,
  TestItemImpl,
  TestItemRootImpl,
  toItemFromContext
} from "./extHostTestItem.js";
import * as Convert from "./extHostTypeConverters.js";
import {
  FileCoverage,
  TestRunProfileKind,
  TestRunRequest
} from "./extHostTypes.js";
let followupCounter = 0;
const testResultInternalIDs = /* @__PURE__ */ new WeakMap();
const IExtHostTesting = createDecorator("IExtHostTesting");
let ExtHostTesting = class extends Disposable {
  constructor(rpc, logService, commands, editors) {
    super();
    this.logService = logService;
    this.commands = commands;
    this.editors = editors;
    this.proxy = rpc.getProxy(MainContext.MainThreadTesting);
    this.observer = new TestObservers(this.proxy);
    this.runTracker = new TestRunCoordinator(this.proxy, logService);
    commands.registerArgumentProcessor({
      processArgument: /* @__PURE__ */ __name((arg) => {
        switch (arg?.$mid) {
          case MarshalledId.TestItemContext: {
            const cast = arg;
            const targetTest = cast.tests[cast.tests.length - 1].item.extId;
            const controller = this.controllers.get(TestId.root(targetTest));
            return controller?.collection.tree.get(targetTest)?.actual ?? toItemFromContext(arg);
          }
          case MarshalledId.TestMessageMenuArgs: {
            const { test, message } = arg;
            const extId = test.item.extId;
            return {
              test: this.controllers.get(TestId.root(extId))?.collection.tree.get(extId)?.actual ?? toItemFromContext({ $mid: MarshalledId.TestItemContext, tests: [test] }),
              message: Convert.TestMessage.to(message)
            };
          }
          default:
            return arg;
        }
      }, "processArgument")
    });
    commands.registerCommand(false, "testing.getExplorerSelection", async () => {
      const inner = await commands.executeCommand(TestCommandId.GetExplorerSelection);
      const lookup = /* @__PURE__ */ __name((i) => {
        const controller = this.controllers.get(TestId.root(i));
        if (!controller) {
          return void 0;
        }
        return TestId.isRoot(i) ? controller.controller : controller.collection.tree.get(i)?.actual;
      }, "lookup");
      return {
        include: inner?.include.map(lookup).filter(isDefined) || [],
        exclude: inner?.exclude.map(lookup).filter(isDefined) || []
      };
    });
  }
  static {
    __name(this, "ExtHostTesting");
  }
  resultsChangedEmitter = this._register(
    new Emitter()
  );
  controllers = /* @__PURE__ */ new Map();
  proxy;
  runTracker;
  observer;
  defaultProfilesChangedEmitter = this._register(
    new Emitter()
  );
  followupProviders = /* @__PURE__ */ new Set();
  testFollowups = /* @__PURE__ */ new Map();
  onResultsChanged = this.resultsChangedEmitter.event;
  results = [];
  //#region public API
  /**
   * Implements vscode.test.registerTestProvider
   */
  createTestController(extension, controllerId, label, refreshHandler) {
    if (this.controllers.has(controllerId)) {
      throw new Error(
        `Attempt to insert a duplicate controller with ID "${controllerId}"`
      );
    }
    const disposable = new DisposableStore();
    const collection = disposable.add(
      new ExtHostTestItemCollection(controllerId, label, this.editors)
    );
    collection.root.label = label;
    const profiles = /* @__PURE__ */ new Map();
    const activeProfiles = /* @__PURE__ */ new Set();
    const proxy = this.proxy;
    const getCapability = /* @__PURE__ */ __name(() => {
      let cap = 0;
      if (refreshHandler) {
        cap |= TestControllerCapability.Refresh;
      }
      const rcp = info.relatedCodeProvider;
      if (rcp) {
        if (rcp?.provideRelatedTests) {
          cap |= TestControllerCapability.TestRelatedToCode;
        }
        if (rcp?.provideRelatedCode) {
          cap |= TestControllerCapability.CodeRelatedToTest;
        }
      }
      return cap;
    }, "getCapability");
    const controller = {
      items: collection.root.children,
      get label() {
        return label;
      },
      set label(value) {
        label = value;
        collection.root.label = value;
        proxy.$updateController(controllerId, { label });
      },
      get refreshHandler() {
        return refreshHandler;
      },
      set refreshHandler(value) {
        refreshHandler = value;
        proxy.$updateController(controllerId, {
          capabilities: getCapability()
        });
      },
      get id() {
        return controllerId;
      },
      get relatedCodeProvider() {
        return info.relatedCodeProvider;
      },
      set relatedCodeProvider(value) {
        checkProposedApiEnabled(extension, "testRelatedCode");
        info.relatedCodeProvider = value;
        proxy.$updateController(controllerId, {
          capabilities: getCapability()
        });
      },
      createRunProfile: /* @__PURE__ */ __name((label2, group, runHandler, isDefault, tag, supportsContinuousRun) => {
        let profileId = hash(label2);
        while (profiles.has(profileId)) {
          profileId++;
        }
        return new TestRunProfileImpl(
          this.proxy,
          profiles,
          activeProfiles,
          this.defaultProfilesChangedEmitter.event,
          controllerId,
          profileId,
          label2,
          group,
          runHandler,
          isDefault,
          tag,
          supportsContinuousRun
        );
      }, "createRunProfile"),
      createTestItem(id, label2, uri) {
        return new TestItemImpl(controllerId, id, label2, uri);
      },
      createTestRun: /* @__PURE__ */ __name((request, name, persist = true) => {
        return this.runTracker.createTestRun(
          extension,
          controllerId,
          collection,
          request,
          name,
          persist
        );
      }, "createTestRun"),
      invalidateTestResults: /* @__PURE__ */ __name((items) => {
        if (items === void 0) {
          this.proxy.$markTestRetired(void 0);
        } else {
          const itemsArr = items instanceof Array ? items : [items];
          this.proxy.$markTestRetired(
            itemsArr.map(
              (i) => TestId.fromExtHostTestItem(
                i,
                controllerId
              ).toString()
            )
          );
        }
      }, "invalidateTestResults"),
      set resolveHandler(fn) {
        collection.resolveHandler = fn;
      },
      get resolveHandler() {
        return collection.resolveHandler;
      },
      dispose: /* @__PURE__ */ __name(() => {
        disposable.dispose();
      }, "dispose")
    };
    const info = {
      controller,
      collection,
      profiles,
      extension,
      activeProfiles
    };
    proxy.$registerTestController(controllerId, label, getCapability());
    disposable.add(
      toDisposable(() => proxy.$unregisterTestController(controllerId))
    );
    this.controllers.set(controllerId, info);
    disposable.add(
      toDisposable(() => this.controllers.delete(controllerId))
    );
    disposable.add(
      collection.onDidGenerateDiff(
        (diff) => proxy.$publishDiff(
          controllerId,
          diff.map(TestsDiffOp.serialize)
        )
      )
    );
    return controller;
  }
  /**
   * Implements vscode.test.createTestObserver
   */
  createTestObserver() {
    return this.observer.checkout();
  }
  /**
   * Implements vscode.test.runTests
   */
  async runTests(req, token = CancellationToken.None) {
    const profile = tryGetProfileFromTestRunReq(req);
    if (!profile) {
      throw new Error(
        "The request passed to `vscode.test.runTests` must include a profile"
      );
    }
    const controller = this.controllers.get(profile.controllerId);
    if (!controller) {
      throw new Error("Controller not found");
    }
    await this.proxy.$runTests(
      {
        preserveFocus: req.preserveFocus ?? true,
        group: profileGroupToBitset[profile.kind],
        targets: [
          {
            testIds: req.include?.map(
              (t) => TestId.fromExtHostTestItem(
                t,
                controller.collection.root.id
              ).toString()
            ) ?? [controller.collection.root.id],
            profileId: profile.profileId,
            controllerId: profile.controllerId
          }
        ],
        exclude: req.exclude?.map((t) => t.id)
      },
      token
    );
  }
  /**
   * Implements vscode.test.registerTestFollowupProvider
   */
  registerTestFollowupProvider(provider) {
    this.followupProviders.add(provider);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        this.followupProviders.delete(provider);
      }, "dispose")
    };
  }
  //#endregion
  //#region RPC methods
  /**
   * @inheritdoc
   */
  async $getTestsRelatedToCode(uri, _position, token) {
    const doc = this.editors.getDocument(URI.revive(uri));
    if (!doc) {
      return [];
    }
    const position = Convert.Position.to(_position);
    const related = [];
    await Promise.all(
      [...this.controllers.values()].map(async (c) => {
        let tests;
        try {
          tests = await c.relatedCodeProvider?.provideRelatedTests?.(
            doc.document,
            position,
            token
          );
        } catch (e) {
          if (!token.isCancellationRequested) {
            this.logService.warn(
              `Error thrown while providing related tests for ${c.controller.label}`,
              e
            );
          }
        }
        if (tests) {
          for (const test of tests) {
            related.push(
              TestId.fromExtHostTestItem(
                test,
                c.controller.id
              ).toString()
            );
          }
          c.collection.flushDiff();
        }
      })
    );
    return related;
  }
  /**
   * @inheritdoc
   */
  async $getCodeRelatedToTest(testId, token) {
    const controller = this.controllers.get(TestId.root(testId));
    if (!controller) {
      return [];
    }
    const test = controller.collection.tree.get(testId);
    if (!test) {
      return [];
    }
    const locations = await controller.relatedCodeProvider?.provideRelatedCode?.(
      test.actual,
      token
    );
    return locations?.map(Convert.location.from) ?? [];
  }
  /**
   * @inheritdoc
   */
  $syncTests() {
    for (const { collection } of this.controllers.values()) {
      collection.flushDiff();
    }
    return Promise.resolve();
  }
  /**
   * @inheritdoc
   */
  async $getCoverageDetails(coverageId, testId, token) {
    const details = await this.runTracker.getCoverageDetails(
      coverageId,
      testId,
      token
    );
    return details?.map(Convert.TestCoverage.fromDetails);
  }
  /**
   * @inheritdoc
   */
  async $disposeRun(runId) {
    this.runTracker.disposeTestRun(runId);
  }
  /** @inheritdoc */
  $configureRunProfile(controllerId, profileId) {
    this.controllers.get(controllerId)?.profiles.get(profileId)?.configureHandler?.();
  }
  /** @inheritdoc */
  $setDefaultRunProfiles(profiles) {
    const evt = /* @__PURE__ */ new Map();
    for (const [controllerId, profileIds] of Object.entries(profiles)) {
      const ctrl = this.controllers.get(controllerId);
      if (!ctrl) {
        continue;
      }
      const changes = /* @__PURE__ */ new Map();
      const added = profileIds.filter(
        (id) => !ctrl.activeProfiles.has(id)
      );
      const removed = [...ctrl.activeProfiles].filter(
        (id) => !profileIds.includes(id)
      );
      for (const id of added) {
        changes.set(id, true);
        ctrl.activeProfiles.add(id);
      }
      for (const id of removed) {
        changes.set(id, false);
        ctrl.activeProfiles.delete(id);
      }
      if (changes.size) {
        evt.set(controllerId, changes);
      }
    }
    this.defaultProfilesChangedEmitter.fire(evt);
  }
  /** @inheritdoc */
  async $refreshTests(controllerId, token) {
    await this.controllers.get(controllerId)?.controller.refreshHandler?.(token);
  }
  /**
   * Updates test results shown to extensions.
   * @override
   */
  $publishTestResults(results) {
    this.results = Object.freeze(
      results.map((r) => {
        const o = Convert.TestResults.to(r);
        const taskWithCoverage = r.tasks.findIndex(
          (t) => t.hasCoverage
        );
        if (taskWithCoverage !== -1) {
          o.getDetailedCoverage = (uri, token = CancellationToken.None) => this.proxy.$getCoverageDetails(
            r.id,
            taskWithCoverage,
            uri,
            token
          ).then((r2) => r2.map(Convert.TestCoverage.to));
        }
        testResultInternalIDs.set(o, r.id);
        return o;
      }).concat(this.results).sort((a, b) => b.completedAt - a.completedAt).slice(0, 32)
    );
    this.resultsChangedEmitter.fire();
  }
  /**
   * Expands the nodes in the test tree. If levels is less than zero, it will
   * be treated as infinite.
   */
  async $expandTest(testId, levels) {
    const collection = this.controllers.get(
      TestId.fromString(testId).controllerId
    )?.collection;
    if (collection) {
      await collection.expand(
        testId,
        levels < 0 ? Number.POSITIVE_INFINITY : levels
      );
      collection.flushDiff();
    }
  }
  /**
   * Receives a test update from the main thread. Called (eventually) whenever
   * tests change.
   */
  $acceptDiff(diff) {
    this.observer.applyDiff(
      diff.map(
        (d) => TestsDiffOp.deserialize({ asCanonicalUri: /* @__PURE__ */ __name((u) => u, "asCanonicalUri") }, d)
      )
    );
  }
  /**
   * Runs tests with the given set of IDs. Allows for test from multiple
   * providers to be run.
   * @inheritdoc
   */
  async $runControllerTests(reqs, token) {
    return Promise.all(
      reqs.map((req) => this.runControllerTestRequest(req, false, token))
    );
  }
  /**
   * Starts continuous test runs with the given set of IDs. Allows for test from
   * multiple providers to be run.
   * @inheritdoc
   */
  async $startContinuousRun(reqs, token) {
    const cts = new CancellationTokenSource(token);
    const res = await Promise.all(
      reqs.map(
        (req) => this.runControllerTestRequest(req, true, cts.token)
      )
    );
    if (!token.isCancellationRequested && !res.some((r) => r.error)) {
      await new Promise((r) => token.onCancellationRequested(r));
    }
    cts.dispose(true);
    return res;
  }
  /** @inheritdoc */
  async $provideTestFollowups(req, token) {
    const results = this.results.find(
      (r) => testResultInternalIDs.get(r) === req.resultId
    );
    const test = results && findTestInResultSnapshot(
      TestId.fromString(req.extId),
      results?.results
    );
    if (!test) {
      return [];
    }
    let followups = [];
    await Promise.all(
      [...this.followupProviders].map(async (provider) => {
        try {
          const r = await provider.provideFollowup(
            results,
            test,
            req.taskIndex,
            req.messageIndex,
            token
          );
          if (r) {
            followups = followups.concat(r);
          }
        } catch (e) {
          this.logService.error(
            `Error thrown while providing followup for test message`,
            e
          );
        }
      })
    );
    if (token.isCancellationRequested) {
      return [];
    }
    return followups.map((command) => {
      const id = followupCounter++;
      this.testFollowups.set(id, command);
      return { title: command.title, id };
    });
  }
  $disposeTestFollowups(id) {
    for (const i of id) {
      this.testFollowups.delete(i);
    }
  }
  $executeTestFollowup(id) {
    const command = this.testFollowups.get(id);
    if (!command) {
      return Promise.resolve();
    }
    return this.commands.executeCommand(
      command.command,
      ...command.arguments || []
    );
  }
  /**
   * Cancels an ongoing test run.
   */
  $cancelExtensionTestRun(runId, taskId) {
    if (runId === void 0) {
      this.runTracker.cancelAllRuns();
    } else {
      this.runTracker.cancelRunById(runId, taskId);
    }
  }
  //#endregion
  getMetadataForRun(run) {
    for (const tracker of this.runTracker.trackers) {
      const taskId = tracker.getTaskIdForRun(run);
      if (taskId) {
        return { taskId, runId: tracker.id };
      }
    }
    return void 0;
  }
  async runControllerTestRequest(req, isContinuous, token) {
    const lookup = this.controllers.get(req.controllerId);
    if (!lookup) {
      return {};
    }
    const { collection, profiles, extension } = lookup;
    const profile = profiles.get(req.profileId);
    if (!profile) {
      return {};
    }
    const includeTests = req.testIds.map((testId) => collection.tree.get(testId)).filter(isDefined);
    const excludeTests = req.excludeExtIds.map((id) => lookup.collection.tree.get(id)).filter(isDefined).filter(
      (exclude) => includeTests.some(
        (include) => include.fullId.compare(exclude.fullId) === TestPosition.IsChild
      )
    );
    if (!includeTests.length) {
      return {};
    }
    const publicReq = new TestRunRequest(
      includeTests.some((i) => i.actual instanceof TestItemRootImpl) ? void 0 : includeTests.map((t) => t.actual),
      excludeTests.map((t) => t.actual),
      profile,
      isContinuous
    );
    const tracker = isStartControllerTests(req) && this.runTracker.prepareForMainThreadTestRun(
      extension,
      publicReq,
      TestRunDto.fromInternal(req, lookup.collection),
      profile,
      token
    );
    try {
      await profile.runHandler(publicReq, token);
      return {};
    } catch (e) {
      return { error: String(e) };
    } finally {
      if (tracker) {
        if (tracker.hasRunningTasks && !token.isCancellationRequested) {
          await Event.toPromise(tracker.onEnd);
        }
      }
    }
  }
};
ExtHostTesting = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostCommands),
  __decorateParam(3, IExtHostDocumentsAndEditors)
], ExtHostTesting);
const RUN_CANCEL_DEADLINE = 1e4;
var TestRunTrackerState = /* @__PURE__ */ ((TestRunTrackerState2) => {
  TestRunTrackerState2[TestRunTrackerState2["Running"] = 0] = "Running";
  TestRunTrackerState2[TestRunTrackerState2["Cancelling"] = 1] = "Cancelling";
  TestRunTrackerState2[TestRunTrackerState2["Ended"] = 2] = "Ended";
  return TestRunTrackerState2;
})(TestRunTrackerState || {});
class TestRunTracker extends Disposable {
  constructor(dto, proxy, logService, profile, extension, parentToken) {
    super();
    this.dto = dto;
    this.proxy = proxy;
    this.logService = logService;
    this.profile = profile;
    this.extension = extension;
    this.cts = this._register(new CancellationTokenSource(parentToken));
    const forciblyEnd = this._register(
      new RunOnceScheduler(
        () => this.forciblyEndTasks(),
        RUN_CANCEL_DEADLINE
      )
    );
    this._register(
      this.cts.token.onCancellationRequested(
        () => forciblyEnd.schedule()
      )
    );
    const didDisposeEmitter = new Emitter();
    this.onDidDispose = didDisposeEmitter.event;
    this._register(
      toDisposable(() => {
        didDisposeEmitter.fire();
        didDisposeEmitter.dispose();
      })
    );
  }
  static {
    __name(this, "TestRunTracker");
  }
  state = 0 /* Running */;
  running = 0;
  tasks = /* @__PURE__ */ new Map();
  sharedTestIds = /* @__PURE__ */ new Set();
  cts;
  endEmitter = this._register(new Emitter());
  onDidDispose;
  publishedCoverage = /* @__PURE__ */ new Map();
  /**
   * Fires when a test ends, and no more tests are left running.
   */
  onEnd = this.endEmitter.event;
  /**
   * Gets whether there are any tests running.
   */
  get hasRunningTasks() {
    return this.running > 0;
  }
  /**
   * Gets the run ID.
   */
  get id() {
    return this.dto.id;
  }
  /** Gets the task ID from a test run object. */
  getTaskIdForRun(run) {
    for (const [taskId, { run: r }] of this.tasks) {
      if (r === run) {
        return taskId;
      }
    }
    return void 0;
  }
  /** Requests cancellation of the run. On the second call, forces cancellation. */
  cancel(taskId) {
    if (taskId) {
      this.tasks.get(taskId)?.cts.cancel();
    } else if (this.state === 0 /* Running */) {
      this.cts.cancel();
      this.state = 1 /* Cancelling */;
    } else if (this.state === 1 /* Cancelling */) {
      this.forciblyEndTasks();
    }
  }
  /** Gets details for a previously-emitted coverage object. */
  async getCoverageDetails(id, testId, token) {
    const [, taskId] = TestId.fromString(id).path;
    const coverage = this.publishedCoverage.get(id);
    if (!coverage) {
      return [];
    }
    const { report, extIds } = coverage;
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error("unreachable: run task was not found");
    }
    let testItem;
    if (testId && report instanceof FileCoverage) {
      const index = extIds.indexOf(testId);
      if (index === -1) {
        return [];
      }
      testItem = report.fromTests[index];
    }
    const details = testItem ? this.profile?.loadDetailedCoverageForTest?.(
      task.run,
      report,
      testItem,
      token
    ) : this.profile?.loadDetailedCoverage?.(task.run, report, token);
    return await details ?? [];
  }
  /** Creates the public test run interface to give to extensions. */
  createRun(name) {
    const runId = this.dto.id;
    const ctrlId = this.dto.controllerId;
    const taskId = generateUuid();
    const guardTestMutation = /* @__PURE__ */ __name((fn) => (test, ...args) => {
      if (ended) {
        this.logService.warn(
          `Setting the state of test "${test.id}" is a no-op after the run ends.`
        );
        return;
      }
      this.ensureTestIsKnown(test);
      fn(test, ...args);
    }, "guardTestMutation");
    const appendMessages = /* @__PURE__ */ __name((test, messages) => {
      const converted = messages instanceof Array ? messages.map(Convert.TestMessage.from) : [Convert.TestMessage.from(messages)];
      if (test.uri && test.range) {
        const defaultLocation = {
          range: Convert.Range.from(test.range),
          uri: test.uri
        };
        for (const message of converted) {
          message.location = message.location || defaultLocation;
        }
      }
      this.proxy.$appendTestMessagesInRun(
        runId,
        taskId,
        TestId.fromExtHostTestItem(test, ctrlId).toString(),
        converted
      );
    }, "appendMessages");
    let ended = false;
    const cts = this._register(new CancellationTokenSource(this.cts.token));
    const run = {
      isPersisted: this.dto.isPersisted,
      token: cts.token,
      name,
      onDidDispose: this.onDidDispose,
      addCoverage: /* @__PURE__ */ __name((coverage) => {
        if (ended) {
          return;
        }
        const fromTests = coverage instanceof FileCoverage ? coverage.fromTests : [];
        if (fromTests.length) {
          checkProposedApiEnabled(
            this.extension,
            "attributableCoverage"
          );
          for (const test of fromTests) {
            this.ensureTestIsKnown(test);
          }
        }
        const uriStr = coverage.uri.toString();
        const id = new TestId([runId, taskId, uriStr]).toString();
        this.publishedCoverage.set(id, {
          report: coverage,
          extIds: fromTests.map(
            (t) => TestId.fromExtHostTestItem(t, ctrlId).toString()
          )
        });
        this.proxy.$appendCoverage(
          runId,
          taskId,
          Convert.TestCoverage.fromFile(ctrlId, id, coverage)
        );
      }, "addCoverage"),
      //#region state mutation
      enqueued: guardTestMutation((test) => {
        this.proxy.$updateTestStateInRun(
          runId,
          taskId,
          TestId.fromExtHostTestItem(test, ctrlId).toString(),
          TestResultState.Queued
        );
      }),
      skipped: guardTestMutation((test) => {
        this.proxy.$updateTestStateInRun(
          runId,
          taskId,
          TestId.fromExtHostTestItem(test, ctrlId).toString(),
          TestResultState.Skipped
        );
      }),
      started: guardTestMutation((test) => {
        this.proxy.$updateTestStateInRun(
          runId,
          taskId,
          TestId.fromExtHostTestItem(test, ctrlId).toString(),
          TestResultState.Running
        );
      }),
      errored: guardTestMutation((test, messages, duration) => {
        appendMessages(test, messages);
        this.proxy.$updateTestStateInRun(
          runId,
          taskId,
          TestId.fromExtHostTestItem(test, ctrlId).toString(),
          TestResultState.Errored,
          duration
        );
      }),
      failed: guardTestMutation((test, messages, duration) => {
        appendMessages(test, messages);
        this.proxy.$updateTestStateInRun(
          runId,
          taskId,
          TestId.fromExtHostTestItem(test, ctrlId).toString(),
          TestResultState.Failed,
          duration
        );
      }),
      passed: guardTestMutation((test, duration) => {
        this.proxy.$updateTestStateInRun(
          runId,
          taskId,
          TestId.fromExtHostTestItem(
            test,
            this.dto.controllerId
          ).toString(),
          TestResultState.Passed,
          duration
        );
      }),
      //#endregion
      appendOutput: /* @__PURE__ */ __name((output, location, test) => {
        if (ended) {
          return;
        }
        if (test) {
          this.ensureTestIsKnown(test);
        }
        this.proxy.$appendOutputToRun(
          runId,
          taskId,
          VSBuffer.fromString(output),
          location && Convert.location.from(location),
          test && TestId.fromExtHostTestItem(test, ctrlId).toString()
        );
      }, "appendOutput"),
      end: /* @__PURE__ */ __name(() => {
        if (ended) {
          return;
        }
        ended = true;
        this.proxy.$finishedTestRunTask(runId, taskId);
        if (!--this.running) {
          this.markEnded();
        }
      }, "end")
    };
    this.running++;
    this.tasks.set(taskId, { run, cts });
    this.proxy.$startedTestRunTask(runId, {
      id: taskId,
      ctrlId: this.dto.controllerId,
      name: name || this.extension.displayName || this.extension.identifier.value,
      running: true
    });
    return run;
  }
  forciblyEndTasks() {
    for (const { run } of this.tasks.values()) {
      run.end();
    }
  }
  markEnded() {
    if (this.state !== 2 /* Ended */) {
      this.state = 2 /* Ended */;
      this.endEmitter.fire();
    }
  }
  ensureTestIsKnown(test) {
    if (!(test instanceof TestItemImpl)) {
      throw new InvalidTestItemError(test.id);
    }
    if (this.sharedTestIds.has(
      TestId.fromExtHostTestItem(
        test,
        this.dto.controllerId
      ).toString()
    )) {
      return;
    }
    const chain = [];
    const root = this.dto.colllection.root;
    while (true) {
      const converted = Convert.TestItem.from(test);
      chain.unshift(converted);
      if (this.sharedTestIds.has(converted.extId)) {
        break;
      }
      this.sharedTestIds.add(converted.extId);
      if (test === root) {
        break;
      }
      test = test.parent || root;
    }
    this.proxy.$addTestsToRun(this.dto.controllerId, this.dto.id, chain);
  }
  dispose() {
    this.markEnded();
    super.dispose();
  }
}
class TestRunCoordinator {
  constructor(proxy, logService) {
    this.proxy = proxy;
    this.logService = logService;
  }
  static {
    __name(this, "TestRunCoordinator");
  }
  tracked = /* @__PURE__ */ new Map();
  trackedById = /* @__PURE__ */ new Map();
  get trackers() {
    return this.tracked.values();
  }
  /**
   * Gets a coverage report for a given run and task ID.
   */
  getCoverageDetails(id, testId, token) {
    const runId = TestId.root(id);
    return this.trackedById.get(runId)?.getCoverageDetails(id, testId, token) || [];
  }
  /**
   * Disposes the test run, called when the main thread is no longer interested
   * in associated data.
   */
  disposeTestRun(runId) {
    this.trackedById.get(runId)?.dispose();
    this.trackedById.delete(runId);
    for (const [req, { id }] of this.tracked) {
      if (id === runId) {
        this.tracked.delete(req);
      }
    }
  }
  /**
   * Registers a request as being invoked by the main thread, so
   * `$startedExtensionTestRun` is not invoked. The run must eventually
   * be cancelled manually.
   */
  prepareForMainThreadTestRun(extension, req, dto, profile, token) {
    return this.getTracker(req, dto, profile, extension, token);
  }
  /**
   * Cancels an existing test run via its cancellation token.
   */
  cancelRunById(runId, taskId) {
    this.trackedById.get(runId)?.cancel(taskId);
  }
  /**
   * Cancels an existing test run via its cancellation token.
   */
  cancelAllRuns() {
    for (const tracker of this.tracked.values()) {
      tracker.cancel();
    }
  }
  /**
   * Implements the public `createTestRun` API.
   */
  createTestRun(extension, controllerId, collection, request, name, persist) {
    const existing = this.tracked.get(request);
    if (existing) {
      return existing.createRun(name);
    }
    const dto = TestRunDto.fromPublic(
      controllerId,
      collection,
      request,
      persist
    );
    const profile = tryGetProfileFromTestRunReq(request);
    this.proxy.$startedExtensionTestRun({
      controllerId,
      continuous: !!request.continuous,
      profile: profile && {
        group: profileGroupToBitset[profile.kind],
        id: profile.profileId
      },
      exclude: request.exclude?.map(
        (t) => TestId.fromExtHostTestItem(
          t,
          collection.root.id
        ).toString()
      ) ?? [],
      id: dto.id,
      include: request.include?.map(
        (t) => TestId.fromExtHostTestItem(t, collection.root.id).toString()
      ) ?? [collection.root.id],
      preserveFocus: request.preserveFocus ?? true,
      persist
    });
    const tracker = this.getTracker(
      request,
      dto,
      request.profile,
      extension
    );
    Event.once(tracker.onEnd)(() => {
      this.proxy.$finishedExtensionTestRun(dto.id);
    });
    return tracker.createRun(name);
  }
  getTracker(req, dto, profile, extension, token) {
    const tracker = new TestRunTracker(
      dto,
      this.proxy,
      this.logService,
      profile,
      extension,
      token
    );
    this.tracked.set(req, tracker);
    this.trackedById.set(tracker.id, tracker);
    return tracker;
  }
}
const tryGetProfileFromTestRunReq = /* @__PURE__ */ __name((request) => {
  if (!request.profile) {
    return void 0;
  }
  if (!(request.profile instanceof TestRunProfileImpl)) {
    throw new Error(
      `TestRunRequest.profile is not an instance created from TestController.createRunProfile`
    );
  }
  return request.profile;
}, "tryGetProfileFromTestRunReq");
class TestRunDto {
  constructor(controllerId, id, isPersisted, colllection) {
    this.controllerId = controllerId;
    this.id = id;
    this.isPersisted = isPersisted;
    this.colllection = colllection;
  }
  static {
    __name(this, "TestRunDto");
  }
  static fromPublic(controllerId, collection, request, persist) {
    return new TestRunDto(
      controllerId,
      generateUuid(),
      persist,
      collection
    );
  }
  static fromInternal(request, collection) {
    return new TestRunDto(
      request.controllerId,
      request.runId,
      true,
      collection
    );
  }
}
class MirroredChangeCollector {
  constructor(emitter) {
    this.emitter = emitter;
  }
  static {
    __name(this, "MirroredChangeCollector");
  }
  added = /* @__PURE__ */ new Set();
  updated = /* @__PURE__ */ new Set();
  removed = /* @__PURE__ */ new Set();
  alreadyRemoved = /* @__PURE__ */ new Set();
  get isEmpty() {
    return this.added.size === 0 && this.removed.size === 0 && this.updated.size === 0;
  }
  /**
   * @inheritdoc
   */
  add(node) {
    this.added.add(node);
  }
  /**
   * @inheritdoc
   */
  update(node) {
    Object.assign(node.revived, Convert.TestItem.toPlain(node.item));
    if (!this.added.has(node)) {
      this.updated.add(node);
    }
  }
  /**
   * @inheritdoc
   */
  remove(node) {
    if (this.added.has(node)) {
      this.added.delete(node);
      return;
    }
    this.updated.delete(node);
    const parentId = TestId.parentId(node.item.extId);
    if (parentId && this.alreadyRemoved.has(parentId.toString())) {
      this.alreadyRemoved.add(node.item.extId);
      return;
    }
    this.removed.add(node);
  }
  /**
   * @inheritdoc
   */
  getChangeEvent() {
    const { added, updated, removed } = this;
    return {
      get added() {
        return [...added].map((n) => n.revived);
      },
      get updated() {
        return [...updated].map((n) => n.revived);
      },
      get removed() {
        return [...removed].map((n) => n.revived);
      }
    };
  }
  complete() {
    if (!this.isEmpty) {
      this.emitter.fire(this.getChangeEvent());
    }
  }
}
class MirroredTestCollection extends AbstractIncrementalTestCollection {
  static {
    __name(this, "MirroredTestCollection");
  }
  changeEmitter = new Emitter();
  /**
   * Change emitter that fires with the same semantics as `TestObserver.onDidChangeTests`.
   */
  onDidChangeTests = this.changeEmitter.event;
  /**
   * Gets a list of root test items.
   */
  get rootTests() {
    return this.roots;
  }
  /**
   *
   * If the test ID exists, returns its underlying ID.
   */
  getMirroredTestDataById(itemId) {
    return this.items.get(itemId);
  }
  /**
   * If the test item is a mirrored test item, returns its underlying ID.
   */
  getMirroredTestDataByReference(item) {
    return this.items.get(item.id);
  }
  /**
   * @override
   */
  createItem(item, parent) {
    return {
      ...item,
      // todo@connor4312: make this work well again with children
      revived: Convert.TestItem.toPlain(item.item),
      depth: parent ? parent.depth + 1 : 0,
      children: /* @__PURE__ */ new Set()
    };
  }
  /**
   * @override
   */
  createChangeCollector() {
    return new MirroredChangeCollector(this.changeEmitter);
  }
}
class TestObservers {
  constructor(proxy) {
    this.proxy = proxy;
  }
  static {
    __name(this, "TestObservers");
  }
  current;
  checkout() {
    if (!this.current) {
      this.current = this.createObserverData();
    }
    const current = this.current;
    current.observers++;
    return {
      onDidChangeTest: current.tests.onDidChangeTests,
      get tests() {
        return [...current.tests.rootTests].map((t) => t.revived);
      },
      dispose: createSingleCallFunction(() => {
        if (--current.observers === 0) {
          this.proxy.$unsubscribeFromDiffs();
          this.current = void 0;
        }
      })
    };
  }
  /**
   * Gets the internal test data by its reference.
   */
  getMirroredTestDataByReference(ref) {
    return this.current?.tests.getMirroredTestDataByReference(ref);
  }
  /**
   * Applies test diffs to the current set of observed tests.
   */
  applyDiff(diff) {
    this.current?.tests.apply(diff);
  }
  createObserverData() {
    const tests = new MirroredTestCollection({ asCanonicalUri: /* @__PURE__ */ __name((u) => u, "asCanonicalUri") });
    this.proxy.$subscribeToDiffs();
    return { observers: 0, tests };
  }
}
const updateProfile = /* @__PURE__ */ __name((impl, proxy, initial, update) => {
  if (initial) {
    Object.assign(initial, update);
  } else {
    proxy.$updateTestRunConfig(impl.controllerId, impl.profileId, update);
  }
}, "updateProfile");
class TestRunProfileImpl {
  constructor(proxy, profiles, activeProfiles, onDidChangeActiveProfiles, controllerId, profileId, _label, kind, runHandler, _isDefault = false, _tag = void 0, _supportsContinuousRun = false) {
    this.controllerId = controllerId;
    this.profileId = profileId;
    this._label = _label;
    this.kind = kind;
    this.runHandler = runHandler;
    this._tag = _tag;
    this._supportsContinuousRun = _supportsContinuousRun;
    this.#proxy = proxy;
    this.#profiles = profiles;
    this.#activeProfiles = activeProfiles;
    this.#onDidChangeDefaultProfiles = onDidChangeActiveProfiles;
    profiles.set(profileId, this);
    const groupBitset = profileGroupToBitset[kind];
    if (typeof groupBitset !== "number") {
      throw new Error(`Unknown TestRunProfile.group ${kind}`);
    }
    if (_isDefault) {
      activeProfiles.add(profileId);
    }
    this.#initialPublish = {
      profileId,
      controllerId,
      tag: _tag ? Convert.TestTag.namespace(this.controllerId, _tag.id) : null,
      label: _label,
      group: groupBitset,
      isDefault: _isDefault,
      hasConfigurationHandler: false,
      supportsContinuousRun: _supportsContinuousRun
    };
    queueMicrotask(() => {
      if (this.#initialPublish) {
        this.#proxy.$publishTestRunProfile(this.#initialPublish);
        this.#initialPublish = void 0;
      }
    });
  }
  static {
    __name(this, "TestRunProfileImpl");
  }
  #proxy;
  #activeProfiles;
  #onDidChangeDefaultProfiles;
  #initialPublish;
  #profiles;
  _configureHandler;
  get label() {
    return this._label;
  }
  set label(label) {
    if (label !== this._label) {
      this._label = label;
      updateProfile(this, this.#proxy, this.#initialPublish, { label });
    }
  }
  get supportsContinuousRun() {
    return this._supportsContinuousRun;
  }
  set supportsContinuousRun(supports) {
    if (supports !== this._supportsContinuousRun) {
      this._supportsContinuousRun = supports;
      updateProfile(this, this.#proxy, this.#initialPublish, {
        supportsContinuousRun: supports
      });
    }
  }
  get isDefault() {
    return this.#activeProfiles.has(this.profileId);
  }
  set isDefault(isDefault) {
    if (isDefault !== this.isDefault) {
      if (isDefault) {
        this.#activeProfiles.add(this.profileId);
      } else {
        this.#activeProfiles.delete(this.profileId);
      }
      updateProfile(this, this.#proxy, this.#initialPublish, {
        isDefault
      });
    }
  }
  get tag() {
    return this._tag;
  }
  set tag(tag) {
    if (tag?.id !== this._tag?.id) {
      this._tag = tag;
      updateProfile(this, this.#proxy, this.#initialPublish, {
        tag: tag ? Convert.TestTag.namespace(this.controllerId, tag.id) : null
      });
    }
  }
  get configureHandler() {
    return this._configureHandler;
  }
  set configureHandler(handler) {
    if (handler !== this._configureHandler) {
      this._configureHandler = handler;
      updateProfile(this, this.#proxy, this.#initialPublish, {
        hasConfigurationHandler: !!handler
      });
    }
  }
  get onDidChangeDefault() {
    return Event.chain(
      this.#onDidChangeDefaultProfiles,
      ($) => $.map(
        (ev) => ev.get(this.controllerId)?.get(this.profileId)
      ).filter(isDefined)
    );
  }
  dispose() {
    if (this.#profiles?.delete(this.profileId)) {
      this.#profiles = void 0;
      this.#proxy.$removeTestProfile(this.controllerId, this.profileId);
    }
    this.#initialPublish = void 0;
  }
}
const profileGroupToBitset = {
  [TestRunProfileKind.Coverage]: TestRunProfileBitset.Coverage,
  [TestRunProfileKind.Debug]: TestRunProfileBitset.Debug,
  [TestRunProfileKind.Run]: TestRunProfileBitset.Run
};
function findTestInResultSnapshot(extId, snapshot) {
  for (let i = 0; i < extId.path.length; i++) {
    const item = snapshot.find((s) => s.id === extId.path[i]);
    if (!item) {
      return void 0;
    }
    if (i === extId.path.length - 1) {
      return item;
    }
    snapshot = item.children;
  }
  return void 0;
}
__name(findTestInResultSnapshot, "findTestInResultSnapshot");
export {
  ExtHostTesting,
  IExtHostTesting,
  TestRunCoordinator,
  TestRunDto,
  TestRunProfileImpl
};
//# sourceMappingURL=extHostTesting.js.map
