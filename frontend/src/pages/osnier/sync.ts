// @ts-ignore
// @ts-nocheck

import * as THREE from './three/three.module.js';

export class MusicSync {
    listener: THREE.AudioListener;
    music: THREE.Audio;
    analyser: AnalyserNode;
    dataArray: Uint8Array | undefined;
    audioLoader: THREE.AudioLoader;
    startTime: number;
    beat: Map<number, number>;
    musicMap: Map<string, string> | undefined;
    simpleMusicMap: Map<number, {time: number, type: number, handled: boolean}>;
    mapIterator: Iterator<[string, string]> | undefined;
    entry: IteratorResult<[string, string]> | undefined;
    currBeat: {time: number, type: number, handled: boolean} | undefined;
    nextBeat: {time: number, type: number, handled: boolean} | undefined;
    currBeatIdx: number;

    constructor(camera: THREE.Camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        this.music = new THREE.Audio( this.listener );
        this.analyser = this.music.context.createAnalyser();
        this.audioLoader = new THREE.AudioLoader();

        this.simpleMusicMap = new Map();
        this.beat = new Map();
        this.currBeatIdx = 0;
        this.startTime = 0;
    }

    addMusicMap(map: Map<string, string>) {
        this.musicMap = map;
        this.mapIterator = this.musicMap.entries();
        this.entry = this.mapIterator.next();
        let idx = 0;
        let entry = {
            time: 0,
            type: 0,
            handled: false,
        }

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
            }
            this.simpleMusicMap.set(idx, entry);
            idx++;
        });
        this.currBeatIdx = 0;
    }

    findCurrentBeat() {     
        let time = new Date().valueOf() - this.startTime;
        if (this.nextBeat && this.nextBeat.time > time || !this.nextBeat && this.currBeat) {
            let cooldown = 400;
            if (this.nextBeat && this.currBeat
                && this.currBeat.type === 2 && this.currBeat.handled === true
                && this.nextBeat.time < this.currBeat.time + cooldown * 2) {
            }
            return this.currBeat;
        }
        while (true) {
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

    loadMusic(path: string) {
        this.audioLoader.load( path, (buffer) => {
            this.music.setBuffer( buffer );
            this.music.setVolume( 0.5 );
            this.music.loop = true;
            this.music.play();
            this.startTime = new Date().valueOf();
            if (this.music.source) {
                this.music.source.connect(this.analyser);
                this.music.source.onended = (e) => {
                }
            }
                
            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
        }, () => {}, (err) => {});
    }

    playMusic() {
        this.music.stop();
        if (!this.music.isPlaying)
            this.music.play();
        this.startTime = new Date().valueOf();
        if (!this.music.source || !this.musicMap)
            return this.startTime;
        this.music.source.connect(this.analyser);
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
    }

    loadNewSound(path: string) {
        var sound = new THREE.Audio(this.listener);
        this.audioLoader.load( path, (buffer) => {
            sound.setBuffer( buffer );
            sound.setVolume( 0.2 );
            sound.setPlaybackRate(4);
        }, () => {}, (err) => {});
        return sound;
    }
}

function find_medium(array, start, end) {
	var sum = 0;
	for( let i = start; i < end; i++) {
		sum += array[i];
	}
	return sum / (end - start);
}