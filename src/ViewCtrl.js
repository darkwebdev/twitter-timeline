const React = require('react');
const Timeline = require('./Timeline');

module.exports = React.createClass({
    getState: function() {
        return {
            timeline: this.props.store.getTimeline(),
            filter: this.props.store.getFilters()
        }
    },
    getInitialState: function() {
        return this.getState();
    },
    render: function () {
        return (
            <div>
                <Timeline list={ this.state.timeline } />
            </div>
        );
    }
});