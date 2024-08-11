"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favList = $("#favlist");//me

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $accountFormBox = $("account-forms-container");//me
const $storySubmissionForm = $("#article-submission-form");//me

const $navLogin = $("#nav-login");
const $navLogOut = $("#nav-logout");
const $navUserProfile = $("#nav-user-profile");
const $userNavLinks = $("#user-nav-links")
const $navSubmit = $("#nav-submit");//me
const $navFav = $("#nav-fav");//me
const $navMyStory = $("nav-my-stories");//me 

//user fav stories const $favUserStories = $("#") //me
//user authored stories const $userAuthorStories = $("#"") //me
//stories container const $storiesContainer = $("#"") //me

const $userProfile = $("#userProfile");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $favList,
    $storySubmissionForm
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
