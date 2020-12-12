import React from "react";
import { Route } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import Nav from './Nav';
import Auth from "./Auth/Auth";
import Callback from "./Callback";
class App extends React.Component {
  
  constructor(props) {
    super(props);
    // sharing an instance of the Auth class, so we can call it from our components.
    // history will be automatically be injected into this component (on props) because in index.js we wrapped the App with <Router> 
    this.auth = new Auth(this.props.history);
  }
  
  render() {
    return(
      <>
        <Nav auth={this.auth} />
        <div className="body">
          {/* how to pass the Auth object as a prop to a component since the component itself is delcared as a prop? the solution is use a render prop instead*/}
          <Route path="/" exact render={props => <Home auth={this.auth} {...props} />}/>
          <Route path="/callback" render={props => <Callback auth={this.auth} {...props} />}/>
          <Route path="/profile" component={Profile}/>
        </div>
      </>
    );
  }
}

export default App;
