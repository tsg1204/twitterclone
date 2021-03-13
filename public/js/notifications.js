$(document).ready(() => {
  $.get('/api/notifications', (data) => {
    outptNotificationList(data, $('.resultsContainer'));
  });
});

const outptNotificationList = (notifications, container) => {
  notifications.forEach((notification) => {
    const html = createNotificationHtml(notification);
    container.append(html);
  });

  if (notification.length === 0) {
    container.append('<span class="noResults">Nothing to show.</span>');
  }
};

const createNotificationHtml = (notification) => {
  const userFrom = notification.userFrom;

  return `<a href='#' class='resultListItem notification'>
          <div class='resultsImageContainer'>
            <img src='${userFrom.profilePic}'>
          </div>
          <div class='resultsDetailsContainer ellipsis'>
            <span class='ellipsis'>${'this is the text'}</span>
          </div>
        </a>`;
};
