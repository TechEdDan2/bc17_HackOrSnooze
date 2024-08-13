"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {


  /**
   * Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   * 
   * @param {Object} object constructor expects an object with the listed properties 
   */
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /**
   * Parses hostname out of URL and returns it.
   * 
   * @returns the hostname from the story's URL
   */
  getHostName() {
    const storyURL = new URL(this.url)
    console.log(storyURL);
    return storyURL.hostname;
  }

  /**
 * Retrieves a story by its ID from the server and creates a Story instance.
 *
 * @static
 * @async
 * @param {string} storyId The ID of the story to retrieve.
 * @returns {Promise<Story>} A Promise that resolves to a Story object.
 */
  static async getStoryById(storyId) {
    let res = await axios.get(`${BASE_URL}/stories/${storyId}`);
    return new Story(res.data.story);
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */
  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method? - a static method can be accessed without an  
    //  instance  

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /**
   * Adds a new story to the server and creates a Story instance.
   *
   * - Example
   * {
   *  "token": "YOUR_TOKEN_HERE",
   *  "story": {
   *    "author": "Matt Lane",
   *    "title": "The best story ever",
   *    "url": "http://google.com"
   *  }
   * }
   * 
   * @async
   * @param {User} user The user object representing the current user.
   * @param {object} storyData An object containing the new story's details.
   * @param {string} storyData.title The title of the story.
   * @param {string} storyData.author The author of the story.
   * @param {string} storyData.url The URL of the story.
   * @returns {Promise<Story>} A Promise that resolves to a newly created Story object.
   */
  async addStory(user, { title, author, url }) {
    const token = user.loginToken;
    console.log(token);
    const newStory = {
      token,
      story: {
        author: author,
        title: title,
        url: url
      }
    }
    const res = await axios.post(`${BASE_URL}/stories`, newStory);

    const story = new Story(res.data.story);
    console.log(story);

    // Update the Stories Dataset this.stories.pop(story)?

    return story;
  }

  /**
   * Deletes a story from the server and updates local data structures.
   * 
   * @async
   * @param {User} user The user object representing the current user.
   * @param {string} storyId The ID of the story to delete.
   */
  async deleteStory(user, storyId) {
    const token = user.loginToken;
    console.log(`Current User Token: ${token}`);
    // await axios.delete(`${BASE_URL}/stories/${storyId}`, token);

    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken }
    });

    // Remove the story from stories, user stories, and user favs
    this.stories = this.stories.filter(story => story.storyId !== storyId);

    user.ownStories = user.ownStories.filter(story => story.storyId !== storyId);
    user.favorites = user.favorites.filter(story => story.storyId !== storyId);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {

  /**
   * Creates a User instance from a data object and login token.
   * 
   * @constructor
   * @param {object} userData An object containing user details.
   * @param {string} userData.username The username of the user.
   * @param {string} [userData.name] The user's display name (optional).
   * @param {Date} userData.createdAt The date and time the user account was created.
   * @param {Story[]} [userData.favorites=[]] An array of Story objects representing the user's favorites (optional, defaults to empty array).
   * @param {Story[]} [userData.ownStories=[]] An array of Story objects representing the user's own stories (optional, defaults to empty array).
   * @param {string} token The user's login token.
   */
  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /**
   * Register new user in API, make User instance & return it.
   * 
   * @static
   * @async
   * @param {string} username The desired username for the new account.
   * @param {string} password The password for the new account.
   * @param {string} [name] The user's display name (optional).
   * @returns {Promise<User>} A Promise that resolves to a newly created User object.
   */
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** 
   * Login in user with API, make User instance & return it.
   * @static
   * @async
   * @param {string} username The user's username.
   * @param {string} password The user's password.
   * @returns {Promise<User|null>} A Promise that resolves to a User object if login is successful, or null if it fails.
   */
  static async login(username, password) {

    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );

  }

  /**
   * When we already have credentials (token & username) for a user, it
   * attempts to log in a user using stored credentials (token and username).
   * Fetches user data from the server and returns a User instance if successful.
   * 
   * @static
   * @async
   * @param {string} token The user's login token.
   * @param {string} username The user's username.
   * @returns {Promise<User|null>} A Promise that resolves to a User object if login is successful, or null if it fails.
   * 
   */
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /**
   * Takes an instance of a story and adds a story to the 
   *  user's favorites list and updates the server.
   * 
   * @async
   * @param {Story} story The story to add to favorites.
   */
  async addFavorite(story) {
    console.log("addFavorite ran");
    const response = await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "POST",
      data: { token: this.loginToken }
    });
    this.favorites.push(story);
  }

  /**
   * Takes a Story instance and removes it from the user's favorites 
   *  and updates the server.
   * 
   * To do this it uses filter to help remove the story with matching StoryID
   * 
   * @async
   * @param {Story} story The story to remove from favorites.
   */
  async unFavorite(story) {
    console.log("unFavorite ran");
    this.favorites = this.favorites.filter(
      item => item.storyId !== story.storyId);

    const response = await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: "DELETE",
      data: { token: this.loginToken }
    });
  }

  /**
   * Checks if the given story is in the user's favorites list.
   * 
   * @param {Story} story The story to check.
   * @returns {boolean} True if the story is a favorite, false otherwise.
   */
  isFavorite(story) {
    return this.favorites.some(function (favSory) {
      return favSory.storyId === story.storyId;
    });
  }


}
