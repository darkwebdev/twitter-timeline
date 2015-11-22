const _ = require('lodash');
const React = require('react');

const Timeline = require('./Timeline');
const Filters = require('./Filters');
const disp = require('./dispatcher');
const filtersAmount = 3;

module.exports = React.createClass({
    getState: function() {
        return this.props.store.getState();
    },
    getInitialState: function() {
        return this.getState();
    },
    componentDidMount: function() {
        this.props.store.addChangeListener(this.onChange);
        this.updateAll();
    },
    onChange: function() {
        this.setState(this.getState());
    },
    update: function(index, filters) {
        disp.dispatch({
            type: 'update',
            filters: filters,
            index: index
        });
    },
    updateAll: function() {
        _.range(filtersAmount).map(_.bind(function(index) {
            this.update(index);
        }, this));
    },
    render: function () {
        return (
            <div>
                {
                    _.range(filtersAmount).map(_.bind(function(index) {
                        return (
                            <Filters
                                index={ index }
                                settings={ this.state.filters[index] }
                                onChange={ this.update }
                            />
                        );
                    }, this))
                }
                <Timeline list={ this.state.timeline } />
            </div>
        );
    }
});