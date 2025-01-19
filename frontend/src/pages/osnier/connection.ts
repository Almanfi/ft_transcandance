// @ts-ignore
// @ts-nocheck

import { Inputs } from "./player.js";

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

    sendGameEnd(data: any) {
        if (!this.connected) {
            setTimeout(() => {
                this.sendGameEnd(data);
            }, 3000);
            return;
        }
        this.socket?.send(JSON.stringify(data));
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
    }
    onSocketClose(e: Event) {
        this.connected = false;
        this.defaultEventHandler();
    }

    OnSocketError(e: Event) {
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

    close() {
        this.remoteConnection.close();
        this.RTCConnected = false;
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
        const remoteConnection = this.initRemoteConnection();

        let sessionDescription = new RTCSessionDescription(offer);
        remoteConnection.setRemoteDescription(sessionDescription)
        .then(a => {})
        .catch(error => {
        });

        let answer: RTCSessionDescription | null = null;

        let answerPromise = remoteConnection.createAnswer()
        .then(a => remoteConnection.setLocalDescription(a))
        .then(a => {
            answer = remoteConnection.localDescription;
            return answer;
        })
        return answerPromise;
    }

    handleIceCandidate(iceCandidate: RTCIceCandidateInit) {
        if (this.remoteConnection.connectionState === 'closed')
            return null;
        this.remoteConnection.addIceCandidate(iceCandidate);
        return null;
    }

    handleRtcAnswer(answer: RTCSessionDescriptionInit) {
        let sessionDescription = new RTCSessionDescription(answer);
        if (!this.remoteConnection)
            return null;
        if (this.remoteConnection.connectionState === 'closed')
            return null;
        this.remoteConnection.setRemoteDescription(sessionDescription)
        .then(a => {});
        return null;
    }

    createOffer(): Promise<RTCSessionDescription | null> {
        let offer: RTCSessionDescription | null = null;
        let remoteConnection = this.remoteConnection;
        
        let offerPromise = remoteConnection.createOffer().then(o => {
            return remoteConnection.setLocalDescription(o)
        })
        .then(() => {
            offer = remoteConnection.localDescription;
            return offer;
        })
        .catch(error => {
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

    onIceCandidateErr(e: RTCPeerConnectionIceErrorEvent) {
    }

    onDataChannel(e: RTCDataChannelEvent) {
        const channel = e.channel;
        this.sendChannel = channel;
        this.initRtcChannel(channel);
    }

    onDataChannelOpen(e: Event) {
        this.RTCConnected = true;
        this.defaultEventHandler();
    }

    onDataChannelClose(e: Event) {
        this.RTCConnected = false;
        this.defaultEventHandler();
    }

    onConnectionStateChange(e: Event) {
        e.preventDefault();
        if (!this.remoteConnection)
            return;
        if (this.remoteConnection.connectionState === 'disconnected'
            || this.remoteConnection.connectionState === 'failed') {
            this.RTCConnected = false;
            this.remoteConnection.close();
        }
    }

    onIceConnectionStateChange(event: Event) {
        event.preventDefault();
        if (!this.remoteConnection)
            return;
    }

    createIceConfiguration(url: string | null): RTCConfiguration | undefined {
        return undefined;
    }

    initRtcChannel(channel: RTCDataChannel) {
        channel.onmessage = this.onRtcChannelMsgCallback;
        channel.onopen = this.onDataChannelOpen.bind(this);
        channel.onclose = this.onDataChannelClose.bind(this);
    }
}

enum PeerType {
    none = 0,
    host = 1,
    client = 2
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
    isRecieverConnected: boolean;
    isHost: boolean;
    type: PeerType;
    // checkRecieverInterval: number;
    gameStart: (timeStamp: number) => void;
    gameEnded: boolean;
    gameEndedHere: boolean;
    winner: string;
    initRtcStarted: boolean;

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

        this.isRecieverConnected = false;
        this.isHost = false;
        this.type = PeerType.none;
        this.gameEnded = false;
        this.gameEndedHere = false;
        this.winner = "";
        this.initRtcStarted = false;
    }

    checkReciever() {
        if (this.type !== PeerType.none) {
            if (this.type === PeerType.host && !this.initRtcStarted) {
                this.startRtcConnection();
                this.initRtcStarted = true;
                setTimeout(() => {
                    if (this.webRTC && !this.webRTC.RTCConnected) {
                        this.webRTC.close();
                        this.activeProtocol = this.socket;
                        this.initSync();
                    }
                }, 2000);
            }
            return;
        }
        if (this.type === PeerType.none)
            this.send({sync: "ready", reset: true});
        else
            this.send({sync: "ready"});
        setTimeout(() => {
            this.checkReciever();
        }, 400);
    }

    setType(user, gameData) {
        let users = [gameData.team_a[0], gameData.team_b[0]];
    
        let type = PeerType.none;
        if (user.id === gameData.team_a[0].id)
            this.setAsHost();
        else if (user.id === gameData.team_b[0].id)
            this.setAsClient();
    }

    setAsClient() {
        this.type = PeerType.client;
        this.isRecieverConnected = true;
        this.isHost = false;
    }

    setAsHost() {
        this.type = PeerType.host;
        this.isRecieverConnected = true;
        this.isHost = true;
    }

    setGameAsDone() {
        this.gameEndedHere = true;
        this.socket.send(JSON.stringify({done: "end", winner: this.winner}));
    }

    sendGameEndToServer(gameId: string, myScore: boolean) {
        let data = {
            "type": "game.status",
            "game_id": gameId,
            "won": myScore
        };
        this.socket.sendGameEnd(data);
    }

    reset() {
        this.recievedData.clear();
        this.recievedDataOrder = 1;
        this.gameEnded = false;
        this.gameEndedHere = false;
    }

    recheckConnection() {
        if (this.webRTC && this.webRTC.RTCConnected){
            this.activeProtocol = this.webRTC;
            this.initSync();
        }
        else if (this.socket.connected) {
            this.activeProtocol = this.socket;
            this.checkReciever();
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
        if (socketPayload.status == "sent")
            return;
        if (data.rtc)
            return this.handleRtcCnx(data)
        if (!socketPayload.from)
            return;
        this.handleData(data);
    }

    handleRtcMessage(e: MessageEvent) {
        try {
            let data = JSON.parse(e.data);
            this.handleData(data);
        } catch (e) {}
    }

    handleRtcIceCandidate(e: RTCPeerConnectionIceEvent) {
        let iceCandidate = e.candidate;
        if (!iceCandidate)
            return;
        this.activeProtocol.send({rtc: true, iceCandidate: iceCandidate});
    }

    attatchGameStart(startGame: (timeStamp: number) => void) {
        this.startGame = startGame;
    }

    startGame(timeStamp: number) {
        setTimeout(() => {
        }, timeStamp - new Date().valueOf());
    }

    startRtcConnection() {
        if (this.webRTC && this.webRTC.RTCConnected)
            return;
        this.webRTC = new WebRtcCnx(this.handleRtcIceCandidate.bind(this),
                        this.handleRtcMessage.bind(this));
        this.webRTC.changeDefaultEventHandler(this.recheckConnection.bind(this));
        let offerPromise = this.webRTC.startRtcConnection();
        offerPromise?.then(offer => {
            this.activeProtocol.send({rtc: true, offer: offer});
        });
    }

    send(msg) {
        if (this.gameEndedHere)
            return;
        this.activeProtocol.send(msg);
    }

    handleData(data) {
        if (data.sync) {
            this.handleSyncWithPeer(data);
        }
        else {
            this.handlePlayerAction(data);
        }
    }

    hasRecievedData(): boolean {
        return (this.recievedData.has(this.recievedDataOrder));
    }

    getLastReceiveTime(): number {
        let lastRecieved = this.recievedDataOrder - 1;
        if (lastRecieved < 0)
            lastRecieved = 0;
        let data = this.recievedData.get(lastRecieved);
        if (!data)
            return 0;
        return Inputs.findTimeStamp(data);
    }

    getRecievedDataOrdered() : string | undefined {
        let data = this.recievedData.get(this.recievedDataOrder);
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
        let samplesize = 50;

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
        if (data.sync === "end") {
            this.gameEnded = true;
            this.winner = data.winner;
            return;
        }
        if (data.sync === "ready") {
            this.isRecieverConnected = true;
            if (data.reset) {
                this.type = PeerType.none;
                this.webRTC = null;
            }
            if (data.isHost) {
                this.isHost = true;
                this.type = PeerType.host;
                this.send({ sync: "ready"});
            }
            else {
                this.type = PeerType.client;
                this.send({ sync: "ready", isHost: true});
            }
            return;
        }
        else if (data.sync === "sync")
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


    initSync() {
        this.send(JSON.stringify({ sync: "ping", timestamp: new Date().valueOf()}));
    }

    signalStart() {
        let startTime = 4 * 1000;
        let time = new Date().valueOf() + startTime;
        this.send(JSON.stringify({ sync: "sync", startAt: time}));
        this.startGame(time);
    }

    syncWithPeer(data) {
        if (data.startAt) {
            if (this.timeDiffAvrg === 0) {
                this.initSync();
                return;
            }
            let mytime = new Date().valueOf() + 1000;
            let convertedTime = data.startAt - this.timeDiffAvrg;
            this.startGame(convertedTime);
            return;
        }

        if (data.setTimeData) {
            this.peerTimeDiff = - data.timeDiffAvrg;
            this.initSync();
        }

        if (data.showTime) {
            this.signalStart();
            this.showTime(data);
        }

        if (data.getTime) {
            this.send(JSON.stringify({ sync: "sync", timestamp: data.timestamp, peerClock: new Date().valueOf(), showTime: true}));
            return;
        }
    }

    showTime(data) {
        let currentPing = new Date().valueOf() - data.timestamp;
        if (data.setTimeData || this.peerTimeDiff !== 0)
            return;
        this.send(JSON.stringify({ sync: "sync", timestamp: data.timestamp, peerClock: new Date().valueOf(), showTime: true,
            setTimeData: true, timeDiffAvrg: this.timeDiffAvrg, pingAvrg: this.pingAvrg
        }));
        return;
    }

}
