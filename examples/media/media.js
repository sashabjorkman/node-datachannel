const nodeDataChannel = require('../../lib/index');
const readline = require("readline");
var dgram = require('dgram');

var client = dgram.createSocket('udp4');

// Read Line Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Init Logger
nodeDataChannel.initLogger('Debug');

let peerConnection = new nodeDataChannel.PeerConnection('pc', { iceServers: [] });

peerConnection.onStateChange((state) => {
    console.log('State: ', state);
});
peerConnection.onGatheringStateChange((state) => {
    console.log('GatheringState: ', state);

    if(state == 'complete'){
        let desc = peerConnection.localDescription();

        console.log(JSON.stringify(desc));
        console.log('\n\n');
        console.log('Expect RTP video traffic on localhost:5000');
        rl.question('Please copy/paste the answer provided by the browser: \n', (sdp) => {
            let sdpObj = JSON.parse(sdp);
            peerConnection.setRemoteDescription(sdpObj.sdp, sdpObj.type);
    
            rl.close();
    
        });
    }
});

let video = new nodeDataChannel.Video('video','RecvOnly');
video.addH264Codec(96);
video.setBitrate(3000);

let track = peerConnection.addTrack(video);
let session = new nodeDataChannel.RtcpReceivingSession();

track.setMediaHandler(session);
track.onMessage((msg)=>{
    client.send(msg,5000,'127.0.0.1',(err,n)=>{
        console.log(err,n);
    });
    // console.log(msg);
});

peerConnection.setLocalDescription();