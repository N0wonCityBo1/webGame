var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

app.get('/',(req,res)=>{
    res.render(__dirname+'/client/index.html')
})

var SOCKET_LIST = {}; 
var PLAYER_LIST = {};

var Player = function(id){
    var self = {
        x:250,
        y:250,
        id:id,
        number: "" + Math.floor(10 * Math.random()),
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10, 



    }
    self.updatePosition = function(){
        if(self.pressingRight)
            self.x+=self.maxSpd;
        if(self.pressingLeft)
            self.x-=self.maxSpd;
        if(self.pressingUp)
            self.y-=self.maxSpd;    
        if(self.pressingDown)
            self.y+=self.maxSpd;    

    }
    return self;
}
io.on('connection',(socket)=>{
    console.log("socket connected");
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    var player = Player(socket.id)
    PLAYER_LIST[socket.id] = player

    socket.on('disconnect',()=>{
        delete SOCKET_LIST[socket.id];
        delete PLATER_LIST[socket.id];

    });

    socket.on('keypress',function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state; 
        else if(data.inputId === 'up')
            player.pressingUp = data.state;    
        else if(data.inputId === 'down')
            player.pressingDown = data.state;    
    });

});
setInterval(function(){
    var pack = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number,
        });
    }
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
},1000/25);


serv.listen(3000,()=>{
    console.log('listing on *:3000');
})

