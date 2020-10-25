import React, {Component} from 'react';
import {Link} from "react-router-dom";


class RedirectLink extends Component {

    constructor(props) {
        super(props);
    };

    render() {
        return (
            <Link to={() => {
                let regex = /^.+?[^\/:](?=[?\/]|$)/gi;
                let redirection = window.location.href.replace(regex, '');

                if (this.props.to === '/login' || this.props.to === '/logout') {
                    return this.props.to + '?redirect=' + btoa(redirection);
                }

                return this.props.to;
            }}>
                {this.props.children}
            </Link>
        )
    }
}

export default RedirectLink;