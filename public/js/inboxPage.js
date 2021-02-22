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
  console.log(chatList);
};
