class WebSocketCnx {
    constructor() {
        this.receiver = "";
        this.connected = false;
    }
    defaultEventHandler() { }
    changeDefaultEventHandler(handler) {
        this.defaultEventHandler = handler;
    }
    send(msg) {
        var _a;
        let data = {
            "type": "chat.message",
            "friend_id": this.receiver,
            "message": msg
        };
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(data));
    }
    setReciever(receiver) {
        this.receiver = receiver;
    }
    connectToServer(socketMsgHandler) {
        let protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        let address = protocol + window.location.host + '/ws/roll/';
        this.initSocket(address, socketMsgHandler);
    }
    onSocketOpen(e) {
        this.connected = true;
        this.defaultEventHandler();
        console.log('socket open', e);
    }
    onSocketClose(e) {
        this.connected = false;
        this.defaultEventHandler();
        console.log('socket close', e);
    }
    OnSocketError(e) {
        console.log('error', e);
    }
    initSocket(address, socketMsgHandler) {
        this.socket = new WebSocket(address);
        this.socket.onopen = this.onSocketOpen.bind(this);
        this.socket.onclose = this.onSocketClose.bind(this);
        this.socket.onerror = this.OnSocketError.bind(this);
        this.socket.onmessage = socketMsgHandler;
    }
}
class WebRtcCnx {
    constructor(onIceCandidateCallback, onRtcChannelMsg) {
        this.RTCConnected = false;
        let iceConfiguration = this.createIceConfiguration(null);
        this.remoteConnection = new RTCPeerConnection(iceConfiguration);
        this.onIceCandidateCallback = onIceCandidateCallback;
        this.onRtcChannelMsgCallback = onRtcChannelMsg;
    }
    defaultEventHandler() { }
    changeDefaultEventHandler(handler) {
        this.defaultEventHandler = handler;
    }
    send(msg) {
        var _a;
        (_a = this.sendChannel) === null || _a === void 0 ? void 0 : _a.send(msg);
    }
    startRtcConnection() {
        let remoteConnection = this.remoteConnection;
        this.initRemoteConnection();
        this.sendChannel = remoteConnection.createDataChannel("sendChannel");
        this.initRtcChannel(this.sendChannel);
        return this.createOffer();
    }
    setupConnection(data) {
        if (data.offer)
            return this.handleRtcOffer(data.offer);
        else if (data.answer)
            return this.handleRtcAnswer(data.answer);
        else if (data.iceCandidate)
            return this.handleIceCandidate(data.iceCandidate);
        return null;
    }
    handleRtcOffer(offer) {
        console.log('received offer');
        const remoteConnection = this.initRemoteConnection();
        let sessionDescription = new RTCSessionDescription(offer);
        remoteConnection.setRemoteDescription(sessionDescription)
            .then(a => console.log("done"))
            .catch(error => {
            console.error("Error setting offer: ", error);
        });
        let answer = null;
        let answerPromise = remoteConnection.createAnswer()
            .then(a => remoteConnection.setLocalDescription(a))
            .then(a => {
            console.log('Sending answer: ', remoteConnection.localDescription);
            answer = remoteConnection.localDescription;
            return answer;
        });
        return answerPromise;
    }
    handleIceCandidate(iceCandidate) {
        console.log('received ice candidate');
        console.log(iceCandidate);
        this.remoteConnection.addIceCandidate(iceCandidate);
        return null;
    }
    handleRtcAnswer(answer) {
        console.log('received answer');
        let sessionDescription = new RTCSessionDescription(answer);
        this.remoteConnection.setRemoteDescription(sessionDescription)
            .then(a => console.log("done"));
        return null;
    }
    createOffer() {
        let offer = null;
        let remoteConnection = this.remoteConnection;
        let offerPromise = remoteConnection.createOffer().then(o => {
            return remoteConnection.setLocalDescription(o);
        })
            .then(() => {
            console.log("offer: ", remoteConnection.localDescription);
            offer = remoteConnection.localDescription;
            return offer;
            // this.sendOffer(remoteConnection.localDescription);
        })
            .catch(error => {
            console.error("Error creating offer: ", error);
            return null;
        });
        return offerPromise;
    }
    initRemoteConnection() {
        let remoteConnection = this.remoteConnection;
        remoteConnection.addEventListener('connectionstatechange', this.onConnectionStateChange.bind(this));
        remoteConnection.addEventListener('iceconnectionstatechange', this.onIceConnectionStateChange.bind(this));
        remoteConnection.onicecandidate = this.onIceCandidateCallback;
        remoteConnection.onicecandidateerror = this.onIceCandidateErr.bind(this);
        remoteConnection.ondatachannel = this.onDataChannel.bind(this);
        return remoteConnection;
    }
    // onIceCandidate(e: RTCPeerConnectionIceEvent) {
    //     if (!e.candidate)
    //         return;
    //     console.log("New ICE candidate: ", e.candidate);
    //     console.log('Sending answer: ', this.remoteConnection.localDescription);
    //     this.setupRemoteConnectionCallback({ answer: this.remoteConnection.localDescription });
    //     // this.sendSocketMsg({ answer: this.webRTC.remoteConnection.localDescription });
    //     // this.iceCount++;
    // }
    onIceCandidateErr(e) {
        console.error(`ICE Candidate Error: ${e.errorText} (Code: ${e.errorCode})`);
        console.error(`URL: ${e.url}`);
        console.error(`Address: ${e.address}`);
        console.error(`Port: ${e.port}`);
    }
    onDataChannel(e) {
        const channel = e.channel;
        this.sendChannel = channel;
        this.initRtcChannel(channel);
        // remoteConnection.channel = receiveChannel;
    }
    onDataChannelOpen(e) {
        console.log("open!!!!");
        this.RTCConnected = true;
        this.defaultEventHandler();
        // this.send = this.sendRtcMsg;
        console.log("sending message by RTC");
        // this.startPing();
        // if (this.webRTC.remoteConnection)
        //     this.initSync();
    }
    onDataChannelClose(e) {
        console.log("closed!!!!!!");
        this.RTCConnected = false;
        this.defaultEventHandler();
        // if (this.send === this.sendRtcMsg)
        //     this.send =  this.sendSocketMsg;
        // this.stopPing();
    }
    onConnectionStateChange(e) {
        e.preventDefault();
        console.log('++++++cnx state: ', this.remoteConnection.connectionState);
        if (!this.remoteConnection)
            return;
        if (this.remoteConnection.connectionState === 'disconnected'
            || this.remoteConnection.connectionState === 'failed') {
            console.log('disconnected and closing');
            this.RTCConnected = false;
            this.remoteConnection.close();
        }
    }
    onIceConnectionStateChange(event) {
        event.preventDefault();
        if (!this.remoteConnection)
            return;
        if (this.remoteConnection.iceConnectionState === 'failed') {
            console.error('ICE connection failed catched by me'); // ---------- catch ICE connection failure
        }
    }
    createIceConfiguration(url) {
        // const iceConfiguration = {
        //     iceServers: [
        //         {urls: null}
        //     ],
        //     iceCandidatePoolSize: 1,
        //     sdpSemantics: 'unified-plan',
        // };
        return undefined;
    }
    initRtcChannel(channel) {
        channel.onmessage = this.onRtcChannelMsgCallback;
        channel.onopen = this.onDataChannelOpen.bind(this);
        channel.onclose = this.onDataChannelClose.bind(this);
    }
}
export class Connection {
    constructor() {
        this.socket = new WebSocketCnx();
        this.webRTC = null;
        this.activeProtocol = this.socket;
        this.recievedData = new Map();
        this.recievedDataOrder = 1;
        // this.pingInterval = null;
        // this.RtcConnected = false;
        // this.ping = new Array();
        // this.ping.size = 0;
        // this.pingAvrg = 0;
        // this.timeDiff = new Array();
        // this.timeDiffAvrg = 0;
        // this.peerTimeDiff = 0;
    }
    reset() {
        this.recievedData.clear();
        this.recievedDataOrder = 1;
    }
    recheckConnection() {
        if (this.webRTC && this.webRTC.RTCConnected)
            this.activeProtocol = this.webRTC;
        else if (this.socket.connected)
            this.activeProtocol = this.socket;
        else {
            let receiver = this.socket.receiver;
            this.socket = new WebSocketCnx();
            this.init(receiver);
            this.activeProtocol = this.socket;
        }
    }
    init(receiver) {
        this.socket.setReciever(receiver);
        this.socket.changeDefaultEventHandler(this.recheckConnection.bind(this));
        this.socket.connectToServer(this.handleSocketMessage.bind(this));
    }
    handleRtcCnx(data) {
        if (!this.webRTC) {
            this.webRTC = new WebRtcCnx(this.handleRtcIceCandidate.bind(this), this.handleRtcMessage.bind(this));
            this.webRTC.changeDefaultEventHandler(this.recheckConnection.bind(this));
            this.webRTC.initRemoteConnection();
        }
        if (this.webRTC.RTCConnected)
            return;
        let sessionDescriptionPromise = this.webRTC.setupConnection(data);
        sessionDescriptionPromise === null || sessionDescriptionPromise === void 0 ? void 0 : sessionDescriptionPromise.then(a => {
            if (a)
                this.send({ rtc: true, answer: a });
        });
    }
    handleSocketMessage(e) {
        let socketPayload = JSON.parse(e.data);
        let data = socketPayload.message;
        // console.log("socket message: ", data);
        if (socketPayload.status == "sent")
            return;
        if (data.rtc)
            return this.handleRtcCnx(data);
        if (!socketPayload.from)
            return;
        this.handleData(data);
    }
    handleRtcMessage(e) {
        let data = JSON.parse(e.data);
        console.log("rtc msg: ", data);
        this.handleData(data);
    }
    handleRtcIceCandidate(e) {
        let iceCandidate = e.candidate;
        if (!iceCandidate)
            return;
        this.activeProtocol.send({ rtc: true, iceCandidate: iceCandidate });
        console.log("sent New ICE candidate: ", iceCandidate); // ---------- send ICE candidate
    }
    attatchGameStart(startGame) {
        this.startGame = startGame;
    }
    startGame(timeStamp) {
        setTimeout(() => {
            console.log("game started");
        }, timeStamp - performance.now());
    }
    send(msg) {
        this.activeProtocol.send(msg);
        if (this.webRTC)
            return;
        console.log("init rtc");
        this.webRTC = new WebRtcCnx(this.handleRtcIceCandidate.bind(this), this.handleRtcMessage.bind(this));
        this.webRTC.changeDefaultEventHandler(this.recheckConnection.bind(this));
        let offerPromise = this.webRTC.startRtcConnection();
        offerPromise === null || offerPromise === void 0 ? void 0 : offerPromise.then(offer => {
            this.activeProtocol.send({ rtc: true, offer: offer });
        });
    }
    handleData(data) {
        if (data.type === "ping") {
            this.send(JSON.stringify({ type: "pong", timestamp: data.timestamp }));
        }
        else if (data.type === "pong") {
            let pingEndTime = performance.now();
            let latency = pingEndTime - data.timestamp;
            console.log(`Ping: ${latency.toFixed(2)} ms`);
        }
        else {
            this.handlePlayerAction(data);
        }
    }
    getRecivedDataOrdered() {
        let data = this.recievedData.get(this.recievedDataOrder);
        if (data)
            this.recievedDataOrder++;
        // this.recievedData.delete(order);
        return data;
    }
    handlePlayerAction(data) {
        if (data.order)
            this.recievedData.set(data.order, data.info);
        // if (data.type === "sync")
        //     this.handleSyncWithPeer(data);
        // if (data.timeStamp)
        //     this.playerSyncData.makeBackup(data);
        //remove bellow after applying the roolback
        // if (data.move)
        //     this.playerSyncData.move = Object.assign(this.playerSyncData.move, data.move);
        // if (data.position) {
        //     this.playerSyncData.position = data.position;
        // }
        // else
        //     this.playerSyncData.position = null;
        // if (data.direction)
        //     this.playerSyncData.direction.copy(data.direction);
        // if (data.angle)
        //     this.playerSyncData.angle = data.angle;
        // if (data.mouse)
        //     this.playerSyncData.Lclick = data.mouse.Lclick;
        // this.playerSyncData.newState = true;
    }
    startPing() {
        // this.pingInterval = setInterval(() => {
        //     this.sendRtcMsg(JSON.stringify({ type: "ping", timestamp: performance.now() }));
        // }, 1000);
    }
    stopPing() {
        // clearInterval(this.pingInterval);
    }
    initSync() {
        this.send(JSON.stringify({ type: "sync", timestamp: performance.now(), ping: true }));
    }
    // checkSync() {
    //     this.send(JSON.stringify({ type: "sync", pingAvrg: this.pingAvrg, timestamp: performance.now()}));
    // }
    signalStart() {
        console.log("signaling start");
        let time = performance.now() + 1000;
        this.send(JSON.stringify({ type: "sync", startAt: time }));
        this.startGame(time);
    }
}