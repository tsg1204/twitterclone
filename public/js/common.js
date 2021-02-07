$('#postTextarea').keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const submitButton = $('#submitPostButton');

  if (submitButton.length === 0) {
    return alert('No submit button found.');
  }

  if (value === '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false);
});

$('#submitPostButton').click((event) => {
  const button = $(event.target);
  const textbox = $('#postTextarea');
  const data = {
    content: textbox.val(),
  };

  $.post('/api/posts', data, (postData, status, xhr) => {
    const html = createPostHtml(postData);
    $('.postsContainer').prepend(html);
    textbox.val('');
    button.prop('disabled', true);
  });
});

const createPostHtml = (postData) => {
  const postedBy = postData.postedBy;

  return `<div class="post">
            <div class="mainContentContainer">
              <div class="userImageContainer">
                <img src="${postedBy.profilePic}" >
              </div>
              <div class="postContentContainer">
                <div class="header"></div>
                <div class="postBody">
                  <span>${postData.content}</span>
                </div>
                <div class="postFooter"></div>
              </div>
            </div>
          </div>`;
};
