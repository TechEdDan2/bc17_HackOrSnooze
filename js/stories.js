"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * - show the delete button 
 * - show the star button
 *
 * Returns the markup for the story.
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

// Create the HTML for the delete button trash can
function getDeleteBtn() {
  return `<span class="trashCan">
            <i class="fas fa-trash"></i>
          </span>`;
}

// Create the HTML for the heart button
function getHeart(story, user) {
  const isFav = user.isFavorite(story);
  const heartFill = isFav ? "fas" : "far";
  return `<span class="heartBtn">
            <i class="${heartFill} fa-heart"></i>
          </span>`;
}

//Trash a story
async function trashStory(e) {
  console.debug("trashStory");
  let $target = $(e.target);
  console.log(`Clicked: ${$target}`);

  let $closestListId = $target.closest("ol").attr("id");
  let $trgtStoryId = $target.closest("li").attr("id");
  console.log(`StoryID: ${$trgtStoryId}`);

  // let $trgtStory = storyList.stories.filter(story =>
  //   story.storyId === $trgtStoryId);

  // await currentUser.unFavorite($trgtStory);
  await storyList.deleteStory(currentUser, $trgtStoryId);

  //update all list TO DO
  updateUI($closestListId);
  hidePageComponents();
  putStoriesOnPage();
  $allStoriesList.show();


}
$storiesList.on("click", ".trashCan", trashStory);

// Updates the stories shown based on the specific list selected to ensure the correct updated stories show on the screen.  Updates UI without a reload.  Used for deleting and favorite-ing stories
function updateUI(closestListId) {
  if (closestListId === "all-stories-list") {
    getAndShowStoriesOnStart();
  } else if (closestListId === "favList") {
    putFavoritesOnPage();
  } else if (closestListId === "mStoriesList") {
    putOwnStoriesOnPage();
  }
}


//Update Fav List
async function updateFav(e) {
  console.log("heart clicked");

  let $target = $(e.target);
  console.log(`this is the target ${$target}`);

  let $targetI = $target.closest("i").attr("class");
  console.log(`this is the target I: ${$targetI}`);

  let $trgtStoryId = $target.closest("li").attr("id");
  console.log(`this is the target Story ID: ${$trgtStoryId}`);

  let $trgtStory = storyList.stories.find((story) => story.storyId === $trgtStoryId);
  console.log(`this is the story ${$trgtStory}`);

  let $closestListId = $target.closest("ol").attr("id");
  console.log(`this is the closest list ID: ${$closestListId}`);

  if ($target.hasClass("far fa-heart")) {
    $target.toggleClass("fas fa-heart");
    console.log(`I changed the target I attr: ${$targetI}`);
    await currentUser.addFavorite($trgtStory);
  } else {
    $target.removeClass("fas fa-heart");
    $target.addClass("far fa-heart")
    console.log("Unheart");
    await currentUser.unFavorite($trgtStory);
  }

  putStoriesOnPage();
  updateUI($closestListId);

}

$storiesList.on("click", ".heartBtn", updateFav);

/** Gets list of stories from server, generates their HTML, and puts on page. */

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

//Handle Submitting Stories
async function submitNewStory(e) {
  console.debug("submitNewStory");
  e.preventDefault();

  //Collect new story form data
  const author = $("#authorInput").val();
  const title = $("#titleInput").val();
  const url = $("#urlInput").val();
  const username = currentUser.username;
  const newStoryData = { title, url, author, username };

  // Add this new story to the Global Story List
  // storySubmissionForm

  const newStory = await storyList.addStory(
    currentUser,
    newStoryData
  );

  $storySubmissionForm.trigger("reset");
  $storySubmissionForm.hide();
  $allStoriesList.prepend(generateStoryMarkup(newStory));



}

$storySubmissionForm.on('submit', submitNewStory);

// TODO add Story to favorite list
function getMyStoriesOnPage() {
  console.log("getMyStoriesOn called");
  console.log(currentUser.ownStories);


  $myStoriesList.empty();


  if (currentUser.ownStories.length === 0) {
    $myStoriesList.append("<h3>You currently haven't added any stories</h3>");
    console.log("if Ex for getOwnPage");
  } else {
    // loop through all user owned stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      console.log("else Ex for getOwnPage");
      // pass true for second param to display trashcan
      let $story = generateStoryMarkup(story, true);
      $myStoriesList.append($story);
    }
  }

  $myStoriesList.show();
}

async function getFavoritesOnPage() {
  console.log("getFavOnPage was called");

  console.log(currentUser.favorites);
  console.log(currentUser.favorites.length);


  $favList.empty();

  if (currentUser.favorites.length === 0) {
    $favList.append("<h3>You currently haven't added any stories to your Favs</h3>");
    console.log("if Ex for getFavPage");
  } else {
    console.log("else Ex for getFavPage");
    // loop through all favorite stories and generate HTML for them
    for (let story of currentUser.favorites) {
      let $story = generateStoryMarkup(story);
      $favList.append($story);
    }
  }

  console.log("Take a look at my favs:")
  console.log(currentUser.favorites);

  $favList.show();
}
