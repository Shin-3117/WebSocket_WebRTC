import express from "express";
import http from "http";
import SocketIO from "socket.io";

const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (req,res) => res.render("home"))
app.get("/*", (req,res)=> res.redirect("/"))


//http서버에 웹소켓 서버 생성
const httpServer = http.createServer(app)
const io = SocketIO(httpServer);

io.on("connection", socket=> {
  socket.on("join_room", (roomName)=>{
    socket.join(roomName)
    socket.to(roomName).emit("welcome")
  })
  // RTC Code: peer1 offer 받기
  socket.on("offer",(offer, roomName)=>{
    // RTC Code: peer1 offer peer2로 전송
    socket.to(roomName).emit("offer", offer)
  })
  // RTC Code: peer2 answer 받기
  socket.on("answer",(answer, roomName)=>{
    // RTC Code: peer2 answer peer1로 전송
    socket.to(roomName).emit("answer", answer)
  })
  // RTC Code: Description 설정 후 ICE
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice",ice)
  })
})

const handleListen = () => console.log("Listening on http://localhost:3000")
httpServer.listen(3000,handleListen);