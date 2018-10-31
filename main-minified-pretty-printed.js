webpackJsonp(["main"], {
    "./app/scripts/main.js": function(t, e, n) {
        "use strict";
        function i(...t) {
            a.enabled && (t.push(Date.now()),
            a.logger.log("[ActionCable]", ...t))
        }
        function o(t) {
            const e = document.head.querySelector(`meta[name='action-cable-${t}']`);
            return e ? e.getAttribute("content") : void 0
        }
        function s(t) {
            if (t && !/^wss?:/i.test(t)) {
                const e = document.createElement("a");
                return e.href = t,
                e.href = e.href,
                e.protocol = e.protocol.replace("http", "ws"),
                e.href
            }
            return t
        }
        function r(t) {
            if (null == t) {
                const e = o("url");
                t = e || f.default_mount_path
            }
            return new R(s(t))
        }
        function c() {
            a.enabled = !0
        }
        function l() {
            a.enabled = !1
        }
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var h = {};
        n.d(h, "getConfig", function() {
            return o
        }),
        n.d(h, "createWebSocketURL", function() {
            return s
        }),
        n.d(h, "createConsumer", function() {
            return r
        }),
        n.d(h, "startDebugging", function() {
            return c
        }),
        n.d(h, "stopDebugging", function() {
            return l
        }),
        n.d(h, "Connection", function() {
            return k
        }),
        n.d(h, "ConnectionMonitor", function() {
            return g
        }),
        n.d(h, "Consumer", function() {
            return R
        }),
        n.d(h, "INTERNAL", function() {
            return f
        }),
        n.d(h, "log", function() {
            return i
        }),
        n.d(h, "Subscription", function() {
            return P
        }),
        n.d(h, "Subscriptions", function() {
            return W
        });
        var u = {
            WebSocket: window.WebSocket
        };
        const a = {
            logger: window.console,
            enabled: !1
        }
          , d = ()=>(new Date).getTime()
          , p = t=>(d() - t) / 1e3
          , b = (t,e,n)=>Math.max(e, Math.min(n, t));
        class m {
            constructor(t) {
                this.visibilityDidChange = this.visibilityDidChange.bind(this),
                this.connection = t,
                this.reconnectAttempts = 0
            }
            start() {
                this.isRunning() || (this.startedAt = d(),
                delete this.stoppedAt,
                this.startPolling(),
                document.addEventListener("visibilitychange", this.visibilityDidChange),
                i(`ConnectionMonitor started. pollInterval = ${this.getPollInterval()} ms`))
            }
            stop() {
                this.isRunning() && (this.stoppedAt = d(),
                this.stopPolling(),
                document.removeEventListener("visibilitychange", this.visibilityDidChange),
                i("ConnectionMonitor stopped"))
            }
            isRunning() {
                return this.startedAt && !this.stoppedAt
            }
            recordPing() {
                this.pingedAt = d()
            }
            recordConnect() {
                this.reconnectAttempts = 0,
                this.recordPing(),
                delete this.disconnectedAt,
                i("ConnectionMonitor recorded connect")
            }
            recordDisconnect() {
                this.disconnectedAt = d(),
                i("ConnectionMonitor recorded disconnect")
            }
            startPolling() {
                this.stopPolling(),
                this.poll()
            }
            stopPolling() {
                clearTimeout(this.pollTimeout)
            }
            poll() {
                this.pollTimeout = setTimeout(()=>{
                    this.reconnectIfStale(),
                    this.poll()
                }
                , this.getPollInterval())
            }
            getPollInterval() {
                const {min: t, max: e} = this.constructor.pollInterval
                  , n = 5 * Math.log(this.reconnectAttempts + 1);
                return Math.round(1e3 * b(n, t, e))
            }
            reconnectIfStale() {
                this.connectionIsStale() && (i(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, pollInterval = ${this.getPollInterval()} ms, time disconnected = ${p(this.disconnectedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`),
                this.reconnectAttempts++,
                this.disconnectedRecently() ? i("ConnectionMonitor skipping reopening recent disconnect") : (i("ConnectionMonitor reopening"),
                this.connection.reopen()))
            }
            connectionIsStale() {
                return p(this.pingedAt ? this.pingedAt : this.startedAt) > this.constructor.staleThreshold
            }
            disconnectedRecently() {
                return this.disconnectedAt && p(this.disconnectedAt) < this.constructor.staleThreshold
            }
            visibilityDidChange() {
                "visible" === document.visibilityState && setTimeout(()=>{
                    !this.connectionIsStale() && this.connection.isOpen() || (i(`ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = ${document.visibilityState}`),
                    this.connection.reopen())
                }
                , 200)
            }
        }
        m.pollInterval = {
            min: 3,
            max: 30
        },
        m.staleThreshold = 6;
        var g = m
          , f = {
            message_types: {
                welcome: "welcome",
                ping: "ping",
                confirmation: "confirm_subscription",
                rejection: "reject_subscription"
            },
            default_mount_path: "/cable",
            protocols: ["actioncable-v1-json", "actioncable-unsupported"]
        };
        const {message_types: S, protocols: v} = f
          , y = v.slice(0, v.length - 1)
          , A = [].indexOf;
        class w {
            constructor(t) {
                this.open = this.open.bind(this),
                this.consumer = t,
                this.subscriptions = this.consumer.subscriptions,
                this.monitor = new g(this),
                this.disconnected = !0
            }
            send(t) {
                return !!this.isOpen() && (this.webSocket.send(JSON.stringify(t)),
                !0)
            }
            open() {
                return this.isActive() ? (i(`Attempted to open WebSocket, but existing socket is ${this.getState()}`),
                !1) : (i(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${v}`),
                this.webSocket && this.uninstallEventHandlers(),
                this.webSocket = new u.WebSocket(this.consumer.url,v),
                this.installEventHandlers(),
                this.monitor.start(),
                !0)
            }
            close({allowReconnect:t}={allowReconnect:!0}) {
                if (t || this.monitor.stop(),
                this.isActive())
                    return this.webSocket ? this.webSocket.close() : void 0
            }
            reopen() {
                if (i(`Reopening WebSocket, current state is ${this.getState()}`),
                !this.isActive())
                    return this.open();
                try {
                    return this.close()
                } catch (t) {
                    i("Failed to reopen WebSocket", t)
                } finally {
                    i(`Reopening WebSocket in ${this.constructor.reopenDelay}ms`),
                    setTimeout(this.open, this.constructor.reopenDelay)
                }
            }
            getProtocol() {
                return this.webSocket ? this.webSocket.protocol : void 0
            }
            isOpen() {
                return this.isState("open")
            }
            isActive() {
                return this.isState("open", "connecting")
            }
            isProtocolSupported() {
                return A.call(y, this.getProtocol()) >= 0
            }
            isState(...t) {
                return A.call(t, this.getState()) >= 0
            }
            getState() {
                for (let t in WebSocket)
                    if (WebSocket[t] === (this.webSocket ? this.webSocket.readyState : void 0))
                        return t.toLowerCase();
                return null
            }
            installEventHandlers() {
                for (let t in this.events) {
                    const e = this.events[t].bind(this);
                    this.webSocket[`on${t}`] = e
                }
            }
            uninstallEventHandlers() {
                for (let t in this.events)
                    this.webSocket[`on${t}`] = function() {}
            }
        }
        w.reopenDelay = 500,
        w.prototype.events = {
            message(t) {
                if (!this.isProtocolSupported())
                    return;
                const {identifier: e, message: n, type: i} = JSON.parse(t.data);
                switch (i) {
                case S.welcome:
                    return this.monitor.recordConnect(),
                    this.subscriptions.reload();
                case S.ping:
                    return this.monitor.recordPing();
                case S.confirmation:
                    return this.subscriptions.notify(e, "connected");
                case S.rejection:
                    return this.subscriptions.reject(e);
                default:
                    return this.subscriptions.notify(e, "received", n)
                }
            },
            open() {
                if (i(`WebSocket onopen event, using '${this.getProtocol()}' subprotocol`),
                this.disconnected = !1,
                !this.isProtocolSupported())
                    return i("Protocol is unsupported. Stopping monitor and disconnecting."),
                    this.close({
                        allowReconnect: !1
                    })
            },
            close(t) {
                if (i("WebSocket onclose event"),
                !this.disconnected)
                    return this.disconnected = !0,
                    this.monitor.recordDisconnect(),
                    this.subscriptions.notifyAll("disconnected", {
                        willAttemptReconnect: this.monitor.isRunning()
                    })
            },
            error() {
                i("WebSocket onerror event")
            }
        };
        var k = w;
        const C = function(t, e) {
            if (null != e)
                for (let n in e) {
                    const i = e[n];
                    t[n] = i
                }
            return t
        };
        class P {
            constructor(t, e={}, n) {
                this.consumer = t,
                this.identifier = JSON.stringify(e),
                C(this, n)
            }
            perform(t, e={}) {
                return e.action = t,
                this.send(e)
            }
            send(t) {
                return this.consumer.send({
                    command: "message",
                    identifier: this.identifier,
                    data: JSON.stringify(t)
                })
            }
            unsubscribe() {
                return this.consumer.subscriptions.remove(this)
            }
        }
        class W {
            constructor(t) {
                this.consumer = t,
                this.subscriptions = []
            }
            create(t, e) {
                const n = t
                  , i = "object" == typeof n ? n : {
                    channel: n
                }
                  , o = new P(this.consumer,i,e);
                return this.add(o)
            }
            add(t) {
                return this.subscriptions.push(t),
                this.consumer.ensureActiveConnection(),
                this.notify(t, "initialized"),
                this.sendCommand(t, "subscribe"),
                t
            }
            remove(t) {
                return this.forget(t),
                this.findAll(t.identifier).length || this.sendCommand(t, "unsubscribe"),
                t
            }
            reject(t) {
                return this.findAll(t).map(t=>(this.forget(t),
                this.notify(t, "rejected"),
                t))
            }
            forget(t) {
                return this.subscriptions = this.subscriptions.filter(e=>e !== t),
                t
            }
            findAll(t) {
                return this.subscriptions.filter(e=>e.identifier === t)
            }
            reload() {
                return this.subscriptions.map(t=>this.sendCommand(t, "subscribe"))
            }
            notifyAll(t, ...e) {
                return this.subscriptions.map(n=>this.notify(n, t, ...e))
            }
            notify(t, e, ...n) {
                let i;
                return (i = "string" == typeof t ? this.findAll(t) : [t]).map(t=>"function" == typeof t[e] ? t[e](...n) : void 0)
            }
            sendCommand(t, e) {
                const {identifier: n} = t;
                return this.consumer.send({
                    command: e,
                    identifier: n
                })
            }
        }
        class R {
            constructor(t) {
                this.url = t,
                this.subscriptions = new W(this),
                this.connection = new k(this)
            }
            send(t) {
                return this.connection.send(t)
            }
            connect() {
                return this.connection.open()
            }
            disconnect() {
                return this.connection.close({
                    allowReconnect: !1
                })
            }
            ensureActiveConnection() {
                if (!this.connection.isActive())
                    return this.connection.open()
            }
        }
        Object.defineProperties(Object.create(h), {
            logger: {
                get: ()=>a.logger,
                set(t) {
                    a.logger = t
                }
            },
            WebSocket: {
                get: ()=>u.WebSocket,
                set(t) {
                    u.WebSocket = t
                }
            }
        }).createConsumer("wss://cable.example.com").subscriptions.create("AppearanceChannel", {})
    }
}, ["./app/scripts/main.js"]);
//# sourceMappingURL=main-c688365013.js.map
