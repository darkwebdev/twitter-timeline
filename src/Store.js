const _ = require('lodash');
const req = require('reqwest');
const EventEmitter = require('events').EventEmitter;
const disp = require('./dispatcher');

const buildUrl = function(filter) {
    const url= 'http://demo.suitepad.systems/1.1/search/tweets.json';
    //const url= './test/tweets.json';
    const filterStr = (filter.text ? 'q=' + filter.text : '') +
        (filter.geocode ? '&geocode=' + filter.geocode : '') +
        (filter.lang ? '&lang=' + filter.lang : '');

    return url + (filterStr ? '?' + filterStr : '');
};

const buildTimeline = function(q) {
    return _.chain(q)
        .flatten()
        .compact()
        .sortByOrder(function(tweet) { return new Date(tweet.created_at); }, ['desc'])
        .value();
};

var Store = function(queriesData) {
    var queries = queriesData || [];
    var filters = [ {
        text: 'ios',
        geocode: [-33.86, 151.211, '1000km'],
        lang: 'en'
    }, {}, {} ];

    var store = _.extend({}, EventEmitter.prototype, {
        emitChange: function () {
            this.emit('change');
        },

        addChangeListener: function (callback) {
            this.on('change', callback);
        },
        removeChangeListener: function (callback) {
            this.removeListener('change', callback);
        },

        ajax: req,
        fetch: function (filter) {
            const ajaxOptions = {
                url: buildUrl(filter),
                type: 'jsonp'
            };

            return store.ajax(ajaxOptions);
        },
        updateQuery: function(index, filter) {
            if (!filter || filter.text) {
                this.fetch(filter || filters[index]).then(function (data) {
                    queries[index] = data.statuses;
                    store.emitChange();
                }, function(err) {
                    console.error('Error fetching tweets', err);
                });
            } else {
                queries[index] = [];
                store.emitChange();
            }
        },
        updateFilter: function(index, settings) {
            filters[index] = settings;
        },

        getState: function () {
            return {
                timeline: buildTimeline(queries),
                filters: filters
            };
        },

        close: function() {
            disp.unregister(dispToken);
        }
    });

    if (queries.length) store.emitChange();

    var dispToken = disp.register(function (action) {
        switch (action.type) {
            case 'update':
                if (action.filters) {
                    store.updateFilter(action.index, action.filters);
                }
                store.updateQuery(action.index, filters[action.index]);
                break;
        }
    });

    return store;
};

module.exports = Store;