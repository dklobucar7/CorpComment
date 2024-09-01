// -- GLOBAL --
const MAX_CHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

const counterEl = document.querySelector(".counter");
const textareaEl = document.querySelector(".form__textarea");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");
const hashtagListEL = document.querySelector(".hashtags");

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

(() => {
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
})();

// -- FORM (SUBMIT) COMPONENT --
(() => {
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

    // create feedback item object, render feedback item in list
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

    // send feedback item to server
    fetch(`${BASE_API_URL}/feedbacks`, {
      method: "POST",
      body: JSON.stringify(feedbackItem), //pretvarmo js file u JSON format
      headers: {
        Accept: "application/json", // what kind of data we can accept back - we accept json
        "Content-Type": "application/json", // for json
      },
    }) // what we wont to do when we recieve response
      .then((response) => {
        if (!response.ok) {
          console.log("Something went wrong.");
          return;
        }

        console.log("Successfully submitted.");
      })
      .catch((error) => console.log(error));

    // insert new feedback item in list

    // clear textarea
    textareaEl.value = "";

    // blur submit button - not focus
    submitBtnEl.blur();

    // reset counter
    counterEl.textContent = MAX_CHARS;
  };

  formEl.addEventListener("submit", submitHandler);
})();

// -- FEEDBACK LIST COMPONENT --

(() => {
  const clickHandler = (event) => {
    // get clicked HTML-element
    const clickedEl = event.target;

    // determine if user intended to upvote or expand
    const upvoteIntention = clickedEl.className.includes("upvote");

    // run the appropriate logic
    if (upvoteIntention) {
      // get the closest upvote button
      const upvoteBtnEl = clickedEl.closest(".upvote");

      // disable upvote button (prevent double-click, spam)
      upvoteBtnEl.disabled = true;

      // select the upvote count element within the upvote button
      const upvoteCountEl = upvoteBtnEl.querySelector(".upvote__count");

      // get currently displayed upvote count as number (+), ovaj plus odmah konvertira u integer
      let upvoteCount = +upvoteCountEl.textContent;

      // set upvote count increment by 1
      upvoteCountEl.textContent = ++upvoteCount;
    } else {
      // expand the clicked feedback item
      clickedEl.closest(".feedback").classList.toggle("feedback--expand");
    }
  };

  feedbackListEl.addEventListener("click", clickHandler);

  fetch(`${BASE_API_URL}/feedbacks`)
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
      data.feedbacks.forEach((feedbackItem) =>
        renderFeedbackItem(feedbackItem)
      );
    })
    .catch((error) => {
      feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
    });
})();

// -- HASHTAG LIST COMPONENT --

(() => {
  const clickHandler2 = (event) => {
    // get clicked HTML element
    const clickedEl = event.target;

    // stop function if click happend in list, but outside buttons
    if (clickedEl.className === "hashtags") return;

    // extract company name
    const companyNameFromHashtag = clickedEl.textContent
      .substring(1)
      .toLowerCase()
      .trim();

    // iterate over each feedback item in the list - feedbackListEl je HTML element, a ne array
    feedbackListEl.childNodes.forEach((childNode) => {
      // stop this iteration if it's a text node, to je 3
      if (childNode.nodeType === 3) return;

      // extract company name
      const companyNameFromFeedbackItem = childNode
        .querySelector(".feedback__company")
        .textContent.toLowerCase()
        .trim();

      // we want to show same companyNameFromHashtag and companyNameFromFeedbackItem
      // remove feedback item from the list if company names are not equal
      if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
        childNode.remove();
      }
    });
  };

  hashtagListEL.addEventListener("click", clickHandler2);
})();
