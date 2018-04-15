/**
 * XML transform module
 * @module lib/transformers/xml
 */


'use strict';
const pluralize = require('pluralize');
const jsontoxml = require('jsontoxml');

/**
 * This function accepts a javascript object and transforms it to an XML string.
 * If a property is an array then it assigns a property with a pluralized name of the original
 * property and then assigns singularized names for the respecive array elements.
 * Then the object is transformed using jsontoxml
 * @param {object} data - A javascript object to be transformed
 * @param {function} transformXmlKey - A function to transform the object's property names 
 * @param {string} - The XML equivalent of the passed object
 */
function transform(data, options) {

    function _transform(data) {
        if (options.transform.noTransform){
            return data;
        }
        if (data == null) {
            return '';
        }
        if (typeof data !== 'object') {
            return data;
        }
        let resData = {};
        Object.keys(data).forEach(key => {
            let singKey = options.transform.key(pluralize.singular(key));
            let newKey = options.transform.key(key);
            if (data[key] != null && data[key].constructor == Array) {
                newKey = pluralize(newKey);
                resData[newKey] = [];
                data[key].forEach(d => {
                    let newData = {};
                    newData[singKey] = _transform(d);
                    resData[newKey].push(newData);
                });
            } else {
                resData[newKey] = _transform(data[key]);
            }
        });
        return resData;
    }
    return jsontoxml(_transform(data), options.jsontoxml);
}

module.exports = transform;