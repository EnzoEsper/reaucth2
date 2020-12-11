import auth0 from 'auth0-js';

export default class Auth {
  // passing the react router history will allow to programatically interact with
  // react router since we have a reference to the history object within our Auth object here
  constructor(history) {
    this.history = history;
    this.auth0 = new auth0.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_CALLBACK_URL,
      responseType: "token id_token",
      scope: "openid profile email"
    });
  }
}