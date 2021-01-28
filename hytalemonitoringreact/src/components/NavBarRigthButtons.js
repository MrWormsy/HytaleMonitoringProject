import React, {Component} from 'react';

import NavBarButton from './NavBarButton';

class NavBarRigthButtons extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        // We have to choices if the user is logged we render the profile button and the logout one otherwise only the  log in
        if (localStorage.getItem('userId')) {
            return (
                <div className="field is-grouped">
                    <NavBarButton textInside="Profile" classes="button is-light" refTo="/profile" style={{}} iconRef=<i
                                  className="fas fa-user-circle"/> /> <NavBarButton textInside="Log Out"
                                                                                    classes="button is-danger"
                                                                                    refTo="/logout"
                                                                                    style={{backgroundColor: '#c96567'}}
                                                                                    iconRef=<i
                                                                                    className="fas fa-sign-out-alt"/> />
                </div>
            );
        } else {
            return (
                <div className="field is-grouped">
                    <NavBarButton textInside="Log In" classes="button is-light" refTo="/login"
                                  style={{backgroundColor: '#97a9bd'}} iconRef=<i className="fas fa-sign-in-alt"/> />
                </div>
            );
        }
    }
}

export default NavBarRigthButtons;