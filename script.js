// -- GLOBAL --
const counterEl = document.querySelector(".counter");
const textareaEl = document.querySelector(".form__textarea");
const formEl = document.querySelector(".form");

// -- COUNTER COMPONENT --
const inputHandler = () => {
  // determine maximum number of characters
  const maxNrChar = 150;

  // determine number of characters currently typed
  const nrCharsTyped = textareaEl.value.length;

  // calculate number of characters left
  const charsLeft = maxNrChar - nrCharsTyped;

  //show number of characters left
  counterEl.textContent = charsLeft;
};

textareaEl.addEventListener("input", inputHandler);

// -- FORM (SUBMIT) COMPONENT --
const submitHandler = (event) => {
  // prevent default browser action (submitting form data to 'action'-address and refreshing page)
  event.preventDefault();

  // get text from textarea
  const text = textareaEl.value;

  // validate text (e.g. check if #hashtag is present and text is long enough)
  if (text.includes("#") && text.length > 4) {
    formEl.classList.add("form--valid");
    setTimeout(() => formEl.classList.remove("form--valid"), 2000);
  } else {
    formEl.classList.add("form--invalid");
    setTimeout(() => formEl.classList.remove("form--invalid"), 2000);
  }
};

formEl.addEventListener("submit", submitHandler);
