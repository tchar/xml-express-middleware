const pluralize = require('pluralize');
const xml = require('jsontoxml');
const camelize = require('camelize');
const decamelize = require('decamelize');
let trueSend;

function getTrueSend(res){
    if (trueSend == null){
        trueSend = res.send;
    }
    return trueSend;
}

function transformXml(data, transformXmlKey) {

    function transform(data){
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
                resData[newKey] = [];
                data[key].forEach(d => {
                    let newData = {};
                    newData[singKey] = transform(d);
                    resData[newKey].push(newData);
                });
            } else if (typeof data[key] === 'object') {
                resData[newKey] = transform(data[key]);
            } else {
                resData[newKey] = transform(data[key]);
            }
        });
        return resData;
    }
    return transform(data);
}

function transformJson(data, transformJsonKey) {
    
    function transform(data){
        if (data == null) {
            return data;
        }
        if (typeof data !== 'object'){
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
            } else if (typeof data[key] === 'object') {
                resData[newKey] = transform(data[key]);
            } else {
                resData[newKey] = data[key];
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


exports.xml = function(options){
    let rootXmlArrayKey;
    let transformXmlKey = (k) => k;

    if (options != null) {
        if (options.transformXmlKeys != null && typeof options.transformXmlKeys !== 'string') {
            throw new Error('Options transformXmlKeys property should be a string');
        }
        if (options.transformXmlKeys === 'camelize') {
            transformXmlKey = camelize;
        } else if (options.transformXmlKeys === 'decamelize') {
            transformXmlKey = decamelize;
        } else if (options.transformXmlKeys === 'none') {
            transformXmlKey = (k) => k;
        }

        if (options.rootXmlArrayKey != null && typeof options.rootXmlArrayKey !== 'string') {
            throw new Error('Options rootXmlArrayKey property should be a string');
        }
        rootXmlArrayKey = options.rootXmlArrayKey;
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
                    if (rootXmlArrayKey != null && data != null && data.constructor == Array) {
                        let tempData = data;
                        data = {};
                        data[rootXmlArrayKey] = tempData;
                    }
                    res.set('Content-Type', 'application/xml; charset=utf-8');
                    getTrueSend(res).apply(res, [xml.apply(null, [transformXml(data, transformXmlKey), resOptionsclear])]);
                }
            };
            getTrueSend(res);
            res.xml = func;
            next();
        } catch (err) {
            next(err);
        }
    };
};


exports.send = function (options) {
    let sendName = 'send';
    let rootXmlArrayKey;
    let transformXmlKey = (k) => k;
    let transformJsonKey;

    if (options != null) {
        if (options.sendName != null && typeof options.sendName !== 'string') {
            throw new Error('Options sendName property should be a string');
        }
        sendName = options.sendName || sendName;
        if (options.transformXmlKeys != null && typeof options.transformXmlKeys !== 'string') {
            throw new Error('Options transformXmlKeys property should be a string');
        }
        if (options.transformXmlKeys === 'camelize') {
            transformXmlKey = camelize;
        } else if (options.transformXmlKeys === 'decamelize') {
            transformXmlKey = decamelize;
        } else if (options.transformXmlKeys === 'none') {
            transformXmlKey = (k) => k;
        }

        if (options.transformJsonKeys != null && typeof options.transformJsonKeys !== 'string') {
            throw new Error('Options transformJsonKeys property should be a string');
        }
        if (options.transformJsonKeys === 'camelize') {
            transformJsonKey = camelize;
        } else if (options.transformJsonKeys === 'decamelize') {
            transformJsonKey = decamelize;
        } else if (options.transformJsonKeys === 'none') {
            transformJsonKey = null;
        }

        if (options.rootXmlArrayKey != null && typeof options.rootXmlArrayKey !== 'string') {
            throw new Error('Options rootXmlArrayKey property should be a string');
        }
        rootXmlArrayKey = options.rootXmlArrayKey;
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

                        if (rootXmlArrayKey != null && data != null && data.constructor == Array) {
                            let tempData = data;
                            data = {};
                            data[rootXmlArrayKey] = tempData;
                        }

                        res.set('Content-Type', 'application/xml; charset=utf-8');
                        getTrueSend(res).apply(res, [xml.apply(null, [transformXml(data, transformXmlKey), resOptionsclear])]);
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
};