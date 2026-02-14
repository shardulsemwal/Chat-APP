// Dynamic server connection - works locally and in production
const socket = io();

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp')
const messageContainer = document.querySelector(".container")

// Audio notification for new messages
let audio = null;
try {
    audio = new Audio('ting.mp3.mp3');
} catch(e) {
    console.log('Audio file not found, notifications will be silent');
}

// Connection status feedback
socket.on('connect', () => {
    console.log('✓ Connected to server!');
    const status = document.querySelector('.status');
    if(status) {
        status.textContent = '🟢 Online';
        status.style.color = '#4ade80';
    }
});

socket.on('connect_error', (error) => {
    console.error('✗ Connection failed! Make sure the server is running.');
    const status = document.querySelector('.status');
    if(status) {
        status.textContent = '🔴 Offline';
        status.style.color = '#ef4444';
    }
    alert('Cannot connect to server! Please make sure the Node.js server is running.');
});

socket.on('disconnect', () => {
    console.log('✗ Disconnected from server');
    const status = document.querySelector('.status');
    if(status) {
        status.textContent = '🔴 Offline';
        status.style.color = '#ef4444';
    }
});


const append = (message, position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    
    // Auto scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
    
    if(position == 'left' && audio){
        audio.play().catch(e => console.log('Could not play notification sound'));
    }
}

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
});

const userName = prompt("Enter your name to join");
socket.emit('new-user-joined', userName);

socket.on('user-joined', userName=>{
    append(`${userName} joined the chat`, 'right');
})

socket.on('receive', data=>{
    append(`${data.name}: ${data.message}`, 'left');
})

socket.on('left', name=>{
    append(`${name} left the chat`, 'left');
})

