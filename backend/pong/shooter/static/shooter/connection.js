
export class Connection {
    constructor(keyControls, playerSyncData) {
        this.socket = null;
        this.webRTC = null;
        this.iceCount = 0;
        this.keyControls = keyControls;
        this.playerSyncData = playerSyncData;
        this.pingInterval = null;
        this.RtcConnected = false;
        this.ping = new Array();
        this.ping.size = 0;
        // this.remoteTimestamp = new Array();
        // this.localTimestamp = new Array();
        this.pingAvrg = 0;
        this.timeDiff = new Array();
        this.timeDiffAvrg = 0;
    }

    attatchGameStart(startGame) {
        this.startGame = startGame;
    }

    startGame(timeStamp) {
        setTimeout(() => {
            console.log("game started");
        }, timeStamp - performance.now());
    }

    sendAdapter(msg) {
        this.send(msg);
    }

    send(msg) {
    }
    
    
    connectToServer(reciever) {
        let address = 'wss://' + window.location.host + '/ws/roll/';
        this.initSocket(address, reciever);
    }

    onSocketOpen(e) {
        console.log('socket open', e);
            console.log("attaching socket to ", this.socket.recieverId);
            // this.keyControls.attachSocket(this.socket, this.socket.recieverId);
            this.keyControls.attachConnection(this);
            this.send = this.sendSocketMsg;
            
            this.startRtcConnection();  //  --------------------------------------------- start RTC connection on socket open
    }

    initSocket(address, reciever) {
        this.socket = new WebSocket(address);
        this.socket.recieverId = reciever;
        // this.socket.keyControls = this.keyControls;
        this.socket.onopen = this.onSocketOpen.bind(this);
        this.socket.onmessage = this.handleSocketMessage.bind(this);
        this.socket.onclose = function(e) {
            if (this.send === this.sendSocketMsg)
                this.send =  () => {};
            console.log('socket close', e);
        };
        this.socket.onerror = function(e) {
            console.log('error', e);
        };
    }

    async handleSocketMessage(e) {
        let data = JSON.parse(e.data).message;
        if (JSON.parse(e.data).status == "sent")
            return;
        if (data.offer)
            return this.handleRtcOffer(data.offer);
        else if (data.answer)
            return this.handleRtcAnswer(data.answer);
        else if (data.iceCandidate)
            return this.handleIceCandidate(data.iceCandidate);
        if (!JSON.parse(e.data).from)
            return;
        this.handlePlayerAction(data);

        // if (data.move)
        //     this.playerSyncData.move = Object.assign(this.playerSyncData.move, data.move);
        // if (data.position) {
        //     console.log('recieved position');
        //     this.playerSyncData.position = data.position;
        // }
        // else
        //     this.playerSyncData.position = null;
    }

    async handleRtcOffer(offer) {
        if (this.RtcConnected)
            return;
        // if (this.webRTC)    //  --------------------------------------------- stop if already connected
        //     return;
        console.log('recieved offer');
        const remoteConnection = this.initRemoteConnection();

        remoteConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(a=>console.log("done"))
        .catch(error => {
            console.error("Error setting offer: ", error);
        });

        await remoteConnection.createAnswer().then(a => remoteConnection.setLocalDescription(a)).then(a=> {
            console.log('Sending answer: ', remoteConnection.localDescription);
            this.sendSocketMsg({ answer: remoteConnection.localDescription });
            // webRTC.remoteConnection = remoteConnection;
            // webRTC.sendChannel = null;
        })
    }

    handleIceCandidate(iceCandidate) {
        console.log('recieved ice candidate');
        console.log(iceCandidate);
        if (!this.webRTC) {
            this.cache = [];
            this.cache.push(iceCandidate);
            console.log('recieved ice candidate before webRTC is ready');
            return;
        }
        console.log('webRTC: ', this.webRTC);
        if (this.webRTC.remoteConnection)
            this.webRTC.remoteConnection.addIceCandidate(iceCandidate);
        else if (this.webRTC.localConnection)
            this.webRTC.localConnection.addIceCandidate(iceCandidate);
    }

    async handleRtcAnswer(answer) {
        console.log('recieved answer');
        this.webRTC.localConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .then(a=>console.log("done"));
        return;
    }

    onIceCandidate(e, callback) {
        if (!e.candidate)
            return;
        console.log("New ICE candidate: ", e.candidate);
        this.sendSocketMsg({ iceCandidate: e.candidate });
        // if (this.iceCount === 1) {
        //     callback();
        // }
        this.iceCount++;
    }

    onIceCandidateErr(e) {
        console.error(`ICE Candidate Error: ${e.errorText} (Code: ${e.errorCode})`);
        console.error(`URL: ${e.url}`);
        console.error(`Address: ${e.address}`);
        console.error(`Port: ${e.port}`);
        console.error(`Host Candidate: ${e.hostCandidate}`);
    }

    onDataChannel(e) {
        const receiveChannel = e.channel;
        this.initRtcChannel(receiveChannel);
        this.webRTC.remoteConnection.channel = receiveChannel;
        // remoteConnection.channel = receiveChannel;
    }

    onDataChannelOpen(e) {
        console.log("open!!!!");
        this.send = this.sendRtcMsg;
        console.log("sending message by RTC");
        this.startPing();
        this.RtcConnected = true;
        if (this.webRTC.remoteConnection)
            this.initSync();
    }

    onDataChannelClose(e) {
        console.log("closed!!!!!!");
        if (this.send === this.sendRtcMsg)
            this.send =  this.sendSocketMsg;

        this.stopPing();
        this.iceCount = 0;
        this.RtcConnected = false;
    }

    initRemoteConnection () {
        this.webRTC = { };
        let iceConfiguration = null;
        // const iceConfiguration = {
        //     iceServers: [
        //         {urls: null}
        //     ],
        //     iceCandidatePoolSize: 1,
        //     sdpSemantics: 'unified-plan',


        // };
        this.webRTC.remoteConnection = new RTCPeerConnection(iceConfiguration);
        let remoteConnection = this.webRTC.remoteConnection;

        remoteConnection.addEventListener('connectionstatechange', event => {
            // event.preventDefault();
            console.log('+++++++++++++++++++++++++++++++connection state: ', remoteConnection.connectionState);
            if (remoteConnection.connectionState === 'disconnected') {
                console.log('disconnected and closing');
                this.iceCount = 0;
                this.RtcConnected = false;
                remoteConnection.close();
            }
            // if (localConnection.connectionState === 'connected') {
            //     // Peers connected!
            // }
        });
        remoteConnection.addEventListener('iceconnectionstatechange', (event) => {
            event.preventDefault();
            if (remoteConnection.iceConnectionState === 'failed') {
                console.error('ICE connection failed catched by me'); // ---------------------------- catch ICE connection failure
            }
        });

        remoteConnection.onicecandidate = (e) => {this.onIceCandidate(e, this.setupRemoteConnection)};
        remoteConnection.onicecandidateerror = this.onIceCandidateErr.bind(this);
        remoteConnection.ondatachannel= this.onDataChannel.bind(this);
        return remoteConnection;
    }

    setupRemoteConnection() {
        console.log('Sending answer: ', remoteConnection.localDescription);
        this.sendSocketMsg({ answer: this.webRTC.remoteConnection.localDescription });
    }

    sendSocketMsg(msg) {
        // console.log('sending socket msg: ');
        // console.log('sending socket msg: ', msg);
        let data = {
            "type": "chat.message",
            "friend_id": this.socket.recieverId,
            "message": msg
        };
        this.socket.send(JSON.stringify(data));
    }

    sendRtcMsg(msg) {
        // console.log('sending RTC msg: ');
        // console.log('sending RTC msg: ', msg);
        if (this.webRTC.sendChannel)
            this.webRTC.sendChannel.send(msg);
        else
            this.webRTC.remoteConnection.channel.send(msg)
    }

    initRtcChannel(channel) {
        channel.onmessage = this.onRtcChannelMsg.bind(this);
        channel.onopen = this.onDataChannelOpen.bind(this);
        channel.onclose = this.onDataChannelClose.bind(this);
    }


    setupLocalConnection() {
        console.log("Sending offer: ", this.webRTC.localConnection.localDescription);
        this.sendSocketMsg({ offer: this.webRTC.localConnection.localDescription });
    }


    startRtcConnection() {
        this.webRTC = { };
        let iceConfiguration = null;
        // const iceConfiguration = {
        //     iceServers: [
        //         {urls: null}
        //     ]
        // };
        this.webRTC.localConnection = new RTCPeerConnection(iceConfiguration);
        let localConnection = this.webRTC.localConnection;
        localConnection.addEventListener('connectionstatechange', event => {
            // event.preventDefault();
            console.log('+++++++++++++++++++++++++++++++connection state: ', localConnection.connectionState);
            if (localConnection.connectionState === 'disconnected') {
                console.log('disconnected and closing');
                this.iceCount = 0;
                this.RtcConnected = false;
                localConnection.close();
            }
            // if (localConnection.connectionState === 'connected') {
            //     // Peers connected!
            // }
        });
        localConnection.addEventListener('iceconnectionstatechange', (event) => {
            event.preventDefault();
            if (localConnection.iceConnectionState === 'failed') {
                console.error('ICE connection failed catched by me'); // ---------------------------- catch ICE connection failure
            }
        });
        
        localConnection.onicecandidate = (e) => this.onIceCandidate(e, this.setupLocalConnection.bind(this));
        localConnection.onicecandidateerror = this.onIceCandidateErr.bind(this);
        
        this.webRTC.sendChannel = localConnection.createDataChannel("sendChannel");
        this.initRtcChannel(this.webRTC.sendChannel);
        
        localConnection.createOffer().then(o => {return localConnection.setLocalDescription(o)} )
        .then(() => {
            console.log("Sending offer: ", localConnection.localDescription);
            this.sendSocketMsg({ offer: localConnection.localDescription });
            // webRTC.localConnection = localConnection;
            // webRTC.sendChannel = sendChannel;
        }).catch(error => {
            console.error("Error creating offer: ", error);
        });
    }

    onRtcChannelMsg(e) {
        let data = JSON.parse(e.data);
        if (data.type === "ping") {
            this.sendRtcMsg(JSON.stringify({ type: "pong", timestamp: data.timestamp }));
        } else if (data.type === "pong") {
            let pingEndTime = performance.now();
            let latency = pingEndTime - data.timestamp;
            console.log(`Ping: ${latency.toFixed(2)} ms`);
        }
        else {
            this.handlePlayerAction(data);
        }
        // if (data.move)
        //     this.playerSyncData.move = Object.assign(this.playerSyncData.move, data.move);
        // if (data.position) {
        //     console.log('recieved position');
        //     this.playerSyncData.position = data.position;
        // }
        // else 
        //     this.playerSyncData.position = null;
    }

    handlePlayerAction(data) {
        if (data.type === "sync")
            this.handleSyncWithPeer(data);
        if (data.timeStamp)
            this.playerSyncData.makebackUp(data);
        //remove bellow after applying the roolback
        if (data.move)
            this.playerSyncData.move = Object.assign(this.playerSyncData.move, data.move);
        if (data.position) {
            this.playerSyncData.position = data.position;
        }
        else
            this.playerSyncData.position = null;
        if (data.direction)
            this.playerSyncData.direction.copy(data.direction);
        if (data.angle)
            this.playerSyncData.angle = data.angle;
        if (data.mouse)
            this.playerSyncData.Lclick = data.mouse.Lclick;
        this.playerSyncData.newState = true;
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
        this.send(JSON.stringify({ type: "sync", timestamp: performance.now(), ping: true}));
    }

    checkSync() {
        this.send(JSON.stringify({ type: "sync", pingAvrg: this.pingAvrg, timestamp: performance.now()}));
    }

    signalStart() {
        console.log("signaling start");
        let time = performance.now() + 1000;
        this.send(JSON.stringify({ type: "sync", startAt: time}));
        this.startGame(time);
    }

    handleSyncWithPeer(data) {
        let samplesize = 200;

        if (data.startAt) {
            console.log("start in: ", data.startAt);
            if (this.timeDiffAvrg === 0) {
                console.log("time difference not calculated yet");
                return;
            }
            let mytime = performance.now() + 1000;
            let convertedTime = data.startAt - this.timeDiffAvrg;
            console.log("my time is: ", mytime);
            console.log("peer time is: ", convertedTime);
            this.startGame(convertedTime);
            
        }
        if (data.showTime) {
            console.log("my time is: ", performance.now());
            console.log("peer time is: ", data.peerClock);
            console.log("average time difference is: ", this.timeDiffAvrg);
            console.log("ping average is: ", this.pingAvrg);
            let currentPing = performance.now() - data.timestamp;
            console.log("(avrg ping) estimated time is: ", data.peerClock - this.timeDiffAvrg - this.pingAvrg / 2);
            console.log("(curr ping) estimated time is: ", data.peerClock - this.timeDiffAvrg - currentPing / 2);
            return;
        }
        if (data.getTime) {
            this.send(JSON.stringify({ type: "sync", timestamp: data.timestamp, peerClock: performance.now(), showTime: true}));
            return;
        }
        if (this.ping.size === samplesize) {
            this.pingAvrg = this.ping.reduce((a, b) => a + b) / samplesize;
            this.timeDiffAvrg = this.timeDiff.reduce((a, b) => a + b) / samplesize;
            this.ping = new Array();
            this.ping.size = 0;
            this.timeDiff = new Array();
            this.send(JSON.stringify({ type: "sync", getTime: true, timestamp: performance.now()}));
            return;
        }

        if (data.ping) {
            // console.log("ping recieved");
            this.send(JSON.stringify({ type: "sync", timestamp: data.timestamp, peerClock: performance.now(), pong: true}));
        }
        if(data.pong) {
            // console.log("pong recieved");
            let ping = performance.now() - data.timestamp;
            this.ping.size++;
            this.ping.push(ping);
            let timeDiff = data.peerClock - performance.now() - ping / 2;
            this.timeDiff.push(timeDiff);
            this.send(JSON.stringify({ type: "sync", timestamp: performance.now(), ping: true}));
        }

    }

}
