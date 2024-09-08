import "./style.js";
import { isChrome, isFirefox, isSafari } from "../../base/browser/browser.js";
import { runWhenWindowIdle } from "../../base/browser/dom.js";
import { PixelRatio } from "../../base/browser/pixelRatio.js";
import { setARIAContainer } from "../../base/browser/ui/aria/aria.js";
import { setBaseLayerHoverDelegate } from "../../base/browser/ui/hover/hoverDelegate2.js";
import { setHoverDelegateFactory } from "../../base/browser/ui/hover/hoverDelegateFactory.js";
import { setProgressAcccessibilitySignalScheduler } from "../../base/browser/ui/progressbar/progressAccessibilitySignal.js";
import { mainWindow } from "../../base/browser/window.js";
import { isESM } from "../../base/common/amd.js";
import { coalesce } from "../../base/common/arrays.js";
import { RunOnceScheduler, timeout } from "../../base/common/async.js";
import { toErrorMessage } from "../../base/common/errorMessage.js";
import {
  onUnexpectedError,
  setUnexpectedErrorHandler
} from "../../base/common/errors.js";
import {
  Emitter,
  Event,
  setGlobalLeakWarningThreshold
} from "../../base/common/event.js";
import { mark } from "../../base/common/performance.js";
import {
  isLinux,
  isMacintosh,
  isNative,
  isWeb,
  isWindows
} from "../../base/common/platform.js";
import { FontMeasurements } from "../../editor/browser/config/fontMeasurements.js";
import { BareFontInfo } from "../../editor/common/config/fontInfo.js";
import { localize } from "../../nls.js";
import { AccessibleViewRegistry } from "../../platform/accessibility/browser/accessibleViewRegistry.js";
import { AccessibilityProgressSignalScheduler } from "../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js";
import {
  IConfigurationService
} from "../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../platform/dialogs/common/dialogs.js";
import {
  IHoverService,
  WorkbenchHoverDelegate
} from "../../platform/hover/browser/hover.js";
import { getSingletonServiceDescriptors } from "../../platform/instantiation/common/extensions.js";
import { InstantiationService } from "../../platform/instantiation/common/instantiationService.js";
import { INotificationService } from "../../platform/notification/common/notification.js";
import { Registry } from "../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget,
  WillSaveStateReason
} from "../../platform/storage/common/storage.js";
import {
  Extensions as WorkbenchExtensions
} from "../common/contributions.js";
import {
  EditorExtensions
} from "../common/editor.js";
import { IHostService } from "../services/host/browser/host.js";
import {
  IWorkbenchLayoutService,
  Parts,
  Position,
  positionToString
} from "../services/layout/browser/layoutService.js";
import {
  ILifecycleService,
  LifecyclePhase
} from "../services/lifecycle/common/lifecycle.js";
import { WorkbenchContextKeysHandler } from "./contextkeys.js";
import { Layout } from "./layout.js";
import { NotificationAccessibleView } from "./parts/notifications/notificationAccessibleView.js";
import { NotificationsAlerts } from "./parts/notifications/notificationsAlerts.js";
import { NotificationsCenter } from "./parts/notifications/notificationsCenter.js";
import { registerNotificationCommands } from "./parts/notifications/notificationsCommands.js";
import { NotificationsStatus } from "./parts/notifications/notificationsStatus.js";
import { NotificationsTelemetry } from "./parts/notifications/notificationsTelemetry.js";
import { NotificationsToasts } from "./parts/notifications/notificationsToasts.js";
class Workbench extends Layout {
  constructor(parent, options, serviceCollection, logService) {
    super(parent);
    this.options = options;
    this.serviceCollection = serviceCollection;
    mark("code/willStartWorkbench");
    this.registerErrorHandler(logService);
  }
  _onWillShutdown = this._register(
    new Emitter()
  );
  onWillShutdown = this._onWillShutdown.event;
  _onDidShutdown = this._register(new Emitter());
  onDidShutdown = this._onDidShutdown.event;
  registerErrorHandler(logService) {
    mainWindow.addEventListener("unhandledrejection", (event) => {
      onUnexpectedError(event.reason);
      event.preventDefault();
    });
    setUnexpectedErrorHandler(
      (error) => this.handleUnexpectedError(error, logService)
    );
    if (!isESM && typeof mainWindow.require?.config === "function") {
      mainWindow.require.config({
        onError: (err) => {
          if (err.phase === "loading") {
            onUnexpectedError(
              new Error(
                localize(
                  "loaderErrorNative",
                  "Failed to load a required file. Please restart the application to try again. Details: {0}",
                  JSON.stringify(err)
                )
              )
            );
          }
          console.error(err);
        }
      });
    }
  }
  previousUnexpectedError = { message: void 0, time: 0 };
  handleUnexpectedError(error, logService) {
    const message = toErrorMessage(error, true);
    if (!message) {
      return;
    }
    const now = Date.now();
    if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1e3) {
      return;
    }
    this.previousUnexpectedError.time = now;
    this.previousUnexpectedError.message = message;
    logService.error(message);
  }
  startup() {
    try {
      this._register(setGlobalLeakWarningThreshold(175));
      const instantiationService = this.initServices(
        this.serviceCollection
      );
      instantiationService.invokeFunction((accessor) => {
        const lifecycleService = accessor.get(ILifecycleService);
        const storageService = accessor.get(IStorageService);
        const configurationService = accessor.get(
          IConfigurationService
        );
        const hostService = accessor.get(IHostService);
        const hoverService = accessor.get(IHoverService);
        const dialogService = accessor.get(IDialogService);
        const notificationService = accessor.get(
          INotificationService
        );
        setHoverDelegateFactory(
          (placement, enableInstantHover) => instantiationService.createInstance(
            WorkbenchHoverDelegate,
            placement,
            enableInstantHover,
            {}
          )
        );
        setBaseLayerHoverDelegate(hoverService);
        this.initLayout(accessor);
        Registry.as(
          WorkbenchExtensions.Workbench
        ).start(accessor);
        Registry.as(
          EditorExtensions.EditorFactory
        ).start(accessor);
        this._register(
          instantiationService.createInstance(
            WorkbenchContextKeysHandler
          )
        );
        this.registerListeners(
          lifecycleService,
          storageService,
          configurationService,
          hostService,
          dialogService
        );
        this.renderWorkbench(
          instantiationService,
          notificationService,
          storageService,
          configurationService
        );
        this.createWorkbenchLayout();
        this.layout();
        this.restore(lifecycleService);
      });
      return instantiationService;
    } catch (error) {
      onUnexpectedError(error);
      throw error;
    }
  }
  initServices(serviceCollection) {
    serviceCollection.set(IWorkbenchLayoutService, this);
    const contributedServices = getSingletonServiceDescriptors();
    for (const [id, descriptor] of contributedServices) {
      serviceCollection.set(id, descriptor);
    }
    const instantiationService = new InstantiationService(
      serviceCollection,
      true
    );
    instantiationService.invokeFunction((accessor) => {
      const lifecycleService = accessor.get(ILifecycleService);
      const configurationService = accessor.get(
        IConfigurationService
      );
      if (typeof configurationService.acquireInstantiationService === "function") {
        configurationService.acquireInstantiationService(
          instantiationService
        );
      }
      lifecycleService.phase = LifecyclePhase.Ready;
    });
    return instantiationService;
  }
  registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
    this._register(
      configurationService.onDidChangeConfiguration(
        (e) => this.updateFontAliasing(e, configurationService)
      )
    );
    if (isNative) {
      this._register(
        storageService.onWillSaveState((e) => {
          if (e.reason === WillSaveStateReason.SHUTDOWN) {
            this.storeFontInfo(storageService);
          }
        })
      );
    } else {
      this._register(
        lifecycleService.onWillShutdown(
          () => this.storeFontInfo(storageService)
        )
      );
    }
    this._register(
      lifecycleService.onWillShutdown(
        (event) => this._onWillShutdown.fire(event)
      )
    );
    this._register(
      lifecycleService.onDidShutdown(() => {
        this._onDidShutdown.fire();
        this.dispose();
      })
    );
    this._register(
      hostService.onDidChangeFocus((focus) => {
        if (!focus) {
          storageService.flush();
        }
      })
    );
    this._register(
      dialogService.onWillShowDialog(
        () => this.mainContainer.classList.add("modal-dialog-visible")
      )
    );
    this._register(
      dialogService.onDidShowDialog(
        () => this.mainContainer.classList.remove("modal-dialog-visible")
      )
    );
  }
  fontAliasing;
  updateFontAliasing(e, configurationService) {
    if (!isMacintosh) {
      return;
    }
    if (e && !e.affectsConfiguration("workbench.fontAliasing")) {
      return;
    }
    const aliasing = configurationService.getValue("workbench.fontAliasing");
    if (this.fontAliasing === aliasing) {
      return;
    }
    this.fontAliasing = aliasing;
    const fontAliasingValues = [
      "antialiased",
      "none",
      "auto"
    ];
    this.mainContainer.classList.remove(
      ...fontAliasingValues.map(
        (value) => `monaco-font-aliasing-${value}`
      )
    );
    if (fontAliasingValues.some((option) => option === aliasing)) {
      this.mainContainer.classList.add(
        `monaco-font-aliasing-${aliasing}`
      );
    }
  }
  restoreFontInfo(storageService, configurationService) {
    const storedFontInfoRaw = storageService.get(
      "editorFontInfo",
      StorageScope.APPLICATION
    );
    if (storedFontInfoRaw) {
      try {
        const storedFontInfo = JSON.parse(storedFontInfoRaw);
        if (Array.isArray(storedFontInfo)) {
          FontMeasurements.restoreFontInfo(
            mainWindow,
            storedFontInfo
          );
        }
      } catch (err) {
      }
    }
    FontMeasurements.readFontInfo(
      mainWindow,
      BareFontInfo.createFromRawSettings(
        configurationService.getValue("editor"),
        PixelRatio.getInstance(mainWindow).value
      )
    );
  }
  storeFontInfo(storageService) {
    const serializedFontInfo = FontMeasurements.serializeFontInfo(mainWindow);
    if (serializedFontInfo) {
      storageService.store(
        "editorFontInfo",
        JSON.stringify(serializedFontInfo),
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
      );
    }
  }
  renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
    setARIAContainer(this.mainContainer);
    setProgressAcccessibilitySignalScheduler(
      (msDelayTime, msLoopTime) => instantiationService.createInstance(
        AccessibilityProgressSignalScheduler,
        msDelayTime,
        msLoopTime
      )
    );
    const platformClass = isWindows ? "windows" : isLinux ? "linux" : "mac";
    const workbenchClasses = coalesce([
      "monaco-workbench",
      platformClass,
      isWeb ? "web" : void 0,
      isChrome ? "chromium" : isFirefox ? "firefox" : isSafari ? "safari" : void 0,
      ...this.getLayoutClasses(),
      ...this.options?.extraClasses ? this.options.extraClasses : []
    ]);
    this.mainContainer.classList.add(...workbenchClasses);
    mainWindow.document.body.classList.add(platformClass);
    if (isWeb) {
      mainWindow.document.body.classList.add("web");
    }
    this.updateFontAliasing(void 0, configurationService);
    this.restoreFontInfo(storageService, configurationService);
    for (const { id, role, classes, options } of [
      { id: Parts.TITLEBAR_PART, role: "none", classes: ["titlebar"] },
      { id: Parts.BANNER_PART, role: "banner", classes: ["banner"] },
      {
        id: Parts.ACTIVITYBAR_PART,
        role: "none",
        classes: [
          "activitybar",
          this.getSideBarPosition() === Position.LEFT ? "left" : "right"
        ]
      },
      // Use role 'none' for some parts to make screen readers less chatty #114892
      {
        id: Parts.SIDEBAR_PART,
        role: "none",
        classes: [
          "sidebar",
          this.getSideBarPosition() === Position.LEFT ? "left" : "right"
        ]
      },
      {
        id: Parts.EDITOR_PART,
        role: "main",
        classes: ["editor"],
        options: { restorePreviousState: this.willRestoreEditors() }
      },
      {
        id: Parts.PANEL_PART,
        role: "none",
        classes: [
          "panel",
          "basepanel",
          positionToString(this.getPanelPosition())
        ]
      },
      {
        id: Parts.AUXILIARYBAR_PART,
        role: "none",
        classes: [
          "auxiliarybar",
          "basepanel",
          this.getSideBarPosition() === Position.LEFT ? "right" : "left"
        ]
      },
      {
        id: Parts.STATUSBAR_PART,
        role: "status",
        classes: ["statusbar"]
      }
    ]) {
      const partContainer = this.createPart(id, role, classes);
      mark(`code/willCreatePart/${id}`);
      this.getPart(id).create(partContainer, options);
      mark(`code/didCreatePart/${id}`);
    }
    this.createNotificationsHandlers(
      instantiationService,
      notificationService
    );
    this.parent.appendChild(this.mainContainer);
  }
  createPart(id, role, classes) {
    const part = document.createElement(
      role === "status" ? "footer" : "div"
    );
    part.classList.add("part", ...classes);
    part.id = id;
    part.setAttribute("role", role);
    if (role === "status") {
      part.setAttribute("aria-live", "off");
    }
    return part;
  }
  createNotificationsHandlers(instantiationService, notificationService) {
    const notificationsCenter = this._register(
      instantiationService.createInstance(
        NotificationsCenter,
        this.mainContainer,
        notificationService.model
      )
    );
    const notificationsToasts = this._register(
      instantiationService.createInstance(
        NotificationsToasts,
        this.mainContainer,
        notificationService.model
      )
    );
    this._register(
      instantiationService.createInstance(
        NotificationsAlerts,
        notificationService.model
      )
    );
    const notificationsStatus = instantiationService.createInstance(
      NotificationsStatus,
      notificationService.model
    );
    this._register(
      instantiationService.createInstance(NotificationsTelemetry)
    );
    this._register(
      notificationsCenter.onDidChangeVisibility(() => {
        notificationsStatus.update(
          notificationsCenter.isVisible,
          notificationsToasts.isVisible
        );
        notificationsToasts.update(notificationsCenter.isVisible);
      })
    );
    this._register(
      notificationsToasts.onDidChangeVisibility(() => {
        notificationsStatus.update(
          notificationsCenter.isVisible,
          notificationsToasts.isVisible
        );
      })
    );
    registerNotificationCommands(
      notificationsCenter,
      notificationsToasts,
      notificationService.model
    );
    AccessibleViewRegistry.register(new NotificationAccessibleView());
    this.registerNotifications({
      onDidChangeNotificationsVisibility: Event.map(
        Event.any(
          notificationsToasts.onDidChangeVisibility,
          notificationsCenter.onDidChangeVisibility
        ),
        () => notificationsToasts.isVisible || notificationsCenter.isVisible
      )
    });
  }
  restore(lifecycleService) {
    try {
      this.restoreParts();
    } catch (error) {
      onUnexpectedError(error);
    }
    this.whenReady.finally(
      () => Promise.race([this.whenRestored, timeout(2e3)]).finally(() => {
        function markDidStartWorkbench() {
          mark("code/didStartWorkbench");
          performance.measure(
            "perf: workbench create & restore",
            "code/didLoadWorkbenchMain",
            "code/didStartWorkbench"
          );
        }
        if (this.isRestored()) {
          markDidStartWorkbench();
        } else {
          this.whenRestored.finally(() => markDidStartWorkbench());
        }
        lifecycleService.phase = LifecyclePhase.Restored;
        const eventuallyPhaseScheduler = this._register(
          new RunOnceScheduler(() => {
            this._register(
              runWhenWindowIdle(
                mainWindow,
                () => lifecycleService.phase = LifecyclePhase.Eventually,
                2500
              )
            );
          }, 2500)
        );
        eventuallyPhaseScheduler.schedule();
      })
    );
  }
}
export {
  Workbench
};
