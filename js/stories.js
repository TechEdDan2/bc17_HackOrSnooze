"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;


/**
 * Fetches a list of stories, removes the loading message, 
 *  and displays the stories on the page.
 *
 * @async
 */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * Generates HTML markup representing a single Story instance.
 *
 * @param {Story} story The story object containing story information.
 * @param {boolean} [showDeleteBtn=false] Whether to include a delete button (optional). Defaults to false.
 * @returns {jQuery} A jQuery object containing the generated story markup.
 */
function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  //Display stars based on user
  const showHeart = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? getDeleteBtn() : ""}
        ${showHeart ? getHeart(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        </div>
        </li>
    `);
}

/**
 * Generates HTML markup for a delete button.
 *
 * @returns {string} The HTML string representing the delete button.
 */
function getDeleteBtn() {
  return `<span class="trashCan">
            <i class="fas fa-trash"></i>
          </span>`;
}

/**
 * Generates HTML markup for a heart button, indicating 
 *  whether the story is favorited.
 *
 * @param {Story} story The story object.
 * @param {User} user The user object.
 * @returns {string} The HTML string representing the heart button.
 */
function getHeart(story, user) {
  const isFav = user.isFavorite(story);
  const heartFill = isFav ? "fas" : "far";
  return `<span class="heartBtn">
            <i class="${heartFill} fa-heart"></i>
          </span>`;
}

/**
 * Handles the click event on a trash can icon associated with a story.
 * Extracts the ID of the closest parent <ol> element ($closestListId), 
 * which represents the story list container.
 * 
 * Deletes the story, updates the UI, and potentially hides/shows 
 * page components.
 *
 * @param {Event} e The click event object.
 * @async
 * @returns {Promise<void>} Resolves when the story deletion and UI update are complete.
 */
async function trashStory(e) {
  console.debug("trashStory");
  let $target = $(e.target);

  let $closestListId = $target.closest("ol").attr("id");
  let $trgtStoryId = $target.closest("li").attr("id");

  await storyList.deleteStory(currentUser, $trgtStoryId);

  //update all list TO DO
  updateUI($closestListId);
  hidePageComponents();
  putStoriesOnPage();
  $allStoriesList.show();

}
$storiesList.on("click", ".trashCan", trashStory);

/**
 * Updates the UI based on the specified list ID.
 * 
 * Used for deleting and favorite-ing stories
 *
 * @param {string} closestListId The ID of the closest list element.
 */
function updateUI(closestListId) {
  if (closestListId === "all-stories-list") {
    getAndShowStoriesOnStart();
  } else if (closestListId === "favList") {
    putFavoritesOnPage();
  } else if (closestListId === "mStoriesList") {
    putOwnStoriesOnPage();
  }
}


/**
 * Handles clicks on the heart icon associated with a story.
 * Toggles the story's favorited state for the user and updates the UI.
 *
 * @param {Event} e The click event object.
 * @returns {Promise<void>} Resolves when the favorite update and UI update are complete.
 */
async function updateFav(e) {
  let $target = $(e.target);
  let $targetI = $target.closest("i").attr("class");

  let $trgtStoryId = $target.closest("li").attr("id");
  let $trgtStory = storyList.stories.find((story) => story.storyId === $trgtStoryId);

  let $closestListId = $target.closest("ol").attr("id");

  if ($target.hasClass("far fa-heart")) {
    $target.toggleClass("fas fa-heart");
    await currentUser.addFavorite($trgtStory);
  } else {
    $target.removeClass("fas fa-heart");
    $target.addClass("far fa-heart");
    await currentUser.unFavorite($trgtStory);
  }

  putStoriesOnPage();
  updateUI($closestListId);

}

$storiesList.on("click", ".heartBtn", updateFav);

/**
 * Clears existing content, gets list of stories from server, 
 *  generates markup for each story, and appends it to the list.
 */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**
 * Handles the submission of a new story.
 * 
 * Collects story data, creates a new story, adds the new story 
 *  to the global story list, and updates the UI.
 *
 * @param {Event} e The submission event object.
 * @returns {Promise<void>} Resolves when the new story is added and the UI is updated.
 */
async function submitNewStory(e) {
  console.debug("submitNewStory");
  e.preventDefault();

  const author = $("#authorInput").val();
  const title = $("#titleInput").val();
  const url = $("#urlInput").val();
  const username = currentUser.username;
  const newStoryData = { title, url, author, username };

  const newStory = await storyList.addStory(
    currentUser,
    newStoryData
  );

  $storySubmissionForm.trigger("reset");
  $storySubmissionForm.hide();
  $allStoriesList.prepend(generateStoryMarkup(newStory));
}

$storySubmissionForm.on('submit', submitNewStory);

/**
 * Populates the user's own stories list with appropriate content.
 * 
 * Clears existing content, displays a message if no stories exist,
 *  else it generates HTML markup with trashcans for each user story and 
 *  appends it to the list.
 * 
 */
function getMyStoriesOnPage() {

  $myStoriesList.empty();


  if (currentUser.ownStories.length === 0) {
    $myStoriesList.append("<h3>You currently haven't added any stories</h3>");
  } else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $myStoriesList.append($story);
    }
  }

  $myStoriesList.show();
}

/**
 * Populates the user's favorites list with appropriate content.
 * 
 * Clears existing content, displays a message if no favorites exist,
 *  else it generates HTML markup for each favorite story and appends 
 *  it to the list.
 */
async function getFavoritesOnPage() {
  $favList.empty();

  if (currentUser.favorites.length === 0) {
    $favList.append("<h3>You currently haven't added any stories to your Favs</h3>");
  } else {
    // loop through all favorite stories and generate HTML for them
    for (let story of currentUser.favorites) {
      let $story = generateStoryMarkup(story);
      $favList.append($story);
    }
  }

  $favList.show();
}
