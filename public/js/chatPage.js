$(document).ready(() => {
  $.get(`/api/chats/${chatId}`, (data) =>
    $('#chatName').text(getChatName(data))
  );

  $.get(`/api/chats/${chatId}/messages`, (data) => {
    const messages = [];

    data.forEach((message) => {
      const html = createMessageHtml(message);
      messages.push(html);
    });

    const messagesHtml = messages.join('');

    addMessagesHtmlToPage(messagesHtml);
  });
});

$('#chatNameButton').click(() => {
  const name = $('#chatNameTextbox').val().trim();

  $.ajax({
    url: '/api/chats/' + chatId,
    type: 'PUT',
    data: { chatName: name },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert('could not update');
      } else {
        location.reload();
      }
    },
  });
});

$('.sendMessageButton').click(() => {
  messageSubmitted();
});

$('.inputTextbox').keydown((event) => {
  if (event.which === 13 && !event.shiftKey) {
    messageSubmitted();
    //prevent new line
    return false;
  }
});

const addMessagesHtmlToPage = (html) => {
  $('.chatMessages').append(html);

  //TODO: scroll to bottom
};

const messageSubmitted = () => {
  const content = $('.inputTextbox').val().trim();

  if (content != '') {
    sendMessage(content);
    $('.inputTextbox').val('');
  }
};

const sendMessage = (content) => {
  $.post(
    '/api/messages',
    { content: content, chatId: chatId },
    (data, status, xhr) => {
      if (xhr.status !== 201) {
        alert('Could not send message');
        $('.inputTextbox').val(content);
        return;
      }

      addChatMessageHtml(data);
    }
  );
};

const addChatMessageHtml = (message) => {
  if (!message || !message._id) {
    alert('Message is not valid');
    return;
  }

  const messageDiv = createMessageHtml(message);

  $('.chatMessages').append(messageDiv);
};

const createMessageHtml = (message) => {
  const isMine = message.sender._id === userLoggedIn._id;
  const liClassName = isMine ? 'mine' : 'theirs';

  return `<li class='message ${liClassName}'>
          <div class='messageContainer'>
            <span class='messageBody'>
              ${message.content}
            </span>
          </div>
        </li>`;
};
