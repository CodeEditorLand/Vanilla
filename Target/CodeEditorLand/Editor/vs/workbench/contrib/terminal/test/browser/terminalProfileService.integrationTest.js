import { deepStrictEqual } from "assert";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  OperatingSystem,
  isLinux,
  isWindows
} from "../../../../../base/common/platform.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import {
  ConfigurationTarget,
  IConfigurationService
} from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import {
  IQuickInputService
} from "../../../../../platform/quickinput/common/quickInput.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { TestThemeService } from "../../../../../platform/theme/test/common/testThemeService.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../../services/extensions/common/extensions.js";
import { IRemoteAgentService } from "../../../../services/remote/common/remoteAgentService.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import { TestExtensionService } from "../../../../test/common/workbenchTestServices.js";
import { ITerminalInstanceService } from "../../browser/terminal.js";
import {
  TerminalProfileQuickpick
} from "../../browser/terminalProfileQuickpick.js";
import { TerminalProfileService } from "../../browser/terminalProfileService.js";
import {
  ITerminalProfileService
} from "../../common/terminal.js";
import { ITerminalContributionService } from "../../common/terminalExtensionPoints.js";
class TestTerminalProfileService extends TerminalProfileService {
  hasRefreshedProfiles;
  refreshAvailableProfiles() {
    this.hasRefreshedProfiles = this._refreshAvailableProfilesNow();
  }
  refreshAndAwaitAvailableProfiles() {
    this.refreshAvailableProfiles();
    if (!this.hasRefreshedProfiles) {
      throw new Error("has not refreshed profiles yet");
    }
    return this.hasRefreshedProfiles;
  }
}
class MockTerminalProfileService {
  hasRefreshedProfiles;
  _defaultProfileName;
  availableProfiles = [];
  contributedProfiles = [];
  async getPlatformKey() {
    return "linux";
  }
  getDefaultProfileName() {
    return this._defaultProfileName;
  }
  setProfiles(profiles, contributed) {
    this.availableProfiles = profiles;
    this.contributedProfiles = contributed;
  }
  setDefaultProfileName(name) {
    this._defaultProfileName = name;
  }
}
class MockQuickInputService {
  _pick = powershellPick;
  async pick(picks, options, token) {
    Promise.resolve(picks);
    return this._pick;
  }
  setPick(pick) {
    this._pick = pick;
  }
}
class TestTerminalProfileQuickpick extends TerminalProfileQuickpick {
}
class TestTerminalExtensionService extends TestExtensionService {
  _onDidChangeExtensions = new Emitter();
}
class TestTerminalContributionService {
  _serviceBrand;
  terminalProfiles = [];
  setProfiles(profiles) {
    this.terminalProfiles = profiles;
  }
}
class TestTerminalInstanceService {
  _profiles = /* @__PURE__ */ new Map();
  _hasReturnedNone = true;
  async getBackend(remoteAuthority) {
    return {
      getProfiles: async () => {
        if (this._hasReturnedNone) {
          return this._profiles.get(remoteAuthority ?? "") || [];
        } else {
          this._hasReturnedNone = true;
          return [];
        }
      }
    };
  }
  setProfiles(remoteAuthority, profiles) {
    this._profiles.set(remoteAuthority ?? "", profiles);
  }
  setReturnNone() {
    this._hasReturnedNone = false;
  }
}
class TestRemoteAgentService {
  _os;
  setEnvironment(os) {
    this._os = os;
  }
  async getEnvironment() {
    return {
      os: this._os
    };
  }
}
const defaultTerminalConfig = {
  profiles: { windows: {}, linux: {}, osx: {} }
};
let powershellProfile = {
  profileName: "PowerShell",
  path: "C:\\Powershell.exe",
  isDefault: true,
  icon: Codicon.terminalPowershell
};
let jsdebugProfile = {
  extensionIdentifier: "ms-vscode.js-debug-nightly",
  icon: "debug",
  id: "extension.js-debug.debugTerminal",
  title: "JavaScript Debug Terminal"
};
const powershellPick = {
  label: "Powershell",
  profile: powershellProfile,
  profileName: powershellProfile.profileName
};
const jsdebugPick = {
  label: "Javascript Debug Terminal",
  profile: jsdebugProfile,
  profileName: jsdebugProfile.title
};
suite("TerminalProfileService", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  let configurationService;
  let terminalInstanceService;
  let terminalProfileService;
  let remoteAgentService;
  let extensionService;
  let environmentService;
  let instantiationService;
  setup(async () => {
    configurationService = new TestConfigurationService({
      files: {},
      terminal: {
        integrated: defaultTerminalConfig
      }
    });
    instantiationService = workbenchInstantiationService(
      {
        configurationService: () => configurationService
      },
      store
    );
    remoteAgentService = new TestRemoteAgentService();
    terminalInstanceService = new TestTerminalInstanceService();
    extensionService = new TestTerminalExtensionService();
    environmentService = {
      remoteAuthority: void 0
    };
    const themeService = new TestThemeService();
    const terminalContributionService = new TestTerminalContributionService();
    instantiationService.stub(IExtensionService, extensionService);
    instantiationService.stub(IConfigurationService, configurationService);
    instantiationService.stub(IRemoteAgentService, remoteAgentService);
    instantiationService.stub(
      ITerminalContributionService,
      terminalContributionService
    );
    instantiationService.stub(
      ITerminalInstanceService,
      terminalInstanceService
    );
    instantiationService.stub(
      IWorkbenchEnvironmentService,
      environmentService
    );
    instantiationService.stub(IThemeService, themeService);
    terminalProfileService = store.add(
      instantiationService.createInstance(TestTerminalProfileService)
    );
    powershellProfile = {
      profileName: "PowerShell",
      path: "C:\\Powershell.exe",
      isDefault: true,
      icon: Codicon.terminalPowershell
    };
    jsdebugProfile = {
      extensionIdentifier: "ms-vscode.js-debug-nightly",
      icon: "debug",
      id: "extension.js-debug.debugTerminal",
      title: "JavaScript Debug Terminal"
    };
    terminalInstanceService.setProfiles(void 0, [powershellProfile]);
    terminalInstanceService.setProfiles("fakeremote", []);
    terminalContributionService.setProfiles([jsdebugProfile]);
    if (isWindows) {
      remoteAgentService.setEnvironment(OperatingSystem.Windows);
    } else if (isLinux) {
      remoteAgentService.setEnvironment(OperatingSystem.Linux);
    } else {
      remoteAgentService.setEnvironment(OperatingSystem.Macintosh);
    }
    configurationService.setUserConfiguration("terminal", {
      integrated: defaultTerminalConfig
    });
  });
  suite("Contributed Profiles", () => {
    test("should filter out contributed profiles set to null (Linux)", async () => {
      remoteAgentService.setEnvironment(OperatingSystem.Linux);
      await configurationService.setUserConfiguration("terminal", {
        integrated: {
          profiles: {
            linux: {
              "JavaScript Debug Terminal": null
            }
          }
        }
      });
      configurationService.onDidChangeConfigurationEmitter.fire({
        affectsConfiguration: () => true,
        source: ConfigurationTarget.USER
      });
      await terminalProfileService.refreshAndAwaitAvailableProfiles();
      deepStrictEqual(terminalProfileService.availableProfiles, [
        powershellProfile
      ]);
      deepStrictEqual(terminalProfileService.contributedProfiles, []);
    });
    test("should filter out contributed profiles set to null (Windows)", async () => {
      remoteAgentService.setEnvironment(OperatingSystem.Windows);
      await configurationService.setUserConfiguration("terminal", {
        integrated: {
          profiles: {
            windows: {
              "JavaScript Debug Terminal": null
            }
          }
        }
      });
      configurationService.onDidChangeConfigurationEmitter.fire({
        affectsConfiguration: () => true,
        source: ConfigurationTarget.USER
      });
      await terminalProfileService.refreshAndAwaitAvailableProfiles();
      deepStrictEqual(terminalProfileService.availableProfiles, [
        powershellProfile
      ]);
      deepStrictEqual(terminalProfileService.contributedProfiles, []);
    });
    test("should filter out contributed profiles set to null (macOS)", async () => {
      remoteAgentService.setEnvironment(OperatingSystem.Macintosh);
      await configurationService.setUserConfiguration("terminal", {
        integrated: {
          profiles: {
            osx: {
              "JavaScript Debug Terminal": null
            }
          }
        }
      });
      configurationService.onDidChangeConfigurationEmitter.fire({
        affectsConfiguration: () => true,
        source: ConfigurationTarget.USER
      });
      await terminalProfileService.refreshAndAwaitAvailableProfiles();
      deepStrictEqual(terminalProfileService.availableProfiles, [
        powershellProfile
      ]);
      deepStrictEqual(terminalProfileService.contributedProfiles, []);
    });
    test("should include contributed profiles", async () => {
      await terminalProfileService.refreshAndAwaitAvailableProfiles();
      deepStrictEqual(terminalProfileService.availableProfiles, [
        powershellProfile
      ]);
      deepStrictEqual(terminalProfileService.contributedProfiles, [
        jsdebugProfile
      ]);
    });
  });
  test("should get profiles from remoteTerminalService when there is a remote authority", async () => {
    environmentService = {
      remoteAuthority: "fakeremote"
    };
    instantiationService.stub(
      IWorkbenchEnvironmentService,
      environmentService
    );
    terminalProfileService = store.add(
      instantiationService.createInstance(TestTerminalProfileService)
    );
    await terminalProfileService.hasRefreshedProfiles;
    deepStrictEqual(terminalProfileService.availableProfiles, []);
    deepStrictEqual(terminalProfileService.contributedProfiles, [
      jsdebugProfile
    ]);
    terminalInstanceService.setProfiles("fakeremote", [powershellProfile]);
    await terminalProfileService.refreshAndAwaitAvailableProfiles();
    deepStrictEqual(terminalProfileService.availableProfiles, [
      powershellProfile
    ]);
    deepStrictEqual(terminalProfileService.contributedProfiles, [
      jsdebugProfile
    ]);
  });
  test("should fire onDidChangeAvailableProfiles only when available profiles have changed via user config", async () => {
    powershellProfile.icon = Codicon.lightBulb;
    let calls = [];
    store.add(
      terminalProfileService.onDidChangeAvailableProfiles(
        (e) => calls.push(e)
      )
    );
    await configurationService.setUserConfiguration("terminal", {
      integrated: {
        profiles: {
          windows: powershellProfile,
          linux: powershellProfile,
          osx: powershellProfile
        }
      }
    });
    await terminalProfileService.hasRefreshedProfiles;
    deepStrictEqual(calls, [[powershellProfile]]);
    deepStrictEqual(terminalProfileService.availableProfiles, [
      powershellProfile
    ]);
    deepStrictEqual(terminalProfileService.contributedProfiles, [
      jsdebugProfile
    ]);
    calls = [];
    await terminalProfileService.refreshAndAwaitAvailableProfiles();
    deepStrictEqual(calls, []);
  });
  test("should fire onDidChangeAvailableProfiles when available or contributed profiles have changed via remote/localTerminalService", async () => {
    powershellProfile.isDefault = false;
    terminalInstanceService.setProfiles(void 0, [powershellProfile]);
    const calls = [];
    store.add(
      terminalProfileService.onDidChangeAvailableProfiles(
        (e) => calls.push(e)
      )
    );
    await terminalProfileService.hasRefreshedProfiles;
    deepStrictEqual(calls, [[powershellProfile]]);
    deepStrictEqual(terminalProfileService.availableProfiles, [
      powershellProfile
    ]);
    deepStrictEqual(terminalProfileService.contributedProfiles, [
      jsdebugProfile
    ]);
  });
  test("should call refreshAvailableProfiles _onDidChangeExtensions", async () => {
    extensionService._onDidChangeExtensions.fire();
    const calls = [];
    store.add(
      terminalProfileService.onDidChangeAvailableProfiles(
        (e) => calls.push(e)
      )
    );
    await terminalProfileService.hasRefreshedProfiles;
    deepStrictEqual(calls, [[powershellProfile]]);
    deepStrictEqual(terminalProfileService.availableProfiles, [
      powershellProfile
    ]);
    deepStrictEqual(terminalProfileService.contributedProfiles, [
      jsdebugProfile
    ]);
  });
  suite("Profiles Quickpick", () => {
    let quickInputService;
    let mockTerminalProfileService;
    let terminalProfileQuickpick;
    setup(async () => {
      quickInputService = new MockQuickInputService();
      mockTerminalProfileService = new MockTerminalProfileService();
      instantiationService.stub(IQuickInputService, quickInputService);
      instantiationService.stub(
        ITerminalProfileService,
        mockTerminalProfileService
      );
      terminalProfileQuickpick = instantiationService.createInstance(
        TestTerminalProfileQuickpick
      );
    });
    test("setDefault", async () => {
      powershellProfile.isDefault = false;
      mockTerminalProfileService.setProfiles(
        [powershellProfile],
        [jsdebugProfile]
      );
      mockTerminalProfileService.setDefaultProfileName(
        jsdebugProfile.title
      );
      const result = await terminalProfileQuickpick.showAndGetResult("setDefault");
      deepStrictEqual(result, powershellProfile.profileName);
    });
    test("setDefault to contributed", async () => {
      mockTerminalProfileService.setDefaultProfileName(
        powershellProfile.profileName
      );
      quickInputService.setPick(jsdebugPick);
      const result = await terminalProfileQuickpick.showAndGetResult("setDefault");
      const expected = {
        config: {
          extensionIdentifier: jsdebugProfile.extensionIdentifier,
          id: jsdebugProfile.id,
          options: { color: void 0, icon: "debug" },
          title: jsdebugProfile.title
        },
        keyMods: void 0
      };
      deepStrictEqual(result, expected);
    });
    test("createInstance", async () => {
      mockTerminalProfileService.setDefaultProfileName(
        powershellProfile.profileName
      );
      const pick = {
        ...powershellPick,
        keyMods: { alt: true, ctrlCmd: false }
      };
      quickInputService.setPick(pick);
      const result = await terminalProfileQuickpick.showAndGetResult(
        "createInstance"
      );
      deepStrictEqual(result, {
        config: powershellProfile,
        keyMods: { alt: true, ctrlCmd: false }
      });
    });
    test("createInstance with contributed", async () => {
      const pick = {
        ...jsdebugPick,
        keyMods: { alt: true, ctrlCmd: false }
      };
      quickInputService.setPick(pick);
      const result = await terminalProfileQuickpick.showAndGetResult(
        "createInstance"
      );
      const expected = {
        config: {
          extensionIdentifier: jsdebugProfile.extensionIdentifier,
          id: jsdebugProfile.id,
          options: { color: void 0, icon: "debug" },
          title: jsdebugProfile.title
        },
        keyMods: { alt: true, ctrlCmd: false }
      };
      deepStrictEqual(result, expected);
    });
  });
});
