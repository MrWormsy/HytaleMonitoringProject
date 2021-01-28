import React, {Component} from 'react';
import {Link} from "react-router-dom";
import NavBarRigthButtons from "./NavBarRigthButtons";


// Buttons for the navbar
class Navbar extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <nav className="navbar is-fixed-top header is-transparent" id="header">
                    <div className="navbar-brand">
                        <Link className="navbar-item" to={'/'} style={{color: '#fff', outline: 0}}> <img alt="Omnivexel"
                                                                                                         height="28"
                                                                                                         src="/logo.png"
                                                                                                         width="112"/>
                        </Link>
                        <div className="navbar-burger" id="navbarBurger" data-target="navbarExampleTransparentExample">
                            <span aria-hidden="true"/> <span aria-hidden="true"/> <span aria-hidden="true"/>
                        </div>
                    </div>

                    <div className="navbar-menu" id="navbarExampleTransparentExample">
                        <div className="navbar-start">
                            <Link className="navbar-item" to={'/home'} style={{color: '#fff', outline: 0}}>Home</Link>
                            <Link className="navbar-item" to={'/server/preview'} style={{color: '#fff', outline: 0}}>Servers</Link>
                            <Link className="navbar-item" to={'/forum'} style={{color: '#fff', outline: 0}}>Forum</Link>
                            <Link className="navbar-item" to={'/support'} style={{color: '#fff', outline: 0}}>Support</Link>
                            <Link className="navbar-item" to={'/addserver'} style={{color: '#fff', outline: 0}}>Add a server</Link>

                            <span className="navbar-item" style={{color: '#fff'}}>

                            </span>
                        </div>

                        <div className="navbar-end">
                            <div className="navbar-item" id="navBarButtons">
                                <NavBarRigthButtons/>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}

export default Navbar;
