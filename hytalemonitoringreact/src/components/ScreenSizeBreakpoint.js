import React, {Component} from 'react';
import MediaQuery from 'react-responsive'

class ScreenSizeBreakpoint extends Component {

    constructor(props) {
        super(props);
    };

    render() {
        return (
            <div>
                {/* Mobile */}
                <MediaQuery maxDeviceWidth={768}>
                    <section style={{padding: "3rem 0.5rem"}} className="section">
                        {this.props.children}
                    </section>
                </MediaQuery>

                {/* Tablets */}
                <MediaQuery minDeviceWidth={769} maxDeviceWidth={1023}>
                    <section style={{padding: "3rem 0.5rem"}} className="section">
                        {this.props.children}
                    </section>
                </MediaQuery>

                {/* Desktop */}
                <MediaQuery minDeviceWidth={1024} maxDeviceWidth={1215}>
                    <section className="section">
                        <div className="container">
                            {this.props.children}
                        </div>
                    </section>
                </MediaQuery>

                {/* Big screens */}
                <MediaQuery minDeviceWidth={1216}>
                    <section className="section">
                        <div className="container">
                            {this.props.children}
                        </div>
                    </section>
                </MediaQuery>
            </div>
        )
    }
}

export default ScreenSizeBreakpoint;
