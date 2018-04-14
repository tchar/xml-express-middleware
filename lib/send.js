const trueSend = require('./true_send');
const transformXml = require('./transformers/xml');
const transformJson = require('./transformers/json');
const camelize = require('camelize');
const decamelize = require('decamelize');
const jsontoxml = require('jsontoxml');

function parseOptions(options) {
    const rOpts = {
        sendName: 'send',
        transformXmlKey: (k) => k,
        transformJsonKey: null,
        rootXmlKey: null,
        xmlAcceptHeaders: new Set(['application/xml', 'text/xml'])
    };

    if (options != null) {
        if (options.sendName != null && typeof options.sendName !== 'string') {
            throw new Error('Options sendName property should be a string');
        }
        rOpts.sendName = options.sendName || rOpts.sendName;

        if (options.transformXmlKeys === 'camelize') {
            rOpts.transformXmlKey = camelize;
        } else if (options.transformXmlKeys === 'decamelize') {
            rOpts.transformXmlKey = decamelize;
        } else if (options.transformXmlKeys === 'none') {
            rOpts.transformXmlKey = (k) => k;
        }
        else if (typeof options.transformXmlKeys === 'string') {
            throw new Error('Options transformXmlKeys string allowed values are camelize, decamelize and none');
        } else if (typeof options.transformXmlKeys === 'function') {
            rOpts.transformXmlKey = options.transformXmlKeys;
        } else if (options.transformXmlKeys != null) {
            throw new Error('Options transformXmlKeys property should be a string or a function');
        }

        if (options.transformJsonKeys === 'camelize') {
            rOpts.transformJsonKey = camelize;
        } else if (options.transformJsonKeys === 'decamelize') {
            rOpts.transformJsonKey = decamelize;
        } else if (options.transformJsonKeys === 'none') {
            rOpts.transformJsonKey = null;
        } else if (typeof options.transformJsonKeys === 'string') {
            throw new Error('Options transformJsonKeys string allowed values are camelize, decamelize and none');
        } else if (typeof options.transformJsonKeys === 'function') {
            rOpts.transformXmlKey = options.transformJsonKeys;
        } else if (options.transformJsonKeys != null) {
            throw new Error('Options transformJsonKeys property should be a string or a function');
        }

        if (options.rootXmlKey != null && typeof options.rootXmlKey !== 'string') {
            throw new Error('Options rootXmlKey property should be a string');
        }
        rOpts.rootXmlKey = options.rootXmlKey;

        if (options.xmlAcceptHeaders != null
            && typeof options.xmlAcceptHeaders !== 'object'
            || (options.xmlAcceptHeaders != null
                && options.xmlAcceptHeaders.constructor != Array
                && options.xmlAcceptHeaders.constructor != RegExp)) {
            throw new Error('Options xmlAcceptHeaders property should be an array or a RegExp');
        }
        if (options.xmlAcceptHeaders != null
            && options.xmlAcceptHeaders.constructor == Array
            && options.xmlAcceptHeaders.filter(h => typeof h !== 'string').length !== 0) {
            throw new Error('Options xmlAcceptHeaders accepts only array of strings');
        }

        if (options.xmlAcceptHeaders != null && options.xmlAcceptHeaders.constructor == Array) {
            rOpts.xmlAcceptHeaders = new Set(options.xmlAcceptHeaders);
        } else if (options.xmlAcceptHeaders != null) {
            rOpts.xmlAcceptHeaders = options.xmlAcceptHeaders;
        }
    }
    return rOpts;
}

function checkAcceptHeader(acceptHeader, xmlAcceptHeaders) {
    if (acceptHeader == null) {
        return false;
    }
    if (xmlAcceptHeaders.constructor == Set) {
        return xmlAcceptHeaders.has(acceptHeader);
    } else {
        return xmlAcceptHeaders.test(acceptHeader);
    }
}

function send(options) {

    options = parseOptions(options);    

    return function (req, res, next) {
        try {
            let send = function (data) {
                if (typeof data === 'object') {
                    if (checkAcceptHeader(req.headers['accept'], options.xmlAcceptHeaders)) {
                        let resOptionsclear = { xmlHeader: true };
                        if (req.headers['user-agent']) {
                            resOptionsclear.escape = true;
                        }

                        if (data != null && data.constructor == Array) {
                            let tempData = data;
                            data = {};
                            data[options.rootXmlKey || 'elements'] = tempData;
                        }

                        res.set('Content-Type', 'application/xml; charset=utf-8');
                        trueSend(res.send).apply(res, 
                            [jsontoxml.apply(null, [transformXml(data, options.transformXmlKey), resOptionsclear])]);
                    } else {
                        res.json(transformJson(data, options.transformJsonKey));
                    }
                } else {
                    trueSend(res.send).apply(res, [data]);
                }
            };
            trueSend(res.send);
            res[options.sendName] = send;
            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = send;