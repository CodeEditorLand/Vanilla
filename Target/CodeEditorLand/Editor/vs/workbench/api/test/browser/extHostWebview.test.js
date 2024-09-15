var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { NullLogService } from "../../../../platform/log/common/log.js";
import { MainThreadWebviewManager } from "../../browser/mainThreadWebviewManager.js";
import { NullApiDeprecationService } from "../../common/extHostApiDeprecationService.js";
import { IExtHostRpcService } from "../../common/extHostRpcService.js";
import { ExtHostWebviews } from "../../common/extHostWebview.js";
import { ExtHostWebviewPanels } from "../../common/extHostWebviewPanels.js";
import { SingleProxyRPCProtocol } from "../common/testRPCProtocol.js";
import { decodeAuthority, webviewResourceBaseHost } from "../../../contrib/webview/common/webview.js";
import { EditorGroupColumn } from "../../../services/editor/common/editorGroupColumn.js";
import { IExtHostContext } from "../../../services/extensions/common/extHostCustomers.js";
suite("ExtHostWebview", () => {
  let disposables;
  let rpcProtocol;
  setup(() => {
    disposables = new DisposableStore();
    const shape = createNoopMainThreadWebviews();
    rpcProtocol = SingleProxyRPCProtocol(shape);
  });
  teardown(() => {
    disposables.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
  function createWebview(rpcProtocol2, remoteAuthority) {
    const extHostWebviews = disposables.add(new ExtHostWebviews(rpcProtocol2, {
      authority: remoteAuthority,
      isRemote: !!remoteAuthority
    }, void 0, new NullLogService(), NullApiDeprecationService));
    const extHostWebviewPanels = disposables.add(new ExtHostWebviewPanels(rpcProtocol2, extHostWebviews, void 0));
    return disposables.add(extHostWebviewPanels.createWebviewPanel({
      extensionLocation: URI.from({
        scheme: remoteAuthority ? Schemas.vscodeRemote : Schemas.file,
        authority: remoteAuthority,
        path: "/ext/path"
      })
    }, "type", "title", 1, {}));
  }
  __name(createWebview, "createWebview");
  test("Cannot register multiple serializers for the same view type", async () => {
    const viewType = "view.type";
    const extHostWebviews = disposables.add(new ExtHostWebviews(rpcProtocol, { authority: void 0, isRemote: false }, void 0, new NullLogService(), NullApiDeprecationService));
    const extHostWebviewPanels = disposables.add(new ExtHostWebviewPanels(rpcProtocol, extHostWebviews, void 0));
    let lastInvokedDeserializer = void 0;
    class NoopSerializer {
      static {
        __name(this, "NoopSerializer");
      }
      async deserializeWebviewPanel(webview, _state) {
        lastInvokedDeserializer = this;
        disposables.add(webview);
      }
    }
    const extension = {};
    const serializerA = new NoopSerializer();
    const serializerB = new NoopSerializer();
    const serializerARegistration = extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerA);
    await extHostWebviewPanels.$deserializeWebviewPanel("x", viewType, {
      title: "title",
      state: {},
      panelOptions: {},
      webviewOptions: {},
      active: true
    }, 0);
    assert.strictEqual(lastInvokedDeserializer, serializerA);
    assert.throws(
      () => disposables.add(extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB)),
      "Should throw when registering two serializers for the same view"
    );
    serializerARegistration.dispose();
    disposables.add(extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB));
    await extHostWebviewPanels.$deserializeWebviewPanel("x", viewType, {
      title: "title",
      state: {},
      panelOptions: {},
      webviewOptions: {},
      active: true
    }, 0);
    assert.strictEqual(lastInvokedDeserializer, serializerB);
  });
  test("asWebviewUri for local file paths", () => {
    const webview = createWebview(
      rpcProtocol,
      /* remoteAuthority */
      void 0
    );
    assert.strictEqual(
      webview.webview.asWebviewUri(URI.parse("file:///Users/codey/file.html")).toString(),
      `https://file%2B.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html`,
      "Unix basic"
    );
    assert.strictEqual(
      webview.webview.asWebviewUri(URI.parse("file:///Users/codey/file.html#frag")).toString(),
      `https://file%2B.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html#frag`,
      "Unix should preserve fragment"
    );
    assert.strictEqual(
      webview.webview.asWebviewUri(URI.parse("file:///Users/codey/f%20ile.html")).toString(),
      `https://file%2B.vscode-resource.${webviewResourceBaseHost}/Users/codey/f%20ile.html`,
      "Unix with encoding"
    );
    assert.strictEqual(
      webview.webview.asWebviewUri(URI.parse("file://localhost/Users/codey/file.html")).toString(),
      `https://file%2Blocalhost.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html`,
      "Unix should preserve authority"
    );
    assert.strictEqual(
      webview.webview.asWebviewUri(URI.parse("file:///c:/codey/file.txt")).toString(),
      `https://file%2B.vscode-resource.${webviewResourceBaseHost}/c%3A/codey/file.txt`,
      "Windows C drive"
    );
  });
  test("asWebviewUri for remote file paths", () => {
    const webview = createWebview(
      rpcProtocol,
      /* remoteAuthority */
      "remote"
    );
    assert.strictEqual(
      webview.webview.asWebviewUri(URI.parse("file:///Users/codey/file.html")).toString(),
      `https://vscode-remote%2Bremote.vscode-resource.${webviewResourceBaseHost}/Users/codey/file.html`,
      "Unix basic"
    );
  });
  test("asWebviewUri for remote with / and + in name", () => {
    const webview = createWebview(
      rpcProtocol,
      /* remoteAuthority */
      "remote"
    );
    const authority = "ssh-remote+localhost=foo/bar";
    const sourceUri = URI.from({
      scheme: "vscode-remote",
      authority,
      path: "/Users/cody/x.png"
    });
    const webviewUri = webview.webview.asWebviewUri(sourceUri);
    assert.strictEqual(
      webviewUri.toString(),
      `https://vscode-remote%2Bssh-002dremote-002blocalhost-003dfoo-002fbar.vscode-resource.vscode-cdn.net/Users/cody/x.png`,
      "Check transform"
    );
    assert.strictEqual(
      decodeAuthority(webviewUri.authority),
      `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`,
      "Check decoded authority"
    );
  });
  test("asWebviewUri for remote with port in name", () => {
    const webview = createWebview(
      rpcProtocol,
      /* remoteAuthority */
      "remote"
    );
    const authority = "localhost:8080";
    const sourceUri = URI.from({
      scheme: "vscode-remote",
      authority,
      path: "/Users/cody/x.png"
    });
    const webviewUri = webview.webview.asWebviewUri(sourceUri);
    assert.strictEqual(
      webviewUri.toString(),
      `https://vscode-remote%2Blocalhost-003a8080.vscode-resource.vscode-cdn.net/Users/cody/x.png`,
      "Check transform"
    );
    assert.strictEqual(
      decodeAuthority(webviewUri.authority),
      `vscode-remote+${authority}.vscode-resource.vscode-cdn.net`,
      "Check decoded authority"
    );
  });
});
function createNoopMainThreadWebviews() {
  return new class extends mock() {
    $disposeWebview() {
    }
    $createWebviewPanel() {
    }
    $registerSerializer() {
    }
    $unregisterSerializer() {
    }
  }();
}
__name(createNoopMainThreadWebviews, "createNoopMainThreadWebviews");
//# sourceMappingURL=extHostWebview.test.js.map
