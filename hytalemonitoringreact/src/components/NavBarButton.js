import React, {Component} from 'react';
import {Link} from "react-router-dom";

// Buttons for the navbar
class NavBarButton extends Component {

    constructor(props) {
        super(props);

        this.state = {refTo: null};
    }

    clickHandle = () => {
        // If the needed location (this.props.refTo) is /login we redirect to login with the redirection url

        /*
        if (this.props.refTo === '/login') {
            browserHistory.push('/login?redirect=' + btoa(window.location.href));
        }

        // Else classic redirect
        else {
            browserHistory.push(this.props.refTo);
        }

         */
    };

    render() {
        return (
            <p className="control">
                <Link to={() => {
                    let regex = /^.+?[^\/:](?=[?\/]|$)/gi;
                    let redirection = window.location.href.replace(regex, '');

                    if (this.props.refTo === '/login' || this.props.refTo === '/logout') {
                        return this.props.refTo + '?redirect=' + btoa(redirection);
                    }

                    return this.props.refTo;
                }}>
                    <span className={this.props.classes} style={this.props.style}>
                        <span className="icon">{this.props.iconRef}</span>
                        <span>{this.props.textInside}</span>
                    </span> </Link>
            </p>
        );
    }
}

NavBarButton.loginRedirect = '';

export default NavBarButton;
