const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const Filter = require('bad-words');
const socketio = require('socket.io');

const {
	getUsersInRoom,
	getUser,
	removeUser,
	addUser,
} = require('./utils/users');

const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');

const publicDirectoryPath = path.join(__dirname, '../public');
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectoryPath));
const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
	console.log('New web socket connection');

	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });
		if (error) {
			return callback(error);
		}
		socket.join(user.room);

		socket.emit(
			'message',
			generateMessage('Admin', `Welcome ${user.username}`)
		);

		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				generateMessage('Admin', `${user.username} has joined!`)
			);
		try {
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room, user.id),
			});
		} catch (e) {
			console.log(e);
		}

		callback();

		// socket
	});

	socket.on('sendMsg', (msg, callback) => {
		const filter = new Filter();
		const user = getUser(socket.id);

		if (filter.isProfane(msg)) {
			return callback('profanity is not allowed');
		}

		io.to(user.room).emit('message', generateMessage(user.username, msg));
		callback();
	});

	socket.on('sendLocation', (position, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			'locationMessage',
			generateLocationMessage(user.username, position)
		);
		callback();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				'message',
				generateMessage('Admin', `${user.username} has left the room!`)
			);
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room, user.id),
			});
		}
	});
});

server.listen(port, () => {
	console.log(`setting up at on port ${port}`);
});
