const users = [];

// addUser
const addUser = ({ id, username, room }) => {
	// Clean the data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	// Validate the data
	if (!username || !room) {
		return {
			error: 'Username and room are required',
		};
	}
	// check for existing user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	// validate username
	if (existingUser) {
		return {
			error: 'Username is already used!',
		};
	}
	// store user
	const user = { id, username, room };
	users.push(user);
	return {
		user,
	};
};

// removeUser
const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);
	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
	return {
		error: 'no user found',
	};
};

// getUser
const getUser = (id) => {
	const user = users.find((user) => {
		return user.id === id;
	});

	if (!user) {
		return {
			error: 'User not found',
		};
	}
	return user;
};

// getUsersInRoom
const getUsersInRoom = (room, id) => {
	if (room) {
		room = room.trim().toLowerCase();
	} else {
		user = getUser(id);
		room = user.room;
	}

	const data = users.filter((user) => {
		return user.room === room;
	});
	if (data.length === 0) {
		return {
			error: 'No users in the room',
		};
	}
	return data;
};

addUser({
	id: 22,
	username: 'Andrew',
	room: 'home',
});

addUser({
	id: 123,
	username: 'Monke',
	room: 'home',
});
addUser({
	id: 123,
	username: 'Monke',
	room: 'chimp',
});
// const user123 = removeUser(22);
// console.log(getUser(23));
// console.log(users);

// console.log(getUsersInRoom('home'));
// console.log(getUsersInRoom('asdas'));

module.exports = { addUser, getUsersInRoom, getUser, removeUser };
