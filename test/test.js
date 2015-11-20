const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const _ = require('lodash');

const Store = require('../src/Store');
const disp = require('../src/dispatcher');

const fakeSearchResults = {
    suitepad: require('./search-suitepad'),
    berlin: require('./search-berlin'),
    js: require('./search-javascript'),
    iosSydney: require('./search-ios-sydney')
};

describe('App', function() {
    describe('on start', function() {
        it('should show Twit Timeline from different Queries', function() {
            const store = Store(_.values(fakeSearchResults));

            _.each(_.values(fakeSearchResults), function(result) {
                expect(store.getTimeline()).to.contain(result);
            });
        });

        it('should show Queries settings with Text Search input', function() {});
        it('should show Queries settings with Geocode Search input');
        it('should show Queries settings with Language selector');
        it('should load Queries settings from Local storage')
    });
    describe('on Filter change', function() {
        const textFilter = 'iOS';
        const langFilter = 'en';
        const geocodeFilterSydney = [-33.86, 151.211, '1000km'];
        const queryIndex = 2;

        const isSubStr = function(str, substr) {
            return str.toLowerCase().indexOf(substr.toLowerCase()) !== -1;
        };

        var store;

        beforeEach(function() {
            store = Store();
            sinon.stub(store, 'ajax').returns(Promise.resolve(fakeSearchResults['iosSydney']));
        });

        it('should send proper Request for new tweets', function() {
            disp.dispatch({
                type: 'filterChanged',
                text: textFilter,
                geocode: geocodeFilterSydney,
                index: 0
            });

            const expectedUrl = 'url?q='+textFilter+'&geocode='+geocodeFilterSydney;

            expect(store.ajax).to.be.calledWith(expectedUrl);
        });

        it('should get Twits with Searched Text', function(done) {
            expect(store.getTimeline().length).to.equal(0);

            store.addChangeListener(function() {
                expect(store.getTimeline().length).not.to.equal(0);

                _.each(store.getTimeline(), function(tweet) {
                    expect(isSubStr(tweet.text, textFilter)).to.be.true;
                });
                done();
            });

            store.fetch(queryIndex, {});
        });

        it('should show Twits in Selected Language', function() {
            expect(store.getTimeline().length).to.equal(0);

            store.addChangeListener(function() {
                expect(store.getTimeline().length).not.to.equal(0);

                _.each(store.getTimeline(), function(tweet) {
                    expect(tweet.lang).to.equal(langFilter);
                });
                done();
            });

            store.fetch(queryIndex, {});
        });
    });
});