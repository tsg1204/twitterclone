let connected = false;
const socket = io('http://localhost:3003');

socket.emit('setup', userLoggedIn);

socket.on('connected', () => (connected = true));
socket.on('message received', (newMessage) => messageReceived(newMessage));

socket.on('notification received', (newNotification) => {
  $.get('api/notifications/latest', (notificationData) => {
    refreshNotificationsBadge();
  });
});

const emitNotification = (userId) => {
  if (userId === userLoggedIn._id) return;

  socket.emit('notification received', userId);
};
