const express = require('express');
const app = express();
let randomColor = require('randomcolor');
const uuid = require('uuid');

app.disable('x-powered-by')

//middlewares
app.use(express.static('client'));

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/client/index.html');
});

server = app.listen( process.env.PORT || 5000);

const io = require("socket.io")(server);

let users = [];
let connnections = [];

io.on('connection', (socket) => {
    console.log('New user connected');
    connnections.push(socket)
    let color = randomColor();

    socket.username = 'Anonymous';
    socket.color = color;

   
    socket.on('change_username', data => {
        let id = uuid.v4();
        socket.id = id;
        socket.username = data.nickName;
        users.push({id, username: socket.username, color: socket.color});
        updateUsernames();
    })

    //update Usernames
    const updateUsernames = () => {
        io.sockets.emit('get users',users)
    }

    // new_message
    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message : data.message, username : socket.username,color: socket.color});
    })

    socket.on('typing', data => {
        socket.broadcast.emit('typing',{username: socket.username})
    })

    //Disconnect
    socket.on('disconnect', data => {

        if(!socket.username)
            return;
        //find the user and delete 
        let user = undefined;
        for(let i= 0;i<users.length;i++){
            if(users[i].id === socket.id){
                user = users[i];
                break;
            }
        }
        users = users.filter( x => x !== user);
        updateUsernames();
        connnections.splice(connnections.indexOf(socket),1);
    })
})
