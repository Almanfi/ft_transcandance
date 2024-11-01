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
    }
    loadMusic(path) {
        this.audioLoader.load( path, (buffer) => {
            this.music.setBuffer( buffer );
            this.music.setLoop( true );
            this.music.setVolume( 0.5 );
            this.music.play(); 

            this.music.source.connect(this.analyser);

            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            console.log("sound playing");
        }, () => {}, (err) => {console.log("loading sound err: ", err)});
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
        this.analyser.getByteFrequencyData(this.dataArray);

        let highs = find_medium(this.dataArray, 61, 84);
        let mids = find_medium(this.dataArray, 21, 60);
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