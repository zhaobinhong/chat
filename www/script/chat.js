/**
 * Created by bankeys-01 on 2017/8/2.
 */


window.onload = function () {
    let chart = new Chart();
    chart.init();


}


//创建chart类
var Chart = function () {
    this.socket = null;
}
Chart.prototype = {
    init: function () {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function () {
            document.getElementById('info').textContent = '请设置你的昵称！';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        })

        //设置昵称
        document.getElementById("loginBtn").addEventListener("click", function () {
            let name = document.getElementById("nicknameInput").value;
            if (name.trim().length != 0) {
                that.socket.emit("login", name);
            } else {
                document.getElementById("nicknameInput").focus();
            }

        }, false)

        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '昵称被占用'; //显示昵称被占用的提示
        });

        this.socket.on('loginSuccess', function () {
            document.title = 'Chat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
            document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });
        this.socket.on("system", function (name, count, type) {
            let msg = name + (type == "login" ? "上线" : "离线"),
                p = document.createElement("p");
            //p.textContent = msg;
            //document.getElementById("historyMsg").appendChild(p);
            that._displayNewMsg('系统 ', msg, 'red');
            document.getElementById("status").textContent = "现：" + count + " 名用户 " + "在线"


        });
        this.socket.on("newMsg", function (user, msg) {
            that._displayNewMsg(user, msg)
        })
        //发送消息
        document.getElementById("sendBtn").addEventListener("click", function () {
            let messageInput = document.getElementById("messageInput"),
                msg = messageInput.value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit("postMsg", msg);
                that._displayNewMsg("我", msg, "blue")
            }
        })
    },
    _displayNewMsg: function (user, msg, color) {
        //console.log(this.socket)


        let container = document.getElementById("historyMsg"),
            msgToDisplay = document.createElement("p"),
            date = new Date();
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + "<span class='timespan'>(" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "):</span>" + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
}








