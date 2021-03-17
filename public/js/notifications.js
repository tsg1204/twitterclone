$(document).ready(() => {
  $.get('/api/notifications', (data) => {
    outptNotificationList(data, $('.resultsContainer'));
  });
});

$('#markNotificationsAsRead').click(() => markNotificationsAsOpened());
