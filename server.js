/**
 * myChat
 * Created by bankeys-01 on 2017/8/2.
 */

var express = require('express'),
    app = express(),
    http = require('http'),
//server = http.createServer(function (req, res) {
//    res.writeHead(200, {
//        "Content-Type": "text/html"
//    });
//    res.write("one");
//    res.end();
//
//});
    server = http.createServer(app),
    io = require("socket.io").listen(server),
    users = [];
app.use('/', express.static(__dirname + '/www'));

server.listen(8088);

io.on("connection", function (socket) {
    socket.on("login", function (name) {
            if (users.indexOf(name) > -1) {
                socket.emit('nickExisted');
            } else {
                socket.userIndex = users.length;
                socket.name = name;
                users.push(name);
                socket.emit("loginSuccess");
                //console.log(console.log(io.sockets))
                io.sockets.emit("system", name, users.length, "login");

            }

        },
        socket.on("disconnect", function () {//io自带方法
            if (this.name !== undefined) {
                users.splice(socket.userIndex, 1);//将断开的用户从users中移除
                socket.broadcast.emit("system", socket.name, users.length, "logout");//通知出自己以外的人
            }

        }),
        socket.on("postMsg", function (msg) {
            if (this.name !== undefined) {
                socket.broadcast.emit("newMsg", socket.name, msg)
            }

        })
    )
})

console.log("server is 8088");

