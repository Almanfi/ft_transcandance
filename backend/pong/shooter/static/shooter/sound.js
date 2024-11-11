import * as THREE from 'three';

export class MusicSync {
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);


        this.music = new THREE.Audio( this.listener );
        this.analyser = this.music.context.createAnalyser();
        this.dataArray = null;

        this.audioLoader = new THREE.AudioLoader();

        this.fqLog = {
            size: 50,
            lows: new Array(),
            mids: new Array(),
            highs: new Array(),
            index: 0,
        }
        this.startTime = 0;
        this.beat = new Map();
        this.frequancies = new Map();
        this.musicPlaying = false;
        this.chosenFreq = 10;
        this.lowestAmplitude = 0;
        this.lastAmplitude = 0;


        this.musicMap = null;
        this.mapIterator = null;
        this.entry = null;
        this.keepFiring = false;
        this.lastBeatTime = 0;
    }
    addMusicMap(map) {
        this.musicMap = map;
        this.mapIterator = this.musicMap.entries();
        this.entry = this.mapIterator.next();
    }

    nextBeat() {
        var beat = { value: 0, new: false };
        let holdInterval = 400;
        if (this.entry.value[0] > performance.now() - this.startTime) {
            // if (this.keepFiring) {
            if (this.keepFiring && performance.now() - this.lastBeatTime > holdInterval) {
                this.lastBeatTime = performance.now();
                beat.value = 2;
            }
            return beat;
        }
        this.keepFiring = false;
        if (this.entry.done)
            return beat;
        let next = this.mapIterator.next();
        if (next.done)
            return beat;
        let value = this.entry.value[1];
        this.entry = next;
        beat.new = true;
        if (value === "0" || value === "2") {
            beat.value = 1;
        }
        else if (value === "1" || value === "3") {
            if (performance.now() - this.lastBeatTime > holdInterval) {
                beat.value = 2;
                this.lastBeatTime = performance.now();
            }
            beat.value = 2;
            this.keepFiring = true;

        }
        return beat;
    }

    loadMusic(path) {
        this.audioLoader.load( path, (buffer) => {
            this.music.setBuffer( buffer );
            // this.music.setLoop( true );
            this.music.setVolume( 0.5 );
            this.music.play();
            this.startTime = performance.now();
            this.musicPlaying = true;

            this.music.source.connect(this.analyser);

            this.music.source.onended = (e) => {
                console.log("music ended");
                this.musicPlaying = false;
                console.log(this.beat);
                this.keepFiring = false;
            }

            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            console.log("buffer size ", bufferLength);
            console.log("sound playing");
        }, () => {}, (err) => {console.log("loading sound err: ", err)});
    }

    playMusic() {
        this.music.stop();
        this.music.play();
        this.music.source.connect(this.analyser);
        this.startTime = performance.now();
        this.keepFiring = false;
        this.mapIterator = this.musicMap.entries();
        this.entry = this.mapIterator.next();
    }

    stopMusic() {
        this.music.stop();
        this.fqLog.index = 0;
    }

    loadNewSound(path) {
        var sound = new THREE.Audio(this.listener);
        this.audioLoader.load( path, (buffer) => {
            sound.setBuffer( buffer );
            sound.setVolume( 0.2 );
            sound.setPlaybackRate(4);
        }, () => {}, (err) => {console.log("loading sound err: ", err)});
        return sound;
    }

    isBigBoom() {
        if (!this.dataArray)
            return false;
        let fqLog = this.fqLog;
        return;
        this.analyser.getByteFrequencyData(this.dataArray);
        if (this.dataArray[this.chosenFreq] > 0.95 * this.lastAmplitude) {
            console.log(this.dataArray[this.chosenFreq]);
            this.lastAmplitude = this.dataArray[this.chosenFreq]
            return 1;
        }
        this.lastAmplitude = this.dataArray[this.chosenFreq]
        // this.lowestAmplitude = 1;
        return 0;
        // this.frequancies.set(performance.now(), new Uint8Array(this.dataArray));

        let highs = find_medium(this.dataArray, 61, 84);
        let mids = find_medium(this.dataArray, 10, 30);
        let lows = find_medium(this.dataArray, 1, 20);
    
        let index = fqLog.index++;
        fqLog.lows[index % fqLog.size] = lows;
        fqLog.mids[index % fqLog.size] = mids;
        fqLog.highs[index % fqLog.size] = highs;
        
        let medium_lows = find_medium(fqLog.lows, 0, index > fqLog.size? fqLog.size: index);
        let medium_mids = find_medium(fqLog.mids, 0, index > fqLog.size? fqLog.size: index);
        let medium_highs = find_medium(fqLog.highs, 0, index > fqLog.size? fqLog.size: index);
    
        let medium_diff = (medium_mids - medium_lows);
        let current_diff = (mids - lows);
    
        let midAmp = mids - medium_mids;
        let lowAmp = lows - medium_lows;
        let highAmp = highs - medium_highs;


        let bigDiff = new Array();
        bigDiff.push(midAmp - lowAmp, highAmp - midAmp);
        let absDiff = new Array();
        let bigBoomIdx = 0;
        bigDiff.forEach((element, idx) => {
            absDiff[idx] = Math.abs(element);
            if (absDiff[idx] > absDiff[bigBoomIdx])
                bigBoomIdx = idx;
        });
        bigBoomIdx = 1;

        if (bigDiff[bigBoomIdx] < 0)
            return 1;
        else if (bigDiff[(bigBoomIdx + 1) % 2] > 0)
            return 2;
        return 0;
    }
}

function find_medium(array, start, end) {
	var sum = 0;
	for( let i = start; i < end; i++) {
		sum += array[i];
	}
	return sum / (end - start);
}