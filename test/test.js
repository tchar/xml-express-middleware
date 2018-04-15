'use strict';
const app = require('express')();
const xmlMiddleware = require('../index').xml;
const sendMiddleware = require('../index');
const assert = require('assert');
const requestProm = require('request-promise');

const aResponse = {
    someProperty: 'someValue1',
    someProperties: [{
        someNestedProperty: 'someValue3'
    }, {
        someNestedProperty: 'someValue5'
    }]
};

const bResponse = {
    someOtherProperty: 'someOtherValue1',
    someOtherProperties: ['someOtherValue3', 'someOtherValue5']
};

const cResponse = {
    some_other_property: 'someOtherValue1',
    some_other_properties: ['someOtherValue3', 'someOtherValue5']
};

app.use(xmlMiddleware());
app.get('/a', function(req, res){
    res.xml(aResponse);
});

app.get('/b', sendMiddleware({ transformXmlKeys: 'decamelize', xmlAcceptHeaders: new RegExp(/\/xml/) }), function(req, res){
    res.send(bResponse);
});

app.get('/c', sendMiddleware({ transformXmlKeys: 'camelize', transformJsonKeys: 'camelize'}), function (req, res) {
    res.send(cResponse);
});

app.get('/d', sendMiddleware({ sendName: 'send2', transformXmlKeys: 'camelize', transformJsonKeys: 'camelize' }), function (req, res) {
    res.send2(cResponse);
});


const server = app.listen(8095);

describe('xml-express-middleware', function(){
    it('should work for path /a and simple xml translation', function(done){
        requestProm({
            uri: 'http://localhost:8095/a',
            method: 'get'
        }).then(data => {
            const compareData = '<?xml version="1.0" encoding="utf-8"?><someProperty>someValue1</someProperty><someProperties><someProperty><someNestedProperty>someValue3</someNestedProperty></someProperty><someProperty><someNestedProperty>someValue5</someNestedProperty></someProperty></someProperties>';
            assert(data === compareData, 'Data should be the xml version of aResponse');
            done();
        });
    });

    it ('should work for path /b with no headers and return json', function(done){
        requestProm({
            uri: 'http://localhost:8095/b',
            method: 'get',
            json: true
        }).then(data => {
            assert(JSON.stringify(bResponse) === JSON.stringify(data), 'Data should be json');
            done();
        });
    });

    it('should work for path /b with Accept: application/xml headers and decamelized xml keys', function(done){
        requestProm({
            uri: 'http://localhost:8095/b',
            method: 'get',
            headers: {
                'Accept': 'asdasd/xml'
            }
        }).then(data => {
            const compareData = '<?xml version="1.0" encoding="utf-8"?><some_other_property>someOtherValue1</some_other_property><some_other_properties><some_other_property>someOtherValue3</some_other_property><some_other_property>someOtherValue5</some_other_property></some_other_properties>';
            assert(data === compareData, 'data should be the bResponse xml version with decamelized keys');
            done();
        });
    });

    it('should work for path /c with Accept: application/xml headers and camelized keys', function (done) {
        requestProm({
            uri: 'http://localhost:8095/c',
            method: 'get',
            headers: {
                'Accept': 'application/xml'
            }
        }).then(data => {
            const compareData = '<?xml version="1.0" encoding="utf-8"?><someOtherProperty>someOtherValue1</someOtherProperty><someOtherProperties><someOtherProperty>someOtherValue3</someOtherProperty><someOtherProperty>someOtherValue5</someOtherProperty></someOtherProperties>';
            assert(data === compareData, 'data should be the cResponse xml version with camelized keys');
            done();
        });
    });

    it('should work for path /c with no headers and camelized keys', function (done) {
        requestProm({
            uri: 'http://localhost:8095/c',
            method: 'get',
            json: true
        }).then(data => {
            assert(JSON.stringify(data) === JSON.stringify(bResponse), 'data should be the cResponse with camelized keys (bResponse)');
            done();
        });
    });

    it('should work for path /d with Accept: application/xml headers and camelized keys and sendName set', function (done) {
        requestProm({
            uri: 'http://localhost:8095/d',
            method: 'get',
            headers: {
                'Accept': 'application/xml'
            }
        }).then(data => {
            const compareData = '<?xml version="1.0" encoding="utf-8"?><someOtherProperty>someOtherValue1</someOtherProperty><someOtherProperties><someOtherProperty>someOtherValue3</someOtherProperty><someOtherProperty>someOtherValue5</someOtherProperty></someOtherProperties>';
            assert(data === compareData, 'data should be the cResponse xml version with camelized keys');
            done();
        });
    });

    it('should work for path /d with no headers and camelized keys and sendName', function (done) {
        requestProm({
            uri: 'http://localhost:8095/d',
            method: 'get',
            json: true
        }).then(data => {
            assert(JSON.stringify(data) === JSON.stringify(bResponse), 'data should be the cResponse with camelized keys (bResponse)');
            done();
        }).finally(() => server.close());
    });
});
