class WebSocketCnx {
    socket: WebSocket | undefined;
    receiver: string
    connected: boolean;

    constructor() {
        this.receiver = "";
        this.connected = false;
    }

    defaultEventHandler(): void {}

    changeDefaultEventHandler(handler: () => void) {
        this.defaultEventHandler = handler;
    }

    send(msg: any) {
        let data = {
            "type": "chat.message",
            "friend_id": this.receiver,
            "message": msg
        };
        if (!this.connected)
            return;
        this.socket?.send(JSON.stringify(data));
    }

    setReciever(receiver: string) {
        this.receiver = receiver;
    }

    connectToServer(socketMsgHandler: (e: MessageEvent) => void) {
        let protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        let socketPort = ":8000";
        let address = protocol + window.location.hostname + socketPort + '/ws/roll/';
        this.initSocket(address, socketMsgHandler);
    }

    onSocketOpen(e: Event) {
        this.connected = true;
        this.defaultEventHandler()
        console.log('socket open', e);
    }
    onSocketClose(e: Event) {
        this.connected = false;
        this.defaultEventHandler()
        console.log('socket close', e);
    }

    OnSocketError(e: Event) {
        console.log('error', e);
    }

    initSocket(address: string, socketMsgHandler: (e: MessageEvent) => void) {
        this.socket = new WebSocket(address);
        this.socket.onopen = this.onSocketOpen.bind(this);
        this.socket.onclose = this.onSocketClose.bind(this);
        this.socket.onerror = this.OnSocketError.bind(this);
        this.socket.onmessage = socketMsgHandler;
    }
}

class WebRtcCnx {
    localConnection: RTCPeerConnection | undefined;
    remoteConnection: RTCPeerConnection;
    sendChannel: RTCDataChannel | undefined;
    RTCConnected: boolean;
    setupRemoteConnectionCallback: ({answer}) => void;
    onIceCandidateCallback: (e: RTCPeerConnectionIceEvent) => void;
    onRtcChannelMsgCallback: (e: MessageEvent) => void;

    constructor(onIceCandidateCallback: (e: RTCPeerConnectionIceEvent) => void,
                onRtcChannelMsg: (e: MessageEvent) => void) {
        this.RTCConnected = false;
        let iceConfiguration = this.createIceConfiguration(null);
        this.remoteConnection = new RTCPeerConnection(iceConfiguration);
        this.onIceCandidateCallback = onIceCandidateCallback;
        this.onRtcChannelMsgCallback = onRtcChannelMsg;
    }

    defaultEventHandler(): void {}

    changeDefaultEventHandler(handler: () => void) {
        this.defaultEventHandler = handler;
    }

    send(msg: any) {
        this.sendChannel?.send(msg);
    }

    startRtcConnection(): Promise<RTCSessionDescription | null> {
        let remoteConnection = this.remoteConnection;
        this.initRemoteConnection();

        this.sendChannel = remoteConnection.createDataChannel("sendChannel");
        this.initRtcChannel(this.sendChannel);
        
        return this.createOffer();
    }

    setupConnection(data: {
        offer?: RTCSessionDescriptionInit;
        answer?: RTCSessionDescriptionInit;
        iceCandidate?: RTCIceCandidateInit;
    }): Promise<RTCSessionDescription | null> | null {
        if (data.offer)
            return this.handleRtcOffer(data.offer);
        else if (data.answer)
            return this.handleRtcAnswer(data.answer);
        else if (data.iceCandidate)
            return this.handleIceCandidate(data.iceCandidate);
        return null;
    }

    handleRtcOffer(offer: RTCSessionDescriptionInit):
                    Promise<RTCSessionDescription | null> {
        console.log('received offer');
        const remoteConnection = this.initRemoteConnection();

        let sessionDescription = new RTCSessionDescription(offer);
        remoteConnection.setRemoteDescription(sessionDescription)
        .then(a => console.log("done"))
        .catch(error => {
            console.error("Error setting offer: ", error);
        });

        let answer: RTCSessionDescription | null = null;

        let answerPromise = remoteConnection.createAnswer()
        .then(a => remoteConnection.setLocalDescription(a))
        .then(a => {
            console.log('Sending answer: ', remoteConnection.localDescription);
            answer = remoteConnection.localDescription;
            return answer;
        })
        return answerPromise;
    }

    handleIceCandidate(iceCandidate: RTCIceCandidateInit) {
        console.log('received ice candidate');
        console.log(iceCandidate);
        this.remoteConnection.addIceCandidate(iceCandidate);
        return null;
    }

    handleRtcAnswer(answer: RTCSessionDescriptionInit) {
        console.log('received answer');

        let sessionDescription = new RTCSessionDescription(answer);
        this.remoteConnection.setRemoteDescription(sessionDescription)
        .then(a => console.log("done"));
        return null;
    }

    createOffer(): Promise<RTCSessionDescription | null> {
        let offer: RTCSessionDescription | null = null;
        let remoteConnection = this.remoteConnection;
        
        let offerPromise = remoteConnection.createOffer().then(o => {
            return remoteConnection.setLocalDescription(o)
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

    initRemoteConnection () {
        let remoteConnection = this.remoteConnection;

        remoteConnection.addEventListener('connectionstatechange',
                            this.onConnectionStateChange.bind(this));
        remoteConnection.addEventListener('iceconnectionstatechange',
                            this.onIceConnectionStateChange.bind(this));
        remoteConnection.onicecandidate = this.onIceCandidateCallback
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

    onIceCandidateErr(e: RTCPeerConnectionIceErrorEvent) {
        console.error(`ICE Candidate Error: ${e.errorText} (Code: ${e.errorCode})`);
        console.error(`URL: ${e.url}`);
        console.error(`Address: ${e.address}`);
        console.error(`Port: ${e.port}`);
    }

    onDataChannel(e: RTCDataChannelEvent) {
        const channel = e.channel;
        this.sendChannel = channel;
        this.initRtcChannel(channel);
        // remoteConnection.channel = receiveChannel;
    }

    onDataChannelOpen(e: Event) {
        console.log("open!!!!");
        this.RTCConnected = true;
        this.defaultEventHandler();
        // this.send = this.sendRtcMsg;
        console.log("sending message by RTC");
        // this.startPing();
        // if (this.webRTC.remoteConnection)
        //     this.initSync();
    }

    onDataChannelClose(e: Event) {
        console.log("closed!!!!!!");
        this.RTCConnected = false;
        this.defaultEventHandler();
        // if (this.send === this.sendRtcMsg)
        //     this.send =  this.sendSocketMsg;

        // this.stopPing();
    }

    onConnectionStateChange(e: Event) {
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

    onIceConnectionStateChange(event: Event) {
        event.preventDefault();
        if (!this.remoteConnection)
            return;
        if (this.remoteConnection.iceConnectionState === 'failed') {
            console.error('ICE connection failed catched by me'); // ---------- catch ICE connection failure
        }
    }

    createIceConfiguration(url: string | null): RTCConfiguration | undefined {
        // const iceConfiguration = {
        //     iceServers: [
        //         {urls: null}
        //     ],
        //     iceCandidatePoolSize: 1,
        //     sdpSemantics: 'unified-plan',
        // };
        return undefined;
    }

    initRtcChannel(channel: RTCDataChannel) {
        channel.onmessage = this.onRtcChannelMsgCallback;
        channel.onopen = this.onDataChannelOpen.bind(this);
        channel.onclose = this.onDataChannelClose.bind(this);
    }

    // onRtcChannelMsg(e: MessageEvent) {
    //     let data = JSON.parse(e.data);
    //     console.log("rtc msg: ", data)
    //     // if (data.type === "ping") {
    //     //     this.sendRtcMsg(JSON.stringify({ type: "pong", timestamp: data.timestamp }));
    //     // } else if (data.type === "pong") {
    //     //     let pingEndTime = new Date().valueOf();
    //     //     let latency = pingEndTime - data.timestamp;
    //     //     console.log(`Ping: ${latency.toFixed(2)} ms`);
    //     // }
    //     // else {
    //     //     this.handlePlayerAction(data);
    //     // }
    // }
}

export class Connection {
    socket: WebSocketCnx;
    webRTC: WebRtcCnx | null;
    activeProtocol: WebRtcCnx | WebSocketCnx;
    recievedData: Map<number, string>;
    recievedDataOrder: number;
    pingInterval: number | null;
    ping: number[];
    pingSize: number;
    pingAvrg: number;
    timeDiff: number[];
    timeDiffAvrg: number;
    peerTimeDiff: number;
    gameStart: (timeStamp: number) => void;

    constructor() {
        this.socket = new WebSocketCnx();
        this.webRTC = null;
        this.activeProtocol = this.socket;

        this.recievedData = new Map();
        this.recievedDataOrder = 1;

        this.pingInterval = null;
        this.ping = new Array();
        this.pingSize = 0;
        this.pingAvrg = 0;
        this.timeDiff = new Array();
        this.timeDiffAvrg = 0;
        this.peerTimeDiff = 0;


    }

    reset() {
        this.recievedData.clear();
        this.recievedDataOrder = 1;
    }

    recheckConnection() {
        if (this.webRTC && this.webRTC.RTCConnected){
            this.activeProtocol = this.webRTC;
            this.initSync();
        }
        else if (this.socket.connected)
            this.activeProtocol = this.socket;
        else {
            let receiver = this.socket.receiver;
            this.socket = new WebSocketCnx();
            this.init(receiver);
            this.activeProtocol = this.socket;
        }
    }

    init(receiver: string) {
        this.socket.setReciever(receiver);
        this.socket.changeDefaultEventHandler(this.recheckConnection.bind(this))
        this.socket.connectToServer(this.handleSocketMessage.bind(this));
    }

    handleRtcCnx(data:  {
                            offer?: RTCSessionDescriptionInit;
                            answer?: RTCSessionDescriptionInit;
                            iceCandidate?: RTCIceCandidateInit;
                        }) {
        if (!this.webRTC) {
            this.webRTC = new WebRtcCnx(this.handleRtcIceCandidate.bind(this),
                                        this.handleRtcMessage.bind(this));
            this.webRTC.changeDefaultEventHandler(this.recheckConnection.bind(this))
            this.webRTC.initRemoteConnection();
        }
        if (this.webRTC.RTCConnected)
            return;
        let sessionDescriptionPromise = this.webRTC.setupConnection(data);
        sessionDescriptionPromise?.then(a => {
            if (a)
                this.send({rtc: true, answer: a})
        });
    }

    handleSocketMessage(e: MessageEvent) {
        let socketPayload = JSON.parse(e.data);
        let data = socketPayload.message;
        // console.log("socket message: ", data);
        if (socketPayload.status == "sent")
            return;
        if (data.rtc)
            return this.handleRtcCnx(data)
        if (!socketPayload.from)
            return;
        this.handleData(data);
    }

    handleRtcMessage(e: MessageEvent) {
        let data = JSON.parse(e.data);
        // console.log("rtc msg: ", data)
        this.handleData(data);
    }

    handleRtcIceCandidate(e: RTCPeerConnectionIceEvent) {
        let iceCandidate = e.candidate;
        if (!iceCandidate)
            return;
        this.activeProtocol.send({rtc: true, iceCandidate: iceCandidate});
        console.log("sent New ICE candidate: ", iceCandidate);// ---------- send ICE candidate
    }

    attatchGameStart(startGame: (timeStamp: number) => void) {
        this.startGame = startGame;
    }

    startGame(timeStamp: number) {
        setTimeout(() => {
            console.log("game started");
        }, timeStamp - new Date().valueOf());
    }

    send(msg) {
        this.activeProtocol.send(msg);
        if (this.webRTC)
            return;
        console.log("init rtc");
        this.webRTC = new WebRtcCnx(this.handleRtcIceCandidate.bind(this),
                        this.handleRtcMessage.bind(this));
        this.webRTC.changeDefaultEventHandler(this.recheckConnection.bind(this))
        let offerPromise = this.webRTC.startRtcConnection();
        offerPromise?.then(offer => {
            this.activeProtocol.send({rtc: true, offer: offer});
        });
    }

    handleData(data) {
        if (data.sync) {
            this.handleSyncWithPeer(data);
        }
        else {
            this.handlePlayerAction(data);
        }
        // if (data.type === "ping") {
        //     this.send(JSON.stringify({ type: "pong", timestamp: data.timestamp }));
        // }
        // else if (data.type === "pong") {
        //     let pingEndTime = new Date().valueOf();
        //     let latency = pingEndTime - data.timestamp;
        //     console.log(`Ping: ${latency.toFixed(2)} ms`);
        // }
        // else {
        //     this.handlePlayerAction(data);
        // }
    }

    hasRecievedData(): boolean {
        return (this.recievedData.has(this.recievedDataOrder));
    }

    getRecievedDataOrdered() : string | undefined {
        let data = this.recievedData.get(this.recievedDataOrder);
        // if (data)
        //     this.recievedDataOrder++;
        // this.recievedData.delete(order);
        return data;
    }

    next() {
        if (this.recievedData.has(this.recievedDataOrder))
            this.recievedDataOrder++;
    }

    handlePlayerAction(data) {
        if (data.order) {
            this.recievedData.set(data.order, data.info);
        }
    }

    isPingDone() {
        let samplesize = 200;

        if (this.pingSize !== samplesize)
            return false;
        this.pingAvrg = this.ping.reduce((a, b) => a + b) / samplesize;
        this.timeDiffAvrg = this.timeDiff.reduce((a, b) => a + b) / samplesize;
        this.ping = new Array();
        this.pingSize = 0;
        this.timeDiff = new Array();
        this.send(JSON.stringify({ sync: "sync", getTime: true, timestamp: new Date().valueOf()}));
        return true;
    }

    handleSyncWithPeer(data) {
        let samplesize = 200;
        
        if (data.sync === "sync")
            this.syncWithPeer(data);
        else if (data.sync === "ping") {
            this.send(JSON.stringify({ sync: "pong", timestamp: data.timestamp, peerClock: new Date().valueOf()}));
        }
        else if(data.sync === "pong") {
            let ping = new Date().valueOf() - data.timestamp;
            this.pingSize++;
            this.ping.push(ping);
            let timeDiff = data.peerClock - new Date().valueOf() - ping / 2;
            this.timeDiff.push(timeDiff);
            if (this.isPingDone())
                return;
            this.send(JSON.stringify({ sync: "ping", timestamp: new Date().valueOf(), ping: true}));
        }
    }

    // startPing() {
    //     // this.pingInterval = setInterval(() => {
    //     //     this.sendRtcMsg(JSON.stringify({ type: "ping", timestamp: new Date().valueOf() }));
    //     // }, 1000);
    // }

    // stopPing() {
    //     // clearInterval(this.pingInterval);
    // }

    initSync() {
        this.send(JSON.stringify({ sync: "ping", timestamp: new Date().valueOf()}));
    }

    // checkSync() {
    //     this.send(JSON.stringify({ type: "sync", pingAvrg: this.pingAvrg, timestamp: new Date().valueOf()}));
    // }

    signalStart() {
        console.log("signaling start");
        let time = new Date().valueOf() + 1000;
        this.send(JSON.stringify({ sync: "sync", startAt: time}));
        this.startGame(time);
    }

    syncWithPeer(data) {
        if (data.startAt) {
            console.log("start in: ", data.startAt);
            if (this.timeDiffAvrg === 0) {
                console.log("time difference not calculated yet");
                this.initSync();
                return;
            }
            let mytime = new Date().valueOf() + 1000;
            let convertedTime = data.startAt - this.timeDiffAvrg;
            console.log("my time is: ", mytime);
            console.log("peer time is: ", convertedTime);
            this.startGame(convertedTime);
            return;
        }

        if (data.setTimeData) {
            this.peerTimeDiff = - data.timeDiffAvrg;
            this.initSync();
        }

        if (data.showTime) {
            this.showTime(data);
        }

        if (data.getTime) {
            this.send(JSON.stringify({ sync: "sync", timestamp: data.timestamp, peerClock: new Date().valueOf(), showTime: true}));
            return;
        }
    }

    showTime(data) {
        console.log("my time is: ", new Date().valueOf());
        console.log("peer time is: ", data.peerClock);
        console.log("average time difference is: ", this.timeDiffAvrg);
        console.log("ping average is: ", this.pingAvrg);
        let currentPing = new Date().valueOf() - data.timestamp;
        console.log("(avrg ping) estimated time is: ", data.peerClock - this.timeDiffAvrg - this.pingAvrg / 2);
        console.log("(curr ping) estimated time is: ", data.peerClock - this.timeDiffAvrg - currentPing / 2);

        if (data.setTimeData || this.peerTimeDiff !== 0)
            return;
        this.send(JSON.stringify({ sync: "sync", timestamp: data.timestamp, peerClock: new Date().valueOf(), showTime: true,
            setTimeData: true, timeDiffAvrg: this.timeDiffAvrg, pingAvrg: this.pingAvrg
        }));
        return;
    }

}
