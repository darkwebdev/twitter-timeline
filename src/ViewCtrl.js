const React = require('react');
const Timeline = require('./Timeline');
const Filters = require('./Filters');
const disp = require('./dispatcher');

module.exports = React.createClass({
    getState: function() {
        return this.props.store.getState();
    },
    getInitialState: function() {
        return this.getState();
    },
    componentDidMount: function() {
        this.props.store.addChangeListener(this.onChange);
        this.update();
    },
    onChange: function() {
        this.setState(this.getState());
    },
    update: function() {
        console.log('view update');
        disp.dispatch({
            type: 'update',
            filter: {
                text: 'react flux',
                geocode: null,
                lang: 'en'
            },
            index: 0
        });
    },
    render: function () {
        return (
            <div>
                <Filters settings={ this.state.filters } />
                <Timeline list={ this.state.timeline } />
            </div>
        );
    }
});