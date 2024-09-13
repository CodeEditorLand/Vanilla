import { IEncryptionService } from "../../../../platform/encryption/common/encryptionService.js";
import { registerMainProcessRemoteService } from "../../../../platform/ipc/electron-sandbox/services.js";
registerMainProcessRemoteService(IEncryptionService, "encryption");
//# sourceMappingURL=encryptionService.js.map
