import React, {Component} from 'react';
import ScreenSizeBreakpoint from "../ScreenSizeBreakpoint";

class HomePage extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ScreenSizeBreakpoint>
                <div className="notification">
                    Hello
                </div>
            </ScreenSizeBreakpoint>
        );
    }
}

export default HomePage;
