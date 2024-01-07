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

// RTC Code
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection();
  myStream.getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream))
}

const startMedia = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection()
}


// welcome: select room
const handleWelcomeSubmit = (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input")
  socket.emit("join_room",input.value, startMedia)
  roomName = input.value
  input.value = ''
}
welcomeForm.addEventListener("submit",handleWelcomeSubmit)

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer()
  console.log(offer)
})


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