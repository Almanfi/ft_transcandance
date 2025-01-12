import * as THREE from 'three';
export class MusicSync {
    // musicPlaying: boolean;
    // frequancies: Map<number, Uint8Array>;
    // chosenFreq: number;
    // lowestAmplitude: number;
    // lastAmplitude: number;
    // keepFiring: boolean;
    // lastBeatTime: number;
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        this.music = new THREE.Audio(this.listener);
        this.analyser = this.music.context.createAnalyser();
        this.audioLoader = new THREE.AudioLoader();
        this.simpleMusicMap = new Map();
        this.beat = new Map();
        this.currBeatIdx = 0;
        this.startTime = 0;
    }
    addMusicMap(map) {
        this.musicMap = map;
        this.mapIterator = this.musicMap.entries();
        this.entry = this.mapIterator.next();
        let idx = 0;
        let entry = {
            time: 0,
            type: 0,
            handled: false,
        };
        this.simpleMusicMap.set(idx++, entry);
        map.forEach((value, key) => {
            let type;
            if (value === "0" || value === "2")
                type = 1;
            else if (value === "1" || value === "3")
                type = 2;
            else
                type = 0;
            let entry = {
                time: parseInt(key),
                type: type,
                handled: false,
            };
            this.simpleMusicMap.set(idx, entry);
            idx++;
        });
        this.currBeatIdx = 0;
        // this.currBeat = this.simpleMusicMap.get(this.currBeatIdx);
        // console.log("simple music map: ", this.simpleMusicMap);
    }
    findCurrentBeat() {
        let time = new Date().valueOf() - this.startTime;
        if (this.nextBeat && this.nextBeat.time > time || !this.nextBeat && this.currBeat) {
            let cooldown = 400;
            if (this.nextBeat && this.currBeat
                && this.currBeat.type === 2 && this.currBeat.handled === true
                && this.nextBeat.time < this.currBeat.time + cooldown * 2) {
                // this.currBeat.time = this.currBeat.time - cooldown;
                // this.currBeat.handled = false
            }
            return this.currBeat;
        }
        while (true) { // this is very unsafe in case of low performance
            let entry = this.simpleMusicMap.get(this.currBeatIdx);
            if (!entry)
                return this.currBeat;
            if (entry.time >= time)
                break;
            this.currBeatIdx++;
        }
        this.nextBeat = this.simpleMusicMap.get(this.currBeatIdx);
        this.currBeat = this.simpleMusicMap.get(this.currBeatIdx - 1);
        return this.currBeat;
    }
    // nextBeat() {
    //     var beat = { value: 0, new: false };
    //     let holdInterval = 400;
    //     if (this.entry.value[0] > new Date().valueOf() - this.startTime) {
    //         // if (this.keepFiring) {
    //         if (this.keepFiring && new Date().valueOf() - this.lastBeatTime > holdInterval) {
    //             this.lastBeatTime = new Date().valueOf();
    //             beat.value = 2;
    //         }
    //         return beat;
    //     }
    //     this.keepFiring = false;
    //     if (this.entry.done)
    //         return beat;
    //     let next = this.mapIterator.next();
    //     if (next.done)
    //         return beat;
    //     let value = this.entry.value[1];
    //     this.entry = next;
    //     beat.new = true;
    //     if (value === "0" || value === "2") {
    //         beat.value = 1;
    //     }
    //     else if (value === "1" || value === "3") {
    //         if (new Date().valueOf() - this.lastBeatTime > holdInterval) {
    //             beat.value = 2;
    //             this.lastBeatTime = new Date().valueOf();
    //         }
    //         beat.value = 2;
    //         this.keepFiring = true;
    //     }
    //     return beat;
    // }
    loadMusic(path) {
        this.audioLoader.load(path, (buffer) => {
            this.music.setBuffer(buffer);
            // this.music.setLoop( true );
            this.music.setVolume(0.5);
            this.music.play();
            this.startTime = new Date().valueOf();
            // this.musicPlaying = true;
            if (this.music.source) {
                this.music.source.connect(this.analyser);
                this.music.source.onended = (e) => {
                    console.log("music ended");
                    // this.musicPlaying = false;
                    console.log(this.beat);
                    // this.keepFiring = false;
                };
            }
            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            console.log("buffer size ", bufferLength);
            console.log("sound playing");
        }, () => { }, (err) => { console.log("loading sound err: ", err); });
    }
    playMusic() {
        this.music.stop();
        if (!this.music.isPlaying)
            this.music.play();
        this.startTime = new Date().valueOf();
        if (!this.music.source || !this.musicMap)
            return this.startTime;
        this.music.source.connect(this.analyser);
        // this.keepFiring = false;
        this.mapIterator = this.musicMap.entries();
        this.entry = this.mapIterator.next();
        this.currBeatIdx = 0;
        this.currBeat = undefined;
        this.nextBeat = undefined;
        this.simpleMusicMap.forEach((value, key) => {
            value.handled = false;
        });
        return this.startTime;
    }
    stopMusic() {
        this.music.stop();
        // this.fqLog.index = 0;
    }
    loadNewSound(path) {
        var sound = new THREE.Audio(this.listener);
        this.audioLoader.load(path, (buffer) => {
            sound.setBuffer(buffer);
            sound.setVolume(0.2);
            sound.setPlaybackRate(4);
        }, () => { }, (err) => { console.log("loading sound err: ", err); });
        return sound;
    }
}
function find_medium(array, start, end) {
    var sum = 0;
    for (let i = start; i < end; i++) {
        sum += array[i];
    }
    return sum / (end - start);
}
