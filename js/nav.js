"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** 
 * Show main list of all stories when click site name 
 * 
 * @param {Event} evt The click event object.
 */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}
$body.on("click", "#nav-all", navAllStories);



/**
 * Handles the click event on "Login" navigation and updates
 *  the UI.
 * 
 * Prevents default form submission, hides other components,
 *  and shows the login and signup forms.
 *
 * @param {Event} evt The click event object.
 */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on("click", navLoginClick);

/**
 * Updates the navigation bar after a successful user login.
 * 
 * Hides login elements, shows logout and user-related links, 
 *  and updates username.
 */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $navLogin.hide();
  $navLogOut.show();
  $userNavLinks.show();
  $navSubmit.show();
  $navFav.show();
  $navMyStory.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/**
 * This function will handle the click event for displaying 
 *  the story submission form when submit is clicked.
 * 
 *  Hides other components, populates and shows the form
 * 
 * @param {Event} evt The click event object
 */
function getStorySubmissionForm(evt) {
  console.debug("getStorySubmissionForm", evt);
  evt.preventDefault();
  hidePageComponents();
  $storySubmissionForm.show();
}
$navSubmit.on("click", getStorySubmissionForm);


/**
 * Handles the click event on the "Favorites" navigation 
 *  and updates the UI.
 * 
 * Hides other components, populates and shows the user's 
 *  favorite stories list.
 *
 * @param {Event} evt The click event object.
 */
function getFavoritesList(evt) {
  console.debug("getFavoritesList", evt);
  hidePageComponents();
  getFavoritesOnPage();
  $favList.show();
}
$navFav.on("click", getFavoritesList);

/**
 * Handles the click event on "My Stories" navigation 
 *  and updates the UI.
 * 
 * Through the process it Hides other components, 
 *  populates and shows the user's stories list.
 *
 * @param {Event} evt The click event object.
 */
function getMyStoriesList(evt) {
  console.debug("getMyStoriesList", evt);
  // evt.preventDefault();
  hidePageComponents();
  getMyStoriesOnPage();
  $myStoriesList.show();
}
$navMyStory.on("click", getMyStoriesList);
