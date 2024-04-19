

let peerConnection = new RTCPeerConnection();
let localStream;
let remoteStream;

var socket
if (!window.WebSocket) {
    window.WebSocket = window.MozWebSocket
}


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

    if(window.WebSocket){
        socket = new WebSocket("ws://localhost:8090/ws")
        socket.onmessage = onMessage
        socket.onopen = onOpen

        socket.onclose = function(event) {
            console.log("连接断开")
        }
    }else{
        alert('你的浏览器不支持WebSocket')
    }
}

let onOpen = async(event) =>{
    console.log("连接成功")
}
let onMessage = async(event) =>
{
   console.log("receive message:"+event.data);

   let msg = JSON.parse(event.data);
   console.log(msg.type)
   if(msg.type == "join")
   {
      console.log(event.data+" join room")
      createOffer();
   }
   if(msg.type == "offer")
   {
      document.getElementById('offer-sdp').value = JSON.stringify(msg.text);            
      createAnswer();
   }
   if(msg.type == "answer")
   {
      document.getElementById('answer-sdp').value = JSON.stringify(msg.text);            
      addAnswer();
   }
}
let sendMessage = async(message) =>{
    if(socket.readyState === WebSocket.OPEN){
        socket.send(message)
    } else{
        alert('连接没有开启')
    }

}

let createOffer=async () =>{
    peerConnection.onicecandidate = async (event) =>{
        if(event.candidate)
        {
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription);

            sendMessage(JSON.stringify({type:"offer",text:peerConnection.localDescription}));

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
            sendMessage(JSON.stringify({type:"answer",text:peerConnection.localDescription}));
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
