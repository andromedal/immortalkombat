import React from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

//components imports
import Game from './Game'
import Home from './Home'
import WaitRoom from './waitRoom'
import Login from './auth/login_form_container'
import Signup from './auth/signup_form_container'
import { AuthRoute, ProtectedRoute } from '../util/route_util'
import Profile from './profile'
import Stats from './Stats'

function App() {
  return (
    <>
        <Switch>
          {/* debugging  */}
          <Route exact path="/testgame" component={Game} />
          
          <ProtectedRoute exact path="/game" component={Game} />
          <AuthRoute exact path="/signup" component={Signup} />
          <AuthRoute exact path="/login" component={Login} />
          <Route exact path='/stats' component={Stats} />
          <Route exact path='/profile' component={Profile} />
          <Route exact path="/waitroom" component={WaitRoom} />
          <Route path="/" component={Home} />
        </Switch>
    </>
  );
}

export default App;
