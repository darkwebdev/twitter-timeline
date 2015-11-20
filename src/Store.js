const _ = require('lodash');
const req = require('axios');
const EventEmitter = require('events').EventEmitter;
const disp = require('./dispatcher');

const buildUrl = function(filter) {
    const filterStr = (filter.text ? 'q=' + filter.text : '') +
        (filter.geocode ? '&geocode=' + filter.geocode : '');

    return 'url' + (filterStr ? '?' + filterStr : '');
};

const buildTimeline = function(q) {
    return _.compact(_.flatten(q));
};

var Store = function(queriesData) {
    var queries = queriesData || [];
    var timeline = [];
    var state = {};

    var store = _.extend({}, EventEmitter.prototype, {
        emitChange: function () {
            console.log('emit change');
            this.emit('change');
        },

        addChangeListener: function (callback) {
            this.on('change', callback);
        },
        removeChangeListener: function (callback) {
            this.removeListener('change', callback);
        },

        ajax: req,
        fetch: function (index, filter) {
            store.ajax(buildUrl(filter)).then(function (data) {
                queries[index] = data.statuses;
                console.log('fetch queries', queries.length);
                store.emitChange();
            });

            return this;
        },
        fetchAll: function (filters) {
            _.each(queries, function (q, i) {
                this.fetch(i, filters.length ? filters[i] : {});
            });

            return this;
        },

        getTimeline: function () {
            return timeline;
        },

        getState: function () {
            return state;
        },

        updateTimeline: function() {
            timeline = buildTimeline(queries);
        }
    });

    store.addChangeListener(store.updateTimeline);

    if (queries.length) store.emitChange();

    disp.register(function (action) {
        switch (action.type) {
            case 'filterChanged':
                store.fetch(action.index, {
                    text: action.text,
                    geocode: action.geocode
                });
                break;
        }
    });

    return store;
};

module.exports = Store;