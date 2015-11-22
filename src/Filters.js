var React = require('react');

module.exports = React.createClass({
    getInitialState: function() {
        return this.props.settings;
    },
    onTextChange: function(event) {
        this.setState({ text: event.target.value });
        this.onChange();
    },
    onGeocodeChange: function(event) {
        this.setState({ geocode: event.target.value });
        this.onChange();
    },
    onLangChange: function(event) {
        this.setState({ lang: event.target.value });
        this.onChange();
    },
    onChange: function () {
        this.props.onChange(this.props.index, this.state);
    },
    render: function() {
        return (
            <div className="filters">
                <div className="filters-text">
                    <input type="text"
                           onChange={ this.onTextChange }
                           value={ this.state.text }
                           placeholder="Search..."/>
                </div>
                <div className="filters-geocode">
                    <input type="text"
                           onChange={ this.onGeocodeChange }
                           value={ this.state.geocode }
                           placeholder="Geocode"/>
                </div>
                <div className="filters-lang">
                    <input type="text"
                           onChange={ this.onLangChange }
                           value={ this.state.lang }
                           placeholder="Language"/>
                </div>
            </div>
        );
    }
});
