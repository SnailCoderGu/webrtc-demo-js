

let peerConnection = new RTCPeerConnection();
let localStream;
let remoteStream;

let init= async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false})
    remoteStream = new MediaStream()
    document.getElementById('user-1').srcObject = localStream
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) =>{
        peerConnection.addTrack(track,localStream);
    })

    peerConnection.ontrack = (event) =>{
        event.streams[0].getTracks().forEach((track) =>{
             remoteStream.addTrack(track);
        });
    }
}

let createOffer=async () =>{
    peerConnection.onicecandidate = async (event) =>{
        if(event.candidate)
        {
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription);
        }
    }
    

    let offer = await peerConnection.createOffer();
    console.log(offer);
    await peerConnection.setLocalDescription(offer);

    document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription);

}

let createAnswer = async() =>{

    peerConnection.onicecandidate = async (event) =>{
        if(event.candidate)
        {
            console.log('on ice')
            document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription);
        }
    }

    let offer = JSON.parse(document.getElementById('offer-sdp').value)
    await peerConnection.setRemoteDescription(offer)


    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log('set remoete sdp sucess');

    document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription);
}

let addAnswer = async()=>{
    let answer = JSON.parse(document.getElementById('answer-sdp').value)
    if(!peerConnection.currentRemoteDescription)
    {
        peerConnection.setRemoteDescription(answer);
        console.log("set remote sdp suceee");
    }
}

init()

document.getElementById("create-offer").addEventListener('click',createOffer)
document.getElementById('create-answer').addEventListener('click',createAnswer)
document.getElementById('add-answer').addEventListener('click',addAnswer)
