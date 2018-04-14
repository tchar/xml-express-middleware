const trueSend = require('./true_send');
const camelize = require('camelize');
const decamelize = require('decamelize');
const jsontoxml = require('jsontoxml');
const transformXml = require('./transformers/xml');

function parseOptions(options){
    const rOpts = {
        rootXmlKey: null,
        transformXmlKey: (k) => k
    };
    if (options != null) {

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

        if (options.rootXmlKey != null && typeof options.rootXmlKey !== 'string') {
            throw new Error('Options rootXmlKey property should be a string');
        }
        rOpts.rootXmlKey = options.rootXmlKey;
    }
    return rOpts;
}

function xml(options) {
    options = parseOptions(options);    

    return function (req, res, next) {
        try {
            let func = function (data) {
                if (typeof data !== 'object' && data != null) {
                    throw new Error('Data is not of type object');
                } else {
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
                }
            };
            trueSend(res.send);
            res.xml = func;
            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = xml;