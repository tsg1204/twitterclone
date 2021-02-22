$(document).ready(() => {
  $.get(`/api/chats`, (data, status, xhr) => {
    if (xhr.status === 400) {
      alert('Could not ge chat list.');
    } else {
      outputChatList(data, $('.resultsContainer'));
    }
  });
});

const outputChatList = (chatList, container) => {
  container.html('');
  if (chatList.lenth === 0) {
    container.append('<span class="noResults">Nothing to show.</span>');
  }

  chatList.forEach((chat) => {
    const html = createChatHtml(chat);
    container.append(html);
  });
};

const createChatHtml = (chatData) => {
  const chatName = 'chat name';
  const image = '';
  const latestMessage = 'Latest message';

  return `<a href="/messages/${chatData._id}" class="resultListItem">
            <div class="resultsDetailsContainer">
              <span class="heading">${chatName}</span>
              <span class="subText">${latestMessage}</span>
            </div>
          </a>`;
};
