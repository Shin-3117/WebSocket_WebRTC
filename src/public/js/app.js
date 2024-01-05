const socket = io();

const myFace = document.querySelector("#myFace")
const muteBtn = document.querySelector("#muteBtn")
const cameraBtn = document.querySelector("#cameraBtn")

let myStream
let isMute = false
let isCameraOn = true


const getMedia = async () => {
  try{
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    // console.log(myStream)
    myFace.srcObject = myStream
  }catch(e){
    console.log(e)
  }
}

getMedia()

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