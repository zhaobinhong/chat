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
        });

        //设置昵称
        document.getElementById("loginBtn").addEventListener("click", function () {
            let name = document.getElementById("nicknameInput").value;
            if (name.trim().length != 0) {
                that.socket.emit("login", name);
            } else {
                document.getElementById("nicknameInput").focus();
            }

        }, false);

        //发送消息
        document.getElementById("sendBtn").addEventListener("click", function () {
            let messageInput = document.getElementById("messageInput"),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit("postMsg", msg, color);
                that._displayNewMsg("我", msg, color)
            }
        })

        //发送图片
        document.getElementById("sendImage").addEventListener("change", function () {
            console.log(222)
            let color = document.getElementById("colorStyle").value;

            if (this.files.length != 0) {

                let file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('system', "不支持该文件", "red");
                    this.value = '';
                    return;
                }
                reader.onload = function (e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayNewImg('我', e.target.result, color);


                };
                reader.readAsDataURL(file);

            }
        }, false);

        //表情
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            }
        });

        document.getElementById('emojiWrapper').addEventListener('click', function (e) {
            //获取被点击的表情
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            }
        }, false);

        //回车键
        document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                }

            }

        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function (e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            }

        }, false);


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
        this.socket.on("newMsg", function (user, msg, color) {
            that._displayNewMsg(user, msg, color)
        });
        this.socket.on("newImg", function (user, img) {
            that._displayNewImg(user, img)

        })


    },
    _displayNewMsg: function (user, msg, color) {
        //console.log(this.socket)


        let container = document.getElementById("historyMsg"),
            msgToDisplay = document.createElement("p"),
            date = new Date();
        msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + "<span class='timespan'>(" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "):</span>" + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayNewImg: function (user, img, color) {
        let container = document.getElementById("historyMsg"),
            msgToDisplay = document.createElement("p"),
            date = new Date();
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + '): </span> <br/>' + '<a href="' + img + '" target="_blank"><img src="' + img + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;

    },
    _initialEmoji: function () {
        let emojContainer = document.getElementById("emojiWrapper"),
            docFragment = document.createDocumentFragment();
        for (let i = 75; i > 0; i--) {
            let emojiItem = document.createElement("img");
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        }
        emojContainer.appendChild(docFragment);
    },
    _showEmoji: function (msg) {
        let match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            //match = reg.exec(msg)
            //["[emoji:75]", index: 0, input: "[emoji:75]"]
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            }
        }
        return result;

    }


}








