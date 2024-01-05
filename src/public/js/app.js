const socket = io();

// const welcome = document.getElementById("welcome")
const welcome = document.querySelector("#welcome")
const form = welcome.querySelector("form")
const room = document.querySelector("#room")

room.hidden = true

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#msg input")
  const value = input.value
  socket.emit("new_message", value, roomName, ()=>{
    addMessage(`YOU: ${value}`)
  })
  input.value = ''
}

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#name input")
  const value = input.value
  socket.emit("nickname", value)
}

const showRoom = () => {
  room.hidden = false
  welcome.hidden = true
  const roomNameEl = room.querySelector("#roomName")
  roomNameEl.innerText = `Room: ${roomName}`

  const nameForm = room.querySelector("#name");
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

const handleRoomSubmit = (event) =>{
  event.preventDefault();
  const input = form.querySelector("input")
  socket.emit("enter_room", input.value, showRoom)
  roomName = input.value
  input.value = ""
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user)=>{
  addMessage(`${user}님이 참가했습니다.`)
})

socket.on("bye", (user) =>{
  addMessage(`${user}님이 떠났습니다.`)
})

socket.on("new_message", addMessage);
// addMessage : (msg) => {addMessage(msg)}