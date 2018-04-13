const pluralize = require('pluralize');
const jsontoxml = require('jsontoxml');
const camelize = require('camelize');
const decamelize = require('decamelize');
let trueSend;

function getTrueSend(res) {
    if (trueSend == null) {
        trueSend = res.send;
    }
    return trueSend;
}

function transformXml(data, transformXmlKey) {

    function transform(data) {
        if (data == null) {
            return '';
        }
        if (typeof data !== 'object') {
            return data;
        }
        let resData = {};
        Object.keys(data).forEach(key => {
            let singKey = transformXmlKey(pluralize.singular(key));
            let newKey = transformXmlKey(key);
            if (data[key] != null && data[key].constructor == Array) {
                newKey = pluralize(newKey);
                resData[newKey] = [];
                data[key].forEach(d => {
                    let newData = {};
                    newData[singKey] = transform(d);
                    resData[newKey].push(newData);
                });
            } else {
                resData[newKey] = transform(data[key]);
            }
        });
        return resData;
    }
    return transform(data);
}

function transformJson(data, transformJsonKey) {

    function transform(data) {
        if (data == null) {
            return data;
        }
        if (typeof data !== 'object') {
            return data;
        }
        let resData = {};
        Object.keys(data).forEach(key => {
            let newKey = transformJsonKey(key);
            if (typeof data[key] === 'object' && data[key].constructor == Array) {
                resData[newKey] = [];
                data[key].forEach(d => {
                    resData[newKey].push(transform(d));
                });
            } else {
                resData[newKey] = transform(data[key]);
            }
        });
        return resData;
    }

    if (transformJsonKey == null) {
        return data;
    } else {
        return transform(data);
    }
}


function xml(options) {
    let rootXmlKey;
    let transformXmlKey = (k) => k;

    if (options != null) {

        if (options.transformXmlKeys === 'camelize') {
            transformXmlKey = camelize;
        } else if (options.transformXmlKeys === 'decamelize') {
            transformXmlKey = decamelize;
        } else if (options.transformXmlKeys === 'none') {
            transformXmlKey = (k) => k;
        }
        else if (typeof options.transformXmlKeys === 'string') {
            throw new Error('Options transformXmlKeys string allowed values are camelize, decamelize and none');
        } else if (typeof options.transformXmlKeys === 'function') {
            transformXmlKey = options.transformXmlKeys;
        } else if (options.transformXmlKeys != null) {
            throw new Error('Options transformXmlKeys property should be a string or a function');
        }

        if (options.rootXmlKey != null && typeof options.rootXmlKey !== 'string') {
            throw new Error('Options rootXmlKey property should be a string');
        }
        rootXmlKey = options.rootXmlKey;
    }

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
                        data[rootXmlKey || 'elements'] = tempData;
                    }
                    res.set('Content-Type', 'application/xml; charset=utf-8');
                    getTrueSend(res).apply(res, [jsontoxml.apply(null, [transformXml(data, transformXmlKey), resOptionsclear])]);
                }
            };
            getTrueSend(res);
            res.xml = func;
            next();
        } catch (err) {
            next(err);
        }
    };
}


function send(options) {
    let sendName = 'send';
    let rootXmlKey;
    let transformXmlKey = (k) => k;
    let transformJsonKey;

    if (options != null) {
        if (options.sendName != null && typeof options.sendName !== 'string') {
            throw new Error('Options sendName property should be a string');
        }
        sendName = options.sendName || sendName;

        if (options.transformXmlKeys === 'camelize') {
            transformXmlKey = camelize;
        } else if (options.transformXmlKeys === 'decamelize') {
            transformXmlKey = decamelize;
        } else if (options.transformXmlKeys === 'none') {
            transformXmlKey = (k) => k;
        }
        else if (typeof options.transformXmlKeys === 'string') {
            throw new Error('Options transformXmlKeys string allowed values are camelize, decamelize and none');
        } else if (typeof options.transformXmlKeys === 'function') {
            transformXmlKey = options.transformXmlKeys;
        } else if (options.transformXmlKeys != null) {
            throw new Error('Options transformXmlKeys property should be a string or a function');
        }

        if (options.transformJsonKeys === 'camelize') {
            transformJsonKey = camelize;
        } else if (options.transformJsonKeys === 'decamelize') {
            transformJsonKey = decamelize;
        } else if (options.transformJsonKeys === 'none') {
            transformJsonKey = null;
        } else if (typeof options.transformJsonKeys === 'string') {
            throw new Error('Options transformJsonKeys string allowed values are camelize, decamelize and none');
        } else if (typeof options.transformJsonKeys === 'function') {
            transformXmlKey = options.transformJsonKeys;
        } else if (options.transformJsonKeys != null) {
            throw new Error('Options transformJsonKeys property should be a string or a function');
        }

        if (options.rootXmlKey != null && typeof options.rootXmlKey !== 'string') {
            throw new Error('Options rootXmlKey property should be a string');
        }
        rootXmlKey = options.rootXmlKey;
    }

    return function (req, res, next) {
        try {
            let send = function (data) {
                if (typeof data === 'object') {
                    let type = req.headers['accept'];
                    if (type === 'application/xml') {
                        let resOptionsclear = { xmlHeader: true };
                        if (req.headers['user-agent']) {
                            resOptionsclear.escape = true;
                        }

                        if (data != null && data.constructor == Array) {
                            let tempData = data;
                            data = {};
                            data[rootXmlKey || 'elements'] = tempData;
                        }

                        res.set('Content-Type', 'application/xml; charset=utf-8');
                        getTrueSend(res).apply(res, [jsontoxml.apply(null, [transformXml(data, transformXmlKey), resOptionsclear])]);
                    } else {
                        res.json(transformJson(data, transformJsonKey));
                    }
                } else {
                    getTrueSend(res).apply(res, [data]);
                }
            };
            getTrueSend(res);
            res[sendName] = send;
            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = send;
module.exports.send = send;
module.exports.xml = xml;