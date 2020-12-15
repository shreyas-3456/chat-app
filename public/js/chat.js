const socket = io();

//Elements

const $messageForm = document.querySelector('.form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

// auto scroll fucntion
const autoScroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// height of the last(new) message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
	//  visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container(total)
	const containerHeight = $messages.scrollHeight;

	// how far has the user scrolled ?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = messages.scrollHeight;
	}
};

socket.on('message', (message) => {
	console.log(message);
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('locationMessage', (position) => {
	console.log(position);
	const url = Mustache.render(urlTemplate, {
		username: position.username,
		url: position.url,
		createdAt: moment(position.createdAt).format('h:mm a'),
	});
	$messages.insertAdjacentHTML('beforeend', url);
	autoScroll();
});

// updating users in a room when the enter or leave
socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	document.querySelector('#sidebar').innerHTML = html;
});

// txt submit
$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	// disable form
	$messageFormButton.setAttribute('disabled', 'disabled');

	const value = e.target.elements.message.value;

	socket.emit('sendMsg', value, (error) => {
		//enable
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();
		if (error) {
			return console.log(error);
		}
		console.log('message delivered');
	});
});
// ******************************************

// location submit
$sendLocationButton.addEventListener('click', () => {
	// disable button
	$sendLocationButton.setAttribute('disabled', 'disabled');
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}

	navigator.geolocation.getCurrentPosition((position) => {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;

		socket.emit(
			'sendLocation',
			`https://google.com/maps?q=${latitude},${longitude}`,
			() => {
				// enable button
				$sendLocationButton.removeAttribute('disabled');
				console.log('Location shared');
			}
		);
	});
});

socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});
