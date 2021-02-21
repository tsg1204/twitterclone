//globals
var cropper;

$('#postTextarea, #replyTextarea').keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const isModal = textbox.parents('.modal').length === 1;

  const submitButton = isModal
    ? $('#submitReplyButton')
    : $('#submitPostButton');

  if (submitButton.length === 0) {
    return alert('No submit button found.');
  }

  if (value === '') {
    submitButton.prop('disabled', true);
    return;
  }

  submitButton.prop('disabled', false);
});

$('#submitPostButton, #submitReplyButton').click((event) => {
  const button = $(event.target);
  const isModal = button.parents('.modal').length === 1;
  const textbox = isModal ? $('#replyTextarea') : $('#postTextarea');
  const data = {
    content: textbox.val(),
  };

  if (isModal) {
    const id = button.data().id;

    if (id === null) return console.log('Button is is null');
    data.replyTo = id;
  }

  $.post('/api/posts', data, (postData, status, xhr) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(postData);
      $('.postsContainer').prepend(html);
      textbox.val('');
      button.prop('disabled', true);
    }
  });
});

$('#replyModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $('#submitReplyButton').attr('data-id', postId);

  $.get(`/api/posts/${postId}`, (results) => {
    outputPosts(results.postData, $('#originalPostContainer'));
  });
});

$('#replyModal').on('hidden.bs.modal', () =>
  $('#originalPostContainer').html('')
);

$('#deletePostModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $('#deletePostButton').attr('data-id', postId);
});

$('#confirmPinModal').on('show.bs.modal', (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $('#pinPostButton').data('id', postId);
});

$('#deletePostButton').click((event) => {
  const postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'DELETE',
    success: () => {
      location.reload();
    },
  });
});

$('#pinPostButton').click((event) => {
  const postId = $(event.target).data('id');

  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'PUT',
    data: { pinned: true },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert('could not pin the post');
        return;
      }

      location.reload();
    },
  });
});

$('#filePhoto').change(function () {
  if (this.files && this.files[0]) {
    let reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById('imagePreview');
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      });
    };

    reader.readAsDataURL(this.files[0]);
  } else {
    console.log('nope');
  }
});

$('#imageUploadButton').click(() => {
  const canvas = cropper.getCroppedCanvas();

  if (canvas === null) {
    alert('Could not upload image. Make sure it is an image file.');
    return;
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();

    formData.append('croppedImage', blob);

    $.ajax({
      url: '/api/users/profilePicture',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload(),
    });
  });
});

$('#coverPhoto').change(function () {
  if (this.files && this.files[0]) {
    let reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById('coverPreview');
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };

    reader.readAsDataURL(this.files[0]);
  }
});

$('#coverPhotoUploadButton').click(() => {
  const canvas = cropper.getCroppedCanvas();

  if (canvas === null) {
    alert('Could not upload image. Make sure it is an image file.');
    return;
  }
  canvas.toBlob((blob) => {
    const formData = new FormData();

    formData.append('croppedImage', blob);

    $.ajax({
      url: '/api/users/coverPhoto',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => location.reload(),
    });
  });
});

$(document).on('click', '.likeButton', (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      button.find('span').text(postData.likes.length || '');

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.retweetButton', (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      button.find('span').text(postData.retweetUsers.length || '');

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass('active');
      } else {
        button.removeClass('active');
      }
    },
  });
});

$(document).on('click', '.post', (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is('button')) {
    window.location.href = `/post/${postId}`;
  }
});

$(document).on('click', '.followButton', (event) => {
  const button = $(event.target);
  const userId = button.data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: 'PUT',
    success: (data, status, xhr) => {
      if (xhr.status === 404) {
        alert('user not found');
        return;
      }

      let difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass('following');
        button.text('Following');
      } else {
        button.removeClass('following');
        button.text('Follow');
        difference = -1;
      }

      let followersLabel = $('#followersValue');
      if (followersLabel.length !== 0) {
        let followersText = parseInt(followersLabel.text());
        followersLabel.text(followersText + difference);
      }
    },
  });
});

const getPostIdFromElement = (el) => {
  const isRoot = el.hasClass('post');
  const rootEl = isRoot ? el : el.closest('.post');
  const postId = rootEl.data().id;

  if (postId === undefined) return console.log('Post is undefined');

  return postId;
};

const createPostHtml = (postData, largeFont = false) => {
  if (postData === null) return alert('post object is null');
  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;
  const postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return console.log('user object is not populated');
  }

  const displayName = postedBy.firstName + ' ' + postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));
  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? 'active'
    : '';
  const retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? 'active'
    : '';

  const largeFontClass = largeFont ? 'largeFont' : '';

  let retweetText = '';

  if (isRetweet) {
    retweetText = `<span><i class="fas fa-retweet"></i>
                    Retweeted by <a href="/profile/${retweetedBy}">@${retweetedBy}</a>
                  </span>`;
  }

  let replyFlag = '';

  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return console.log('Reply to is not populated');
    } else {
      if (!postData.replyTo.postedBy._id) {
        return console.log('Posted by to is not populated');
      }
    }

    const replyToUsername = postData.replyTo.postedBy.username;

    replyFlag = `<div class="replyFlag">
                    Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a>
                  </div>`;
  }

  let buttons = '';
  if (postData.postedBy._id === userLoggedIn._id) {
    buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="#confirmPinModal"><i class='fas fa-thumbtack'></i></button><button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
  }

  return `<div class="post ${largeFontClass}" data-id='${postData._id}'>
            <div class="postActionContainer">${retweetText}</div>
            <div class="mainContentContainer">
              <div class="userImageContainer">
                <img src="${postedBy.profilePic}" >
              </div>
              <div class="postContentContainer">
                <div class="header">
                  <a href="/profile/${
                    postedBy.username
                  }" class="displayName">${displayName}</a>
                  <span class="username">@${postedBy.username}</span>
                  <span class="date">${timestamp}</span>
                  ${buttons}
                </div>
                ${replyFlag}
                <div class="postBody">
                  <span>${postData.content}</span>
                </div>
                <div class="postFooter">
                  <div class="postButtonContainer">
                    <button data-toggle='modal' data-target='#replyModal'>
                      <i class='far fa-comment'></i>
                    </button>
                  </div>
                  <div class="postButtonContainer green">
                    <button class="retweetButton ${retweetButtonActiveClass}">
                      <i class="fas fa-retweet"></i>
                      <span>${postData.retweetUsers.length || ''}</span>
                    </button>
                  </div>
                  <div class="postButtonContainer red">
                      <button class="likeButton ${likeButtonActiveClass}">
                        <i class="far fa-heart"></i>
                        <span>${postData.likes.length || ''}</span>
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
};

const timeDifference = (current, previous) => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  let elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return 'Just now';

    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago';
  }
};

const outputPosts = (results, container) => {
  container.html('');

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.map((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });

  if (results.length === 0) {
    container.append('<span class="noResults">Nothing to show</span>');
  }
};

const outputPostsWithReplies = (results, container) => {
  container.html('');

  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainHtml = createPostHtml(results.postData, true);
  container.append(mainHtml);

  results.replies.map((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });
};
