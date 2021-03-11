$(document).ready(() => {
  socket.emit('join room', chatId);
  socket.on('typing', () => console.log('user is typing'));

  $.get(`/api/chats/${chatId}`, (data) =>
    $('#chatName').text(getChatName(data))
  );

  $.get(`/api/chats/${chatId}/messages`, (data) => {
    const messages = [];
    let lastSenderId = '';

    data.forEach((message, index) => {
      const html = createMessageHtml(message, data[index + 1], lastSenderId);

      messages.push(html);
      lastSenderId = message.sender._id;
    });

    const messagesHtml = messages.join('');

    addMessagesHtmlToPage(messagesHtml);
    scrollToBotton(false);
    $('.loadingSpinnerContainer').remove();
    $('.chatContainer').css('visibility', 'visible');
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
  updateTyping();

  if (event.which === 13 && !event.shiftKey) {
    messageSubmitted();
    //prevent new line
    return false;
  }
});

const updateTyping = () => {
  socket.emit('typing', chatId);
};

const addMessagesHtmlToPage = (html) => {
  $('.chatMessages').append(html);
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

  const messageDiv = createMessageHtml(message, null, '');

  $('.chatMessages').append(messageDiv);
  scrollToBotton(true);
};

const createMessageHtml = (message, nextMessage, lastSenderId) => {
  const sender = message.sender;
  const senderName = sender.firstName + ' ' + sender.lastName;
  const currentSenderId = sender._id;
  const nextSenderId =
    nextMessage !== undefined && nextMessage !== null
      ? nextMessage.sender._id
      : '';
  const isFirst = lastSenderId !== currentSenderId;
  const isLast = nextSenderId !== currentSenderId;
  const isMine = message.sender._id === userLoggedIn._id;
  let liClassName = isMine ? 'mine' : 'theirs';
  let nameElement = '';

  if (isFirst) {
    liClassName += ' first';

    if (!isMine) {
      nameElement = `<span class='senderName>${senderName}</span>`;
    }
  }

  let profileImage = '';

  if (isLast) {
    liClassName += ' last';
    profileImage = `<img src='${sender.profilePic}'>`;
  }

  let imageContainer = '';
  if (!isMine) {
    imageContainer = `<div class='imageContainer'>
                      ${profileImage}
                    </div>`;
  }

  return `<li class='message ${liClassName}'>
          ${imageContainer}
          <div class='messageContainer'>
          ${nameElement}
            <span class='messageBody'>
              ${message.content}
            </span>
          </div>
        </li>`;
};

const scrollToBotton = (animated) => {
  const container = $('.chatMessages');
  const scrollHeight = container[0].scrollHeight;

  if (animated) {
    container.animate({ scrollTop: scrollHeight }, 'slow');
  } else {
    container.scrollTop(scrollHeight);
  }
};
