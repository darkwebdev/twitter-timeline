var React = require('react');

module.exports = React.createClass({
    render: function() {
        return (
            <div className="filters">
                <div className="filters-text">
                    <input type="text" value={ this.props.settings.text } placeholder="Search..."/>
                </div>
                <div className="filters-geocode">
                    <input type="text" value={ this.props.settings.geocode } placeholder="Geocode"/>
                </div>
                <div className="filters-lang">
                    <input type="text" value={ this.props.settings.lang } placeholder="Language"/>
                </div>
            </div>
        );
    }
});
