const _ = require('lodash');
const req = require('reqwest');
const EventEmitter = require('events').EventEmitter;
const disp = require('./dispatcher');

const defaultFilters = [ {
    text: 'ios',
    geocode: [-33.86, 151.211, '1000km'],
    lang: 'en'
}, {}, {} ];

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

const Store = function(options) {
    options = options || {};
    const storage = options.storage ||
        (typeof window === 'undefined' ? {} : window.localStorage);
    var queries = options.collection || [];
    var filters = [];

    const store = _.extend({}, EventEmitter.prototype, {
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
        ajaxType: 'jsonp',
        fetch: function (filter) {
            const ajaxOptions = {
                url: buildUrl(filter),
                type: this.ajaxType
            };

            return store.ajax(ajaxOptions);
        },
        updateQuery: function(index, filter) {
            if ( (!filter && filters[index]) || filter.text ) {
                this.fetch(filter || filters[index]).then(function (data) {
                    queries[index] = data.statuses;
                    store.emitChange();
                }, function(err) {
                    console.error('Error fetching tweets', err); //eslint-disable-line no-console
                });
            } else {
                queries[index] = [];
                store.emitChange();
            }
        },
        getStorage: _.constant(storage),
        updateFilter: function(index, settings) {
            filters[index] = settings;
            this.saveFilters();
        },
        saveFilters: function() {
            storage.setItem('filters', JSON.stringify(filters));
        },
        loadFilters: function() {
            filters = JSON.parse(storage.getItem('filters')) || defaultFilters;
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

    store.loadFilters();
    if (queries.length) store.emitChange();

    const actionMap = {
        update: function(action) {
            if (action.filters) {
                store.updateFilter(action.index, action.filters);
            }
            store.updateQuery(action.index, filters[action.index]);
        }
    };
    const dispToken = disp.register(function (action) {
        actionMap[action.type](action);
    });

    return store;
};

module.exports = Store;