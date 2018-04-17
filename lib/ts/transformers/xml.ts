/**
 * XML transform module
 * @module lib/transformers/xml
 * @author Tilemachos Charalampous
 */


'use strict';
import * as Pluralize from 'pluralize';
import * as Jsontoxml from 'jsontoxml';
import Transformer from './transformer';

class XmlTransformer implements Transformer {

    private transformOptions: {noXmlTransform: boolean, transformXmlKeys: any};
    private jsonToXmlOptions: object;

    private _transform(data: any): any {
        if (this.transformOptions.noXmlTransform) {
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
            let singKey = this.transformOptions.transformXmlKeys(Pluralize.singular(key));
            let newKey = this.transformOptions.transformXmlKeys(key);
            if (data[key] != null && data[key].constructor == Array) {
                newKey = Pluralize(newKey);
                resData[newKey] = [];
                data[key].forEach(d => {
                    let newData = {};
                    newData[singKey] = this._transform(d);
                    resData[newKey].push(newData);
                });
            } else {
                resData[newKey] = this._transform(data[key]);
            }
        });
        return resData;
    }


    /**
     * This function accepts a javascript object and transforms it to an XML string.
     * If a property is an array then it assigns a property with a pluralized name of the original
     * property and then assigns singularized names for the respecive array elements.
     * Then the object is transformed using jsontoxml
     * @param {object} data - A javascript object to be transformed
     * @param {function} transformXmlKeys - A function to transform the object's property names 
     * @param {string} - The XML equivalent of the passed object
     */
    public transform(data: object, jsonToXmlOptions: object): string {
        return Jsontoxml(this._transform(data), jsonToXmlOptions);
    }

    /**
     * Constructor
     * @param {object} transformOptions - the default transformer options
     */
    constructor(transformOptions: { noXmlTransform: boolean, transformXmlKeys: any }){
        this.transformOptions = transformOptions;
    }
}

export default XmlTransformer;