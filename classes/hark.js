/* eslint-disable */
import { EventEmitter } from 'events';

var audioContextType;

function getMaxVolume (analyser, fftBins) {
  var maxVolume = -Infinity;
  analyser.getFloatFrequencyData(fftBins);

  for(var i=4, ii=fftBins.length; i < ii; i++) {
    if (fftBins[i] > maxVolume && fftBins[i] < 0) {
      maxVolume = fftBins[i];
    }
  }

  return maxVolume;
}

if (typeof window !== 'undefined') {
  audioContextType = window.AudioContext || window.webkitAudioContext;
}

export default function(stream, options) {
  var harker = new EventEmitter();
  var audioContext = null;

  // make it not break in non-supported browsers
  if (!audioContextType) return harker;

  //Config
  var options = options || {},
    smoothing = (options.smoothing || 0.1),
    interval = (options.interval || 50),
    threshold = options.threshold,
    play = options.play,
    history = options.history || 10,
    running = true;

  // Ensure that just a single AudioContext is internally created
  audioContext = options.audioContext || audioContext || new audioContextType();

  var sourceNode, fftBins, analyser;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = smoothing;
  fftBins = new Float32Array(analyser.frequencyBinCount);

  if (stream instanceof HTMLAudioElement || stream instanceof HTMLVideoElement) {
    //Audio Tag
    sourceNode = audioContext.createMediaElementSource(stream);
    if (typeof play === 'undefined') play = true;
    threshold = threshold || -50;
  } else {
    //WebRTC Stream
    sourceNode = audioContext.createMediaStreamSource(stream);
    threshold = threshold || -50;
  }

  sourceNode.connect(analyser);
  if (play) analyser.connect(audioContext.destination);

  harker.speaking = false;

  harker.suspend = function() {
    return audioContext.suspend();
  }

  harker.resume = function() {
    return audioContext.resume();
  }

  Object.defineProperty(harker, 'state', { get: function() {
    return audioContext.state;
  }});

  harker.setThreshold = function(t) {
    threshold = t;
  };

  harker.setInterval = function(i) {
    interval = i;
  };

  harker.stop = function() {
    running = false;
    harker.emit('volume_change', -100, threshold);

    if (harker.speaking) {
      harker.speaking = false;
      harker.emit('stopped_speaking');
    }

    analyser.disconnect();
    sourceNode.disconnect();
    audioContext.close();
    sourceNode = null;
    analyser = null;
    audioContext = null;
  };

  harker.speakingHistory = [];

  for (var i = 0; i < history; i++) {
    harker.speakingHistory.push(0);
  }

  // Poll the analyser node to determine if speaking
  // and emit events if changed
  var looper = function() {
    setTimeout(function() {
      //check if stop has been called
      if(!running) {
        return;
      }

      var currentVolume = getMaxVolume(analyser, fftBins);

      harker.emit('volume_change', currentVolume, threshold);

      var history = 0;
      if (currentVolume > threshold && !harker.speaking) {
        // trigger quickly, short history
        for (var i = harker.speakingHistory.length - 3; i < harker.speakingHistory.length; i++) {
          history += harker.speakingHistory[i];
        }
        if (history >= 2) {
          harker.speaking = true;
          harker.emit('speaking');
        }
      } else if (currentVolume < threshold && harker.speaking) {
        for (var i = 0; i < harker.speakingHistory.length; i++) {
          history += harker.speakingHistory[i];
        }
        if (history == 0) {
          harker.speaking = false;
          harker.emit('stopped_speaking');
        }
      }
      harker.speakingHistory.shift();
      harker.speakingHistory.push(0 + (currentVolume > threshold));

      looper();
    }, interval);
  };
  looper();

  return harker;
}
