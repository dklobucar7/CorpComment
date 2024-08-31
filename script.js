// -- GLOBAL --
const MAX_CHARS = 150;

const counterEl = document.querySelector(".counter");
const textareaEl = document.querySelector(".form__textarea");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");

// new feedback item HTML
const renderFeedbackItem = (feedbackItem) => {
  const feedbackItemHTML = `
  <li class="feedback">
            <button class="upvote">
              <i class="fa-solid fa-caret-up upvote__icon"></i>
              <span class="upvote__count">${feedbackItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
              <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
              <p class="feedback__company">${feedbackItem.company}</p>
              <p class="feedback__text">
                ${feedbackItem.text}
              </p>
            </div>
            <p class="feedback__date">${
              feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
            }</p>
          </li>
  `;
  // insert new feedback item in list
  feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
};

// -- COUNTER COMPONENT --
const inputHandler = () => {
  // determine maximum number of characters
  const maxNrChar = MAX_CHARS;

  // determine number of characters currently typed
  const nrCharsTyped = textareaEl.value.length;

  // calculate number of characters left
  const charsLeft = maxNrChar - nrCharsTyped;

  //show number of characters left
  counterEl.textContent = charsLeft;
};

textareaEl.addEventListener("input", inputHandler);

// -- FORM (SUBMIT) COMPONENT --

const showVisualIndicator = (textCheck) => {
  const className = textCheck === "valid" ? "form--valid" : "form--invalid";
  // show valid indicator
  formEl.classList.add(className);

  // remove visual indicator
  setTimeout(() => formEl.classList.remove(className), 2000);
};

const submitHandler = (event) => {
  // prevent default browser action (submitting form data to 'action'-address and refreshing page)
  event.preventDefault();

  // get text from textarea
  const text = textareaEl.value;

  // validate text (e.g. check if #hashtag is present and text is long enough)
  if (text.includes("#") && text.length > 4) {
    showVisualIndicator("valid");
  } else {
    showVisualIndicator("invalid");

    // foxus text area again - we can continue typing
    textareaEl.focus();

    // stop this function execution
    return;
  }

  // we have text, now extract other info from text
  const hashtag = text.split(" ").find((word) => word.includes("#"));
  const company = hashtag.substring(1);
  const badgeLetter = company.substring(0, 1).toUpperCase();
  const upvoteCount = 0;
  const daysAgo = 0;

  // create a feedback item object
  const feedbackItem = {
    hashtag: hashtag,
    company: company,
    badgeLetter: badgeLetter,
    upvoteCount: upvoteCount,
    daysAgo: daysAgo,
    text: text,
  };
  // render feedback item
  renderFeedbackItem(feedbackItem);

  // insert new feedback item in list

  // clear textarea
  textareaEl.value = "";

  // blur submit button - not focus
  submitBtnEl.blur();

  // reset counter
  counterEl.textContent = MAX_CHARS;
};

formEl.addEventListener("submit", submitHandler);

// -- FEEDBACK LIST COMPONENT

fetch("https://bytegrad.com/course-assets/js/1/api/feedbacks")
  .then((response) => {
    if (!response.ok) {
      console.log("Nije uspješno.");
    }
    return response.json();
  })
  .then((data) => {
    // remove spinner class
    spinnerEl.remove();

    // iterate over each element in feedbacks array and render it in list
    data.feedbacks.forEach((feedbackItem) => renderFeedbackItem(feedbackItem));
  })
  .catch((error) => {
    feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
  });
