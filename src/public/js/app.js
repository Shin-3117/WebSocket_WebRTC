const socket = io();
// welcome: select room
const welcome = document.querySelector("#welcome")
const welcomeForm = welcome.querySelector("form")
// room
const call = document.querySelector("#call")
const myFace = document.querySelector("#myFace")
const muteBtn = document.querySelector("#muteBtn")
const cameraBtn = document.querySelector("#cameraBtn")
const camerasSelect = document.querySelector("#cameras")

let roomName;
let myStream
let isMute = false
let isCameraOn = true
// RTC Code
let myPeerConnection;
call.hidden = true


const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const userCameras = devices.filter(device => device.kind === "videoinput")
    const currentCamera = myStream.getVideoTracks()[0]
    userCameras.forEach(camera => {
      const option = document.createElement("option")
      option.value = camera.deviceId
      option.innerText = camera.label
      if(currentCamera.label == camera.label){
        option.selected = true
      }
      camerasSelect.appendChild(option)
    })
  } catch (error) {
    console.log(error)
  }
}

const getMedia = async (deviceId) => {
  const initialConstrains = {
    audio: true, 
    video: { facingMode: "user"}
  }
  const cameraConstrains = {
    audio: true, 
    video: { facingMode: deviceId}
  }
  try{
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    )
    // console.log(myStream)
    myFace.srcObject = myStream
    if(!deviceId){
      await getCameras()
    }
  }catch(e){
    console.log(e)
  }
}

const handleIce = (data) => {
  socket.emit("ice", data.candidate, roomName)
  console.log('send ice candidate')
}
const handleAddStream = (data) => {
  console.log('받은 peerStream',data.stream)
  console.log('myStream',myStream)
  const peersStream = document.querySelector("#peersStream")
  peersStream.srcObject = data.stream
}
// RTC Code: peer1 offer
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection();
  // RTC Code: ICE
  myPeerConnection.addEventListener("icecandidate", handleIce)
  // RTC Code: ADD Stream
  myPeerConnection.addEventListener("addstream", handleAddStream)
  //Peer1에 연결된 트랙 전달
  myStream.getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream))
}
// RTC Code: peer1 offer
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer()
  myPeerConnection.setLocalDescription(offer)
  console.log('a1. setLocalDescription offer')
  // RTC Code: peer1 offer 서버로 전송
  socket.emit("offer", offer, roomName)
  console.log('a2. send offer')
})
// RTC Code: peer2가 peer1의 offer를 받음
socket.on("offer", async (offer) => {
  console.log('b1. receive offer')
  myPeerConnection.setRemoteDescription(offer);
  console.log('b2. setRemoteDescription')

  const answer = await myPeerConnection.createAnswer()
  myPeerConnection.setLocalDescription(answer)
  console.log('b3. setLocalDescription answer')
  // RTC Code: peer2 가 answer를 서버로 전송
  socket.emit('answer', answer, roomName)
  console.log('b4. send answer')
})
// RTC Code: peer1가 peer2의 answer를 받음
socket.on("answer", (answer) => {
  console.log('a3. receive answer')
  myPeerConnection.setRemoteDescription(answer);
  console.log('a4. setRemoteDescription')
})
// RTC Code: ICE
socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice)
  console.log('receive ice candidate')
})


const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection()
}


// welcome: select room
const handleWelcomeSubmit = async (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input")
  await initCall()
  socket.emit("join_room",input.value)
  roomName = input.value
  input.value = ''
}
welcomeForm.addEventListener("submit",handleWelcomeSubmit)

const handleMuteClick = () => {
  myStream
    .getAudioTracks()
    .forEach((track)=> {track.enabled = !track.enabled} )
  if(!isMute){
    muteBtn.innerText = "음소거 해제"
    isMute = true
  }else{
    muteBtn.innerText = "음소거 하기"
    isMute = false
  }
}
muteBtn.addEventListener("click", handleMuteClick)

const handleCameraClick = () => {
  myStream
    .getVideoTracks()
    .forEach((track)=> {track.enabled = !track.enabled} )

  if(!isCameraOn){
    cameraBtn.innerText = "카메라 켜기"
    isCameraOn = true;
  }else{
    cameraBtn.innerText = "카메라 끄기"
    isCameraOn = false;
  }
}
cameraBtn.addEventListener("click", handleCameraClick)

const handleCameraChange = async () => {
  await getMedia(camerasSelect.value)
}
camerasSelect.addEventListener("input", handleCameraChange)