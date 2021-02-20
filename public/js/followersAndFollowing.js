$(document).ready(() => {
  if (selectedTab === 'followers') {
    loadFollowers();
  } else {
    loadFollowing();
  }
});

const loadFollowers = () => {
  $.get(`/api/users/${profileUserId}/followers`, (results) => {
    outputUsers(results.followers, $('.resultsContainer'));
  });
};

const loadFollowing = () => {
  $.get(`/api/users/${profileUserId}/following`, (results) => {
    outputUsers(results.following, $('.resultsContainer'));
  });
};

const outputUsers = (results, container) => {
  container.html('');

  results.forEach((result) => {
    const html = createUserHtml(result, true);
    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
};

const createUserHtml = (userData, showFollowButton) => {
  const name = userData.firstName + ' ' + userData.lastName;

  return `<div class='user'>
              <div class='userImageContainer'>
                  <img src='${userData.profilePic}'>
              </div>
              <div class='userDetailsContainer'>
                  <div class='header'>
                      <a href='/profile/${userData.username}'>${name}</a>
                      <span class='username'>@${userData.username}</span>
                  </div>
              </div>
          </div>`;
};
