import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname+"/public"))
app.get("/", (req,res) => res.render("home"))
app.get("/*", (req,res)=> res.redirect("/"))

const handleListen = () => console.log("Listening on http://localhost:3000")
// app.listen(3000, handleListen);

//http서버에 웹소켓 서버 생성
const server = http.createServer(app)
const wss = new WebSocket.Server({server});

const sockets = [];

wss.on("connection", (socket)=>{
  sockets.push(socket);
  console.log('connect to Browser')
  socket.on("close",()=>{
    console.log('disconnect to Browser')
  })
  socket.on("message", (message)=>{
    let msg = message.toString('utf-8')
    sockets.forEach((aSocket) => aSocket.send(msg))
  });
})


server.listen(3000,handleListen);