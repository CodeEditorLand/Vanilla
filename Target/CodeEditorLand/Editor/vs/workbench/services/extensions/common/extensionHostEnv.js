var ExtHostConnectionType = /* @__PURE__ */ ((ExtHostConnectionType2) => {
  ExtHostConnectionType2[ExtHostConnectionType2["IPC"] = 1] = "IPC";
  ExtHostConnectionType2[ExtHostConnectionType2["Socket"] = 2] = "Socket";
  ExtHostConnectionType2[ExtHostConnectionType2["MessagePort"] = 3] = "MessagePort";
  return ExtHostConnectionType2;
})(ExtHostConnectionType || {});
class IPCExtHostConnection {
  constructor(pipeName) {
    this.pipeName = pipeName;
  }
  static ENV_KEY = "VSCODE_EXTHOST_IPC_HOOK";
  type = 1 /* IPC */;
  serialize(env) {
    env[IPCExtHostConnection.ENV_KEY] = this.pipeName;
  }
}
class SocketExtHostConnection {
  static ENV_KEY = "VSCODE_EXTHOST_WILL_SEND_SOCKET";
  type = 2 /* Socket */;
  serialize(env) {
    env[SocketExtHostConnection.ENV_KEY] = "1";
  }
}
class MessagePortExtHostConnection {
  static ENV_KEY = "VSCODE_WILL_SEND_MESSAGE_PORT";
  type = 3 /* MessagePort */;
  serialize(env) {
    env[MessagePortExtHostConnection.ENV_KEY] = "1";
  }
}
function clean(env) {
  delete env[IPCExtHostConnection.ENV_KEY];
  delete env[SocketExtHostConnection.ENV_KEY];
  delete env[MessagePortExtHostConnection.ENV_KEY];
}
function writeExtHostConnection(connection, env) {
  clean(env);
  connection.serialize(env);
}
function readExtHostConnection(env) {
  if (env[IPCExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(
      env,
      new IPCExtHostConnection(env[IPCExtHostConnection.ENV_KEY])
    );
  }
  if (env[SocketExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env, new SocketExtHostConnection());
  }
  if (env[MessagePortExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env, new MessagePortExtHostConnection());
  }
  throw new Error(`No connection information defined in environment!`);
}
function cleanAndReturn(env, result) {
  clean(env);
  return result;
}
export {
  ExtHostConnectionType,
  IPCExtHostConnection,
  MessagePortExtHostConnection,
  SocketExtHostConnection,
  readExtHostConnection,
  writeExtHostConnection
};
