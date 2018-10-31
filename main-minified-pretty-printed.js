webpackJsonp(["main"], {
    "./app/scripts/main.js": function(t, e, n) {
        "use strict";
        function i(...t) {
            c.enabled && (t.push(Date.now()),
            c.logger.log("[ActionCable]", ...t))
        }
        function s(t) {
            const e = document.head.querySelector(`meta[name='action-cable-${t}']`);
            return e ? e.getAttribute("content") : void 0
        }
        function o(t) {
            if (t && !/^wss?:/i.test(t)) {
                const e = document.createElement("a");
                return e.href = t,
                e.href = e.href,
                e.protocol = e.protocol.replace("http", "ws"),
                e.href
            }
            return t
        }
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var r = {
            WebSocket: window.WebSocket
        };
        const c = {
            logger: window.console,
            enabled: !1
        }
          , l = ()=>(new Date).getTime()
          , h = t=>(l() - t) / 1e3
          , a = (t,e,n)=>Math.max(e, Math.min(n, t));
        class u {
            constructor(t) {
                this.visibilityDidChange = this.visibilityDidChange.bind(this),
                this.connection = t,
                this.reconnectAttempts = 0
            }
            start() {
                this.isRunning() || (this.startedAt = l(),
                delete this.stoppedAt,
                this.startPolling(),
                document.addEventListener("visibilitychange", this.visibilityDidChange),
                i(`ConnectionMonitor started. pollInterval = ${this.getPollInterval()} ms`))
            }
            stop() {
                this.isRunning() && (this.stoppedAt = l(),
                this.stopPolling(),
                document.removeEventListener("visibilitychange", this.visibilityDidChange),
                i("ConnectionMonitor stopped"))
            }
            isRunning() {
                return this.startedAt && !this.stoppedAt
            }
            recordPing() {
                this.pingedAt = l()
            }
            recordConnect() {
                this.reconnectAttempts = 0,
                this.recordPing(),
                delete this.disconnectedAt,
                i("ConnectionMonitor recorded connect")
            }
            recordDisconnect() {
                this.disconnectedAt = l(),
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
                return Math.round(1e3 * a(n, t, e))
            }
            reconnectIfStale() {
                this.connectionIsStale() && (i(`ConnectionMonitor detected stale connection. reconnectAttempts = ${this.reconnectAttempts}, pollInterval = ${this.getPollInterval()} ms, time disconnected = ${h(this.disconnectedAt)} s, stale threshold = ${this.constructor.staleThreshold} s`),
                this.reconnectAttempts++,
                this.disconnectedRecently() ? i("ConnectionMonitor skipping reopening recent disconnect") : (i("ConnectionMonitor reopening"),
                this.connection.reopen()))
            }
            connectionIsStale() {
                return h(this.pingedAt ? this.pingedAt : this.startedAt) > this.constructor.staleThreshold
            }
            disconnectedRecently() {
                return this.disconnectedAt && h(this.disconnectedAt) < this.constructor.staleThreshold
            }
            visibilityDidChange() {
                "visible" === document.visibilityState && setTimeout(()=>{
                    !this.connectionIsStale() && this.connection.isOpen() || (i(`ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = ${document.visibilityState}`),
                    this.connection.reopen())
                }
                , 200)
            }
        }
        u.pollInterval = {
            min: 3,
            max: 30
        },
        u.staleThreshold = 6;
        var d = u
          , p = {
            message_types: {
                welcome: "welcome",
                ping: "ping",
                confirmation: "confirm_subscription",
                rejection: "reject_subscription"
            },
            default_mount_path: "/cable",
            protocols: ["actioncable-v1-json", "actioncable-unsupported"]
        };
        const {message_types: m, protocols: b} = p
          , g = b.slice(0, b.length - 1)
          , f = [].indexOf;
        class v {
            constructor(t) {
                this.open = this.open.bind(this),
                this.consumer = t,
                this.subscriptions = this.consumer.subscriptions,
                this.monitor = new d(this),
                this.disconnected = !0
            }
            send(t) {
                return !!this.isOpen() && (this.webSocket.send(JSON.stringify(t)),
                !0)
            }
            open() {
                return this.isActive() ? (i(`Attempted to open WebSocket, but existing socket is ${this.getState()}`),
                !1) : (i(`Opening WebSocket, current state is ${this.getState()}, subprotocols: ${b}`),
                this.webSocket && this.uninstallEventHandlers(),
                this.webSocket = new r.WebSocket(this.consumer.url,b),
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
                return f.call(g, this.getProtocol()) >= 0
            }
            isState(...t) {
                return f.call(t, this.getState()) >= 0
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
        v.reopenDelay = 500,
        v.prototype.events = {
            message(t) {
                if (!this.isProtocolSupported())
                    return;
                const {identifier: e, message: n, type: i} = JSON.parse(t.data);
                switch (i) {
                case m.welcome:
                    return this.monitor.recordConnect(),
                    this.subscriptions.reload();
                case m.ping:
                    return this.monitor.recordPing();
                case m.confirmation:
                    return this.subscriptions.notify(e, "connected");
                case m.rejection:
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
        var S = v;
        const y = function(t, e) {
            if (null != e)
                for (let n in e) {
                    const i = e[n];
                    t[n] = i
                }
            return t
        };
        class A {
            constructor(t, e={}, n) {
                this.consumer = t,
                this.identifier = JSON.stringify(e),
                y(this, n)
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
        class w {
            constructor(t) {
                this.consumer = t,
                this.subscriptions = []
            }
            create(t, e) {
                const n = t
                  , i = "object" == typeof n ? n : {
                    channel: n
                }
                  , s = new A(this.consumer,i,e);
                return this.add(s)
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
        class k {
            constructor(t) {
                this.url = t,
                this.subscriptions = new w(this),
                this.connection = new S(this)
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
        (function(t) {
            if (null == t) {
                const e = s("url");
                t = e || p.default_mount_path
            }
            return new k(o(t))
        }
        )("wss://cable.example.com").subscriptions.create("AppearanceChannel", {})
    }
}, ["./app/scripts/main.js"]);
//# sourceMappingURL=main-1b880f4692.js.map
