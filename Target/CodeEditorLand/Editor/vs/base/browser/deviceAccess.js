var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function requestUsbDevice(options) {
  const usb = navigator.usb;
  if (!usb) {
    return void 0;
  }
  const device = await usb.requestDevice({ filters: options?.filters ?? [] });
  if (!device) {
    return void 0;
  }
  return {
    deviceClass: device.deviceClass,
    deviceProtocol: device.deviceProtocol,
    deviceSubclass: device.deviceSubclass,
    deviceVersionMajor: device.deviceVersionMajor,
    deviceVersionMinor: device.deviceVersionMinor,
    deviceVersionSubminor: device.deviceVersionSubminor,
    manufacturerName: device.manufacturerName,
    productId: device.productId,
    productName: device.productName,
    serialNumber: device.serialNumber,
    usbVersionMajor: device.usbVersionMajor,
    usbVersionMinor: device.usbVersionMinor,
    usbVersionSubminor: device.usbVersionSubminor,
    vendorId: device.vendorId
  };
}
__name(requestUsbDevice, "requestUsbDevice");
async function requestSerialPort(options) {
  const serial = navigator.serial;
  if (!serial) {
    return void 0;
  }
  const port = await serial.requestPort({ filters: options?.filters ?? [] });
  if (!port) {
    return void 0;
  }
  const info = port.getInfo();
  return {
    usbVendorId: info.usbVendorId,
    usbProductId: info.usbProductId
  };
}
__name(requestSerialPort, "requestSerialPort");
async function requestHidDevice(options) {
  const hid = navigator.hid;
  if (!hid) {
    return void 0;
  }
  const devices = await hid.requestDevice({
    filters: options?.filters ?? []
  });
  if (!devices.length) {
    return void 0;
  }
  const device = devices[0];
  return {
    opened: device.opened,
    vendorId: device.vendorId,
    productId: device.productId,
    productName: device.productName,
    collections: device.collections
  };
}
__name(requestHidDevice, "requestHidDevice");
export {
  requestHidDevice,
  requestSerialPort,
  requestUsbDevice
};
//# sourceMappingURL=deviceAccess.js.map
