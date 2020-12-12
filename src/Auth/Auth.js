import auth0 from "auth0-js";

export default class Auth {
  // passing the react router history will allow to programatically interact with
  // react router since we have a reference to the history object within our Auth object here
  constructor(history) {
    this.history = history;
    this.userProfile = null;
    this.auth0 = new auth0.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_CALLBACK_URL,
      responseType: "token id_token",
      scope: "openid profile email",
    });
  }

  login = () => {
    // method available on the auth0 WebAuth object; this will redirect the browser to the auth0 login page 
    this.auth0.authorize();
  };

  handleAuthentication = () => {
    // function built-in in the auth0-js library to parse the hash from the url; what we get from it is an error object or a result
    this.auth0.parseHash((err, authResult) => {
      // we expecting to receive the authResult and the authResult should haven an acces and an id token 
      if (authResult && authResult.accessToken && authResult.idToken) {
        // if we receive the info that we expected then we are going to create our session and store some data in local storage (there are better options) 
        this.setSession(authResult);
        // programatically tell react router to redirect to a new url
        this.history.push("/");
      } else if(err) {
        this.history.push("/");
        alert(`Error: ${err.error}. Check the console for further details.`);
        console.log(err);
      }
    });
  };

  setSession = (authResult) => {
    // set the time that the acces token will expire, so we can write this to localstorage and check wheter the jwt is still valid
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());

    // alternatively we can use jwt-decode (on npm) for this, and put this logic in the React components if preferred
    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);
  };

  // determine whether the user is authenticated
  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  };

  logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    this.userProfile = null;
    // this is for a soft logout (soft logout: it doesnt kill the session in the auth0 server)
    // note: aparently auth0 doesnt keep making a soft logout with this approach, and the this.auth.logout will be innecesary
    // this.history.push("/");
    
    // this is for a non soft logout
    this.auth0.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: "http://localhost:3000"
    })
  };

  // will get the acces token from localstorage and throw an error if the acces token isnt found
  getAccesToken = () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No acces token found.");
    }

    return accessToken;
  };

  getProfile = (cb) => {
    // return the user's profile if is already found
    if (this.userProfile) return cb(this.userProfile);
    // obtain the user's profile (or an error) if it wasnt found inmediately
    this.auth0.client.userInfo(this.getAccesToken(), (err, profile) => {
      if (profile) this.userProfile = profile;
      cb(profile, err);
    })
  }
}
