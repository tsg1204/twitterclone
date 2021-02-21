let timer;

$('#searchBox').keydown((event) => {
  clearTimeout(timer);
  const textbox = $(event.target);
  let value = textbox.val();
  const searchType = textbox.data().search;

  timer = setTimeout(() => {
    value = textbox.val().trim();

    if (value === '') {
      $('.resultsContainer').html('');
    } else {
      console.log(value);
    }
  }, 1000);
});
