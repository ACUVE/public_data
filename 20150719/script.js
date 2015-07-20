'use strict';
// License: MIT

var bufferSize = 1024 * 8 * 2;
var canvas_width = 1000;
var canvas_height = 200;

function App(source_node, div){
    this.con = source_node.context;
    this.sample_rate = this.con.sampleRate;
    this.div = div;
    
    // Initialize Audio Graph & Buffer
    this.analyser = this.con.createAnalyser();
    this.analyser.fftSize = bufferSize;
    this.analyser.smoothingTimeConstant = 0;
    source_node.connect(this.analyser);
    
    this.audio_buffer = new Float32Array(bufferSize);
    this.fft_buffer = new Float32Array(this.analyser.frequencyBinCount);
    
    // Initialize DOM
    while(div.hasChildNodes()) div.removeChild(div.childNodes[0]);
    
    this.canvas = ce('canvas');
    this.canvas.width = canvas_width;
    this.canvas.height = canvas_height;
    this.can = this.canvas.getContext('2d');
    div.appendChild(this.canvas);
    
    this.div_oto = ce('div');
    this.div_oto.style.fontSize = '300%';
    div.appendChild(this.div_oto);
    
    requestAnimationFrame(this.EveryFrame.bind(this));
}
App.prototype = {
    EveryFrame: function(){
        requestAnimationFrame(this.EveryFrame.bind(this));
        this.GetData();
        this.Draw();
        
        this.div_oto.textContent = '';
        var max = Math.max.apply(null, this.fft_buffer);
        var i, len = this.fft_buffer.length;
        for(i = 0; i < len; ++i){
            if(this.fft_buffer[i] === max) break;
        }
        if(i == len) return;
        if(max < -60) return;
        
        var hz = i * this.sample_rate / len / 2;
        
        var diff = (Math.log(hz) - Math.log(440)) / Math.LN2 * 12;
        var diff_int = Math.round(diff);
        var diff_12 = diff_int % 12;
        var diff_oct = Math.floor(diff_int / 12) + 4;
        while(diff_12 < 0) diff_12 += 12;
        if(diff_12 >= 3) ++diff_oct;
        
        var oto = [
            'A',
            'A#',
            'B',
            'C',
            'C#',
            'D',
            'D#',
            'E',
            'F',
            'F#',
            'G',
            'G#',
        ][diff_12];
        this.div_oto.textContent = oto + diff_oct + '  ' + Math.round((diff - diff_int) * 10) / 10;
    },
    GetData: function(){
        this.analyser.getFloatTimeDomainData(this.audio_buffer);
        this.analyser.getFloatFrequencyData(this.fft_buffer);
    },
    Draw: function(){
        var can = this.can;
        
        can.clearRect(0, 0, this.canvas.width, this.canvas.height);
        App.DrawGraph(can, this.audio_buffer.subarray(0, this.audio_buffer.length / 16), {width: canvas_width, height: canvas_height, center_zero: true, max: 1.0});
        App.DrawGraph(can, this.fft_buffer.subarray(0, this.fft_buffer.length / 4), {width: canvas_width, height: canvas_height, center_zero: true});
    },
    constructor: App
};
Object.defineProperties(App, {
    DrawGraph: {
        value: function(can, data, set){
            set = set || {};
            var zx = typeof(set.x) === 'undefined' ? 0 : set.x;
            var zy = typeof(set.y) === 'undefined' ? 0 : set.y;
            var w = typeof(set.width) === 'undefined' ? 0 : set.width;
            var h = typeof(set.height) === 'undefined' ? 0 : set.height;
            var is_forcemax = typeof(set.max) !== 'undefined';
            var forcemax = set.max;
            var czero = !!set.center_zero;
            
            var len = data.length;
            if(len <= 1) return;
            
            var maxvalue = is_forcemax ? forcemax : Math.max.apply(null, data);
            var minvalue = is_forcemax ? -forcemax : Math.min.apply(null, data);
            var absmaxvalue = Math.max(Math.abs(maxvalue), Math.abs(minvalue));
            
            var stepX = w / (len - 1);
            var calcX = function(x){return stepX * x + zx;};
            var calcY = czero ? function(y){return (-y / absmaxvalue + 1) / 2 * h + zy;} : function(y){return (-Math.abs(y) / absmaxvalue + 1) * h + zy;};
            
            can.beginPath();
            can.moveTo(calcX(0), calcY(data[0]));
            for(var i = 1; i < len; ++i){
                can.lineTo(calcX(i), calcY(data[i]));
            }
            can.lineWidth = 1.1;
            can.stroke();
        },
    }
});

function Init(){
    if(!navigator.getUserMedia) return;
    
    navigator.getUserMedia(
        {audio: true},
        Main,
        function(err){
            log('Error:' + err.name);
        }
    );
}
function Main(stream){
    var con = new AudioContext;
    var source = con.createMediaStreamSource(stream);
    
    var app = new App(source, $('out'));
}

if(!navigator.getUserMedia){
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
}
var log = console.log.bind(console);
var $ = document.getElementById.bind(document);
var ce = document.createElement.bind(document);
var ct = document.createTextNode.bind(document);
addEventListener('DOMContentLoaded', Init);
