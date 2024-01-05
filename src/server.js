import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (req,res) => res.render("home"))
app.get("/*", (req,res)=> res.redirect("/"))

const handleListen = () => console.log("Listening on http://localhost:3000")
// app.listen(3000, handleListen);

//http서버에 웹소켓 서버 생성
const httpServer = http.createServer(app)
const io = SocketIO(httpServer);

const publicRooms = () => {
  const sids = io.socket.adapter.sids;
  const rooms = io.socket.adapter.rooms;

  const publicRoomList = []
  rooms.forEach((_,key)=>{
    if(sids.get(key)===undefined){
      publicRoomList.push(key);
    }
  })
}

io.on("connection", (socket)=>{
  socket["nickname"] = "ㅇㅇ"
  socket.onAny((event)=>{console.log(`Socket Event: ${event}`)})
  socket.on("enter_room", (roomName,done)=>{
    socket.join(roomName)
    done()
    socket.to(roomName).emit("welcome", socket.nickname);
  })
  socket.on("disconnecting", ()=>{
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname))
  })

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done()
  })
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname))
})



httpServer.listen(3000,handleListen);