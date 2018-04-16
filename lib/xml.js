/**
 * Xml module
 * @module lib/xml
 */

'use strict';
// const trueSend = require('./true_send');
const camelize = require('camelize');
const decamelize = require('decamelize');
const transformXml = require('./transformers/xml');

/**
 * This function parses the options passed to this middleware
 * and returns the parsed object.
 * @param {object} options - The options object 
 * @returns {object} - The parsed options object
 */
function parseOptions(options){
    if (options != null) {
        if (options.xmlName != null && typeof options.xmlName !== 'string') {
            throw new Error('Options xmlName property should be a string');
        } else if (options.xmlName == null) {
            options.xmlName = 'xml';
        }
        
        if (options.noXmlTransform != null && typeof options.noXmlTransform !== 'boolean') {
            throw new Error('Options noXmlTransform property should be a boolean');
        } else if (options.noXmlTransform == null) {
            options.noXmlTransform = false;
        }

        if (options.transformXmlKeys === 'camelize') {
            options.transformXmlKey = camelize;
        } else if (options.transformXmlKeys === 'decamelize') {
            options.transformXmlKey = decamelize;
        } else if (options.transformXmlKeys === 'none') {
            options.transformXmlKey = (k) => k;
        }
        else if (typeof options.transformXmlKeys === 'string') {
            throw new Error('Options transformXmlKeys string allowed values are camelize, decamelize and none');
        } else if (typeof options.transformXmlKeys === 'function') {
            options.transformXmlKey = options.transformXmlKeys;
        } else if (options.transformXmlKeys != null) {
            throw new Error('Options transformXmlKeys property should be a string or a function');
        } else {
            options.transformXmlKey = (k) => k;
        }

        if (options.rootXmlKey != null && typeof options.rootXmlKey !== 'string') {
            throw new Error('Options rootXmlKey property should be a string');
        } else if (options.rootXmlKey == null){
            options.rootXmlKey = 'elements';
        }
    } else {
        options = {
            xmlName: 'xml',
            rootXmlKey: 'elements',
            transformXmlKey: (k) => k
        };
    }
    return options;
}

/**
 * This function accepts an options object and returns
 * an express middleware function with res, req, next signature
 * that assigns to res.xml a function that transforms a javascript
 * object to xml.
 * @param {object} options 
 * @returns {function} an express middleware function
 */
function xml(options) {
    options = parseOptions(options);    

    return function (req, res, next) {
        try {
            let trueSend = res.send;
            let func = function (data) {
                if (typeof data !== 'object' && data != null) {
                    throw new Error('Data is not of type object');
                } else {
                    let resOptionsclear = { xmlHeader: true };
                    if (req.headers['user-agent'] != null) {
                        resOptionsclear.escape = true;
                    }
                    if (data != null && data.constructor == Array && options.noXmlTransform) {
                        let tempData = data;
                        data = {};
                        data[options.rootXmlKey] = tempData;
                    }
                    res.set('Content-Type', 'application/xml; charset=utf-8');
                    trueSend.apply(res, [transformXml(data, {
                        transform: {
                            key: options.transformXmlKey,
                            noTransform: options.noXmlTransform
                        },
                        jsontoxml: resOptionsclear
                    })]);
                }
            };
            res[options.xmlName] = func;
            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Export the xml function
 */
module.exports = xml;