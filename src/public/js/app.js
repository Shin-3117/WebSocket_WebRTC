//웹소켓
const socket = new WebSocket(`ws://${window.location.host}`)

const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form")

socket.addEventListener("open", ()=>{
  console.log("서버 연결 완료")
})

socket.addEventListener("message", (message)=>{
  // console.log("받은 메세지:",message.data)
  const li = document.createElement("li")
  li.innerText = message.data
  messageList.append(li)
})

socket.addEventListener("close", ()=>{
  console.log("서버 연결 종료")
})

const handleSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  console.log("보낸 메세지:",input.value)
  socket.send(input.value)
  input.value = ''
}

messageForm.addEventListener("submit", handleSubmit)