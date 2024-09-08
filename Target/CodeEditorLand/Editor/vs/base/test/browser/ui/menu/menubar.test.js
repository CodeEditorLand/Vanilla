import assert from "assert";
import { $ } from "../../../../browser/dom.js";
import { unthemedMenuStyles } from "../../../../browser/ui/menu/menu.js";
import { MenuBar } from "../../../../browser/ui/menu/menubar.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../common/utils.js";
function getButtonElementByAriaLabel(menubarElement, ariaLabel) {
  let i;
  for (i = 0; i < menubarElement.childElementCount; i++) {
    if (menubarElement.children[i].getAttribute("aria-label") === ariaLabel) {
      return menubarElement.children[i];
    }
  }
  return null;
}
function getTitleDivFromButtonDiv(menuButtonElement) {
  let i;
  for (i = 0; i < menuButtonElement.childElementCount; i++) {
    if (menuButtonElement.children[i].classList.contains(
      "menubar-menu-title"
    )) {
      return menuButtonElement.children[i];
    }
  }
  return null;
}
function getMnemonicFromTitleDiv(menuTitleDiv) {
  let i;
  for (i = 0; i < menuTitleDiv.childElementCount; i++) {
    if (menuTitleDiv.children[i].tagName.toLocaleLowerCase() === "mnemonic") {
      return menuTitleDiv.children[i].textContent;
    }
  }
  return null;
}
function validateMenuBarItem(menubar, menubarContainer, label, readableLabel, mnemonic) {
  menubar.push([
    {
      actions: [],
      label
    }
  ]);
  const buttonElement = getButtonElementByAriaLabel(
    menubarContainer,
    readableLabel
  );
  assert(
    buttonElement !== null,
    `Button element not found for ${readableLabel} button.`
  );
  const titleDiv = getTitleDivFromButtonDiv(buttonElement);
  assert(
    titleDiv !== null,
    `Title div not found for ${readableLabel} button.`
  );
  const mnem = getMnemonicFromTitleDiv(titleDiv);
  assert.strictEqual(mnem, mnemonic, "Mnemonic not correct");
}
suite("Menubar", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  const container = $(".container");
  const menubar = new MenuBar(
    container,
    {
      enableMnemonics: true,
      visibility: "visible"
    },
    unthemedMenuStyles
  );
  test("English File menu renders mnemonics", () => {
    validateMenuBarItem(menubar, container, "&File", "File", "F");
  });
  test("Russian File menu renders mnemonics", () => {
    validateMenuBarItem(menubar, container, "&\u0424\u0430\u0439\u043B", "\u0424\u0430\u0439\u043B", "\u0424");
  });
  test("Chinese File menu renders mnemonics", () => {
    validateMenuBarItem(menubar, container, "\u6587\u4EF6(&F)", "\u6587\u4EF6", "F");
  });
});
