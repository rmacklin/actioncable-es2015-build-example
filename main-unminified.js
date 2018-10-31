webpackJsonp(["main"],{

/***/ "./app/scripts/main.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/adapters.js
/* harmony default export */ var adapters = ({
  WebSocket: window.WebSocket
});
// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/logger.js
const logger = {
  logger: window.console,
  enabled: false
};

function log(...messages) {
  if (logger.enabled) {
    messages.push(Date.now());
    logger.logger.log("[ActionCable]", ...messages);
  }
}


// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/connection_monitor.js


// Responsible for ensuring the cable connection is in good health by validating the heartbeat pings sent from the server, and attempting
// revival reconnections if things go astray. Internal class, not intended for direct user manipulation.

const now = () => new Date().getTime();

const secondsSince = time => (now() - time) / 1000;

const clamp = (number, min, max) => Math.max(min, Math.min(max, number));

class connection_monitor_ConnectionMonitor {
  constructor(connection) {
    this.visibilityDidChange = this.visibilityDidChange.bind(this);
    this.connection = connection;
    this.reconnectAttempts = 0;
  }

  start() {
    if (!this.isRunning()) {
      this.startedAt = now();
      delete this.stoppedAt;
      this.startPolling();
      document.addEventListener("visibilitychange", this.visibilityDidChange);
      log(`ConnectionMonitor started. pollInterval = ${this.getPollInterval()} ms`);
    }
  }

  stop() {
    if (this.isRunning()) {
      this.stoppedAt = now();
      this.stopPolling();
      document.removeEventListener("visibilitychange", this.visibilityDidChange);
      log("ConnectionMonitor stopped");
    }
  }

  isRunning() {
    return this.startedAt && !this.stoppedAt;
  }

  recordPing() {
    this.pingedAt = now();
  }

  recordConnect() {
    this.reconnectAttempts = 0;
    this.recordPing();
    delete this.disconnectedAt;
    log("ConnectionMonitor recorded connect");
  }

  recordDisconnect() {
    this.disconnectedAt = now();
    log("ConnectionMonitor recorded disconnect");
  }

  // Private

  startPolling() {
    this.stopPolling();
    this.poll();
  }

  stopPolling() {
    clearTimeout(this.pollTimeout);
  }

  poll() {
    this.pollTimeout = setTimeout(() => {
      this.reconnectIfStale();
      this.poll();
    }, this.getPollInterval());
  }

  getPollInterval() {
    const { min, max } = this.constructor.pollInterval;
    const interval = 5 * Math.log(this.reconnectAttempts + 1);
    return Math.round(clamp(interval, min, max) * 1000);
  }

  reconnectIfStale() {
    if (this.connectionIsStale()) {
      log(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, pollInterval = ${this.getPollInterval()} ms, time disconnected = ${secondsSince(this.disconnectedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`);
      this.reconnectAttempts++;
      if (this.disconnectedRecently()) {
        log("ConnectionMonitor skipping reopening recent disconnect");
      } else {
        log("ConnectionMonitor reopening");
        this.connection.reopen();
      }
    }
  }

  connectionIsStale() {
    return secondsSince(this.pingedAt ? this.pingedAt : this.startedAt) > this.constructor.staleThreshold;
  }

  disconnectedRecently() {
    return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
  }

  visibilityDidChange() {
    if (document.visibilityState === "visible") {
      setTimeout(() => {
        if (this.connectionIsStale() || !this.connection.isOpen()) {
          log(`ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = ${document.visibilityState}`);
          this.connection.reopen();
        }
      }, 200);
    }
  }

}

connection_monitor_ConnectionMonitor.pollInterval = {
  min: 3,
  max: 30
};

connection_monitor_ConnectionMonitor.staleThreshold = 6; // Server::Connections::BEAT_INTERVAL * 2 (missed two pings)

/* harmony default export */ var connection_monitor = (connection_monitor_ConnectionMonitor);
// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/internal.js
/* harmony default export */ var internal = ({ "message_types": { "welcome": "welcome", "ping": "ping", "confirmation": "confirm_subscription", "rejection": "reject_subscription" }, "default_mount_path": "/cable", "protocols": ["actioncable-v1-json", "actioncable-unsupported"] });
// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/connection.js





// Encapsulate the cable connection held by the consumer. This is an internal class not intended for direct user manipulation.

const { message_types, protocols } = internal;
const supportedProtocols = protocols.slice(0, protocols.length - 1);

const indexOf = [].indexOf;

class connection_Connection {
  constructor(consumer) {
    this.open = this.open.bind(this);
    this.consumer = consumer;
    this.subscriptions = this.consumer.subscriptions;
    this.monitor = new connection_monitor(this);
    this.disconnected = true;
  }

  send(data) {
    if (this.isOpen()) {
      this.webSocket.send(JSON.stringify(data));
      return true;
    } else {
      return false;
    }
  }

  open() {
    if (this.isActive()) {
      log(`Attempted to open WebSocket, but existing socket is ${this.getState()}`);
      return false;
    } else {
      log(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${protocols}`);
      if (this.webSocket) {
        this.uninstallEventHandlers();
      }
      this.webSocket = new adapters.WebSocket(this.consumer.url, protocols);
      this.installEventHandlers();
      this.monitor.start();
      return true;
    }
  }

  close({ allowReconnect } = { allowReconnect: true }) {
    if (!allowReconnect) {
      this.monitor.stop();
    }
    if (this.isActive()) {
      return this.webSocket ? this.webSocket.close() : undefined;
    }
  }

  reopen() {
    log(`Reopening WebSocket, current state is ${this.getState()}`);
    if (this.isActive()) {
      try {
        return this.close();
      } catch (error) {
        log("Failed to reopen WebSocket", error);
      } finally {
        log(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`);
        setTimeout(this.open, this.constructor.reopenDelay);
      }
    } else {
      return this.open();
    }
  }

  getProtocol() {
    return this.webSocket ? this.webSocket.protocol : undefined;
  }

  isOpen() {
    return this.isState("open");
  }

  isActive() {
    return this.isState("open", "connecting");
  }

  // Private

  isProtocolSupported() {
    return indexOf.call(supportedProtocols, this.getProtocol()) >= 0;
  }

  isState(...states) {
    return indexOf.call(states, this.getState()) >= 0;
  }

  getState() {
    for (let state in WebSocket) {
      const value = WebSocket[state];if (value === (this.webSocket ? this.webSocket.readyState : undefined)) {
        return state.toLowerCase();
      }
    }
    return null;
  }

  installEventHandlers() {
    for (let eventName in this.events) {
      const handler = this.events[eventName].bind(this);
      this.webSocket[`on${eventName}`] = handler;
    }
  }

  uninstallEventHandlers() {
    for (let eventName in this.events) {
      this.webSocket[`on${eventName}`] = function () {};
    }
  }

}

connection_Connection.reopenDelay = 500;

connection_Connection.prototype.events = {
  message(event) {
    if (!this.isProtocolSupported()) {
      return;
    }
    const { identifier, message, type } = JSON.parse(event.data);
    switch (type) {
      case message_types.welcome:
        this.monitor.recordConnect();
        return this.subscriptions.reload();
      case message_types.ping:
        return this.monitor.recordPing();
      case message_types.confirmation:
        return this.subscriptions.notify(identifier, "connected");
      case message_types.rejection:
        return this.subscriptions.reject(identifier);
      default:
        return this.subscriptions.notify(identifier, "received", message);
    }
  },

  open() {
    log(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`);
    this.disconnected = false;
    if (!this.isProtocolSupported()) {
      log("Protocol is unsupported. Stopping monitor and disconnecting.");
      return this.close({ allowReconnect: false });
    }
  },

  close(event) {
    log("WebSocket onclose event");
    if (this.disconnected) {
      return;
    }
    this.disconnected = true;
    this.monitor.recordDisconnect();
    return this.subscriptions.notifyAll("disconnected", { willAttemptReconnect: this.monitor.isRunning() });
  },

  error() {
    log("WebSocket onerror event");
  }
};

/* harmony default export */ var connection = (connection_Connection);
// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/subscription.js
// A new subscription is created through the ActionCable.Subscriptions instance available on the consumer.
// It provides a number of callbacks and a method for calling remote procedure calls on the corresponding
// Channel instance on the server side.
//
// An example demonstrates the basic functionality:
//
//   App.appearance = App.cable.subscriptions.create("AppearanceChannel", {
//     connected() {
//       // Called once the subscription has been successfully completed
//     },
//
//     disconnected({ willAttemptReconnect: boolean }) {
//       // Called when the client has disconnected with the server.
//       // The object will have an `willAttemptReconnect` property which
//       // says whether the client has the intention of attempting
//       // to reconnect.
//     },
//
//     appear() {
//       this.perform('appear', {appearing_on: this.appearingOn()});
//     },
//
//     away() {
//       this.perform('away');
//     },
//
//     appearingOn() {
//       $('main').data('appearing-on');
//     }
//   });
//
// The methods #appear and #away forward their intent to the remote AppearanceChannel instance on the server
// by calling the `perform` method with the first parameter being the action (which maps to AppearanceChannel#appear/away).
// The second parameter is a hash that'll get JSON encoded and made available on the server in the data parameter.
//
// This is how the server component would look:
//
//   class AppearanceChannel < ApplicationActionCable::Channel
//     def subscribed
//       current_user.appear
//     end
//
//     def unsubscribed
//       current_user.disappear
//     end
//
//     def appear(data)
//       current_user.appear on: data['appearing_on']
//     end
//
//     def away
//       current_user.away
//     end
//   end
//
// The "AppearanceChannel" name is automatically mapped between the client-side subscription creation and the server-side Ruby class name.
// The AppearanceChannel#appear/away public methods are exposed automatically to client-side invocation through the perform method.

const extend = function extend(object, properties) {
  if (properties != null) {
    for (let key in properties) {
      const value = properties[key];
      object[key] = value;
    }
  }
  return object;
};

class Subscription {
  constructor(consumer, params = {}, mixin) {
    this.consumer = consumer;
    this.identifier = JSON.stringify(params);
    extend(this, mixin);
  }

  // Perform a channel action with the optional data passed as an attribute
  perform(action, data = {}) {
    data.action = action;
    return this.send(data);
  }

  send(data) {
    return this.consumer.send({ command: "message", identifier: this.identifier, data: JSON.stringify(data) });
  }

  unsubscribe() {
    return this.consumer.subscriptions.remove(this);
  }
}
// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/subscriptions.js


// Collection class for creating (and internally managing) channel subscriptions. The only method intended to be triggered by the user
// us ActionCable.Subscriptions#create, and it should be called through the consumer like so:
//
//   App = {};
//   App.cable = ActionCable.createConsumer("ws://example.com/accounts/1");
//   App.appearance = App.cable.subscriptions.create("AppearanceChannel");
//
// For more details on how you'd configure an actual channel subscription, see ActionCable.Subscription.

class subscriptions_Subscriptions {
  constructor(consumer) {
    this.consumer = consumer;
    this.subscriptions = [];
  }

  create(channelName, mixin) {
    const channel = channelName;
    const params = typeof channel === "object" ? channel : { channel };
    const subscription = new Subscription(this.consumer, params, mixin);
    return this.add(subscription);
  }

  // Private

  add(subscription) {
    this.subscriptions.push(subscription);
    this.consumer.ensureActiveConnection();
    this.notify(subscription, "initialized");
    this.sendCommand(subscription, "subscribe");
    return subscription;
  }

  remove(subscription) {
    this.forget(subscription);
    if (!this.findAll(subscription.identifier).length) {
      this.sendCommand(subscription, "unsubscribe");
    }
    return subscription;
  }

  reject(identifier) {
    return this.findAll(identifier).map(subscription => {
      this.forget(subscription);
      this.notify(subscription, "rejected");
      return subscription;
    });
  }

  forget(subscription) {
    this.subscriptions = this.subscriptions.filter(s => s !== subscription);
    return subscription;
  }

  findAll(identifier) {
    return this.subscriptions.filter(s => s.identifier === identifier);
  }

  reload() {
    return this.subscriptions.map(subscription => this.sendCommand(subscription, "subscribe"));
  }

  notifyAll(callbackName, ...args) {
    return this.subscriptions.map(subscription => this.notify(subscription, callbackName, ...args));
  }

  notify(subscription, callbackName, ...args) {
    let subscriptions;
    if (typeof subscription === "string") {
      subscriptions = this.findAll(subscription);
    } else {
      subscriptions = [subscription];
    }

    return subscriptions.map(subscription => typeof subscription[callbackName] === "function" ? subscription[callbackName](...args) : undefined);
  }

  sendCommand(subscription, command) {
    const { identifier } = subscription;
    return this.consumer.send({ command, identifier });
  }
}
// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/consumer.js



// The ActionCable.Consumer establishes the connection to a server-side Ruby Connection object. Once established,
// the ActionCable.ConnectionMonitor will ensure that its properly maintained through heartbeats and checking for stale updates.
// The Consumer instance is also the gateway to establishing subscriptions to desired channels through the #createSubscription
// method.
//
// The following example shows how this can be setup:
//
//   App = {};
//   App.cable = ActionCable.createConsumer("ws://example.com/accounts/1");
//   App.appearance = App.cable.subscriptions.create("AppearanceChannel");
//
// For more details on how you'd configure an actual channel subscription, see ActionCable.Subscription.
//
// When a consumer is created, it automatically connects with the server.
//
// To disconnect from the server, call
//
//   App.cable.disconnect()
//
// and to restart the connection:
//
//   App.cable.connect()
//
// Any channel subscriptions which existed prior to disconnecting will
// automatically resubscribe.

class consumer_Consumer {
  constructor(url) {
    this.url = url;
    this.subscriptions = new subscriptions_Subscriptions(this);
    this.connection = new connection(this);
  }

  send(data) {
    return this.connection.send(data);
  }

  connect() {
    return this.connection.open();
  }

  disconnect() {
    return this.connection.close({ allowReconnect: false });
  }

  ensureActiveConnection() {
    if (!this.connection.isActive()) {
      return this.connection.open();
    }
  }
}
// CONCATENATED MODULE: ./node_modules/actioncable-with-source-code/src/action_cable.js








function getConfig(name) {
  const element = document.head.querySelector(`meta[name='action-cable-${name}']`);
  return element ? element.getAttribute("content") : undefined;
}

function createWebSocketURL(url) {
  if (url && !/^wss?:/i.test(url)) {
    const a = document.createElement("a");
    a.href = url;
    // Fix populating Location properties in IE. Otherwise, protocol will be blank.
    a.href = a.href;
    a.protocol = a.protocol.replace("http", "ws");
    return a.href;
  } else {
    return url;
  }
}

function createConsumer(url) {
  if (url == null) {
    const urlConfig = getConfig("url");
    url = urlConfig ? urlConfig : internal.default_mount_path;
  }
  return new consumer_Consumer(createWebSocketURL(url));
}

function startDebugging() {
  logger.enabled = true;
}

function stopDebugging() {
  logger.enabled = false;
}


// CONCATENATED MODULE: ./app/scripts/main.js


let cable = createConsumer('wss://cable.example.com');

cable.subscriptions.create('AppearanceChannel', {
  // normal channel code goes here...
});

/***/ })

},["./app/scripts/main.js"]);
//# sourceMappingURL=main-1b880f4692.js.map