"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".user-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $userNavLinks.removeClass('hidden');//////////HELP
  $navUserProfile.text(`${currentUser.username}`).show();

}

/**
 * This function will display the story submission
 *  form when submit is clicked.
 * 
 * @param {Event} evt 
 */
function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $storySubmissionForm.show();
  console.log("nav submit clicked")
}

$navSubmit.on("click", navSubmitClick);

// const navSubmitBtn = document.querySelector('#nav-submit');
// navSubmitBtn.addEventListener('click', function () {
//   console.log("nav submit btn click");
// });

//Favorites function for clicking on fav btn
