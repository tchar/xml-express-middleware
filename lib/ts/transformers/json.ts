/**
 * Json transform module
 * @module lib/transformers/json
 * @author Tilemachos Charalampous
 */

'use strict';
import Transformer from './transformer';

class JsonTransformer implements Transformer {

    private transformOptions: {transformJsonKeys: any};

    private _transform(data: any): any{
        if (data == null) {
            return data;
        }
        if (typeof data !== 'object') {
            return data;
        }
        let resData = {};
        Object.keys(data).forEach(key => {
            let newKey = this.transformOptions.transformJsonKeys(key);
            if (typeof data[key] === 'object' && data[key].constructor == Array) {
                resData[newKey] = [];
                data[key].forEach(d => {
                    resData[newKey].push(this._transform(d));
                });
            } else {
                resData[newKey] = this._transform(data[key]);
            }
        });
        return resData;
    }

    /**
     * Transfroms a javascript object's property names based on a function passed.
     * If the function is null it does nothing and returns the object intact
     * @param {object} data - The object to transform
     * @param {object} options - options to transformer
     * @returns {object} - The transformed object
     */
    public transform(data: object, options: object = null): object {

        if (this.transformOptions.transformJsonKeys == null) {
            return data;
        } else {
            return this._transform(data);
        }
    }

    /**
     * The constructor
     * @param {object} options - The default transformer options
     */
    constructor(transformOptions: {transformJsonKeys: any}){
        this.transformOptions = transformOptions;
    }
}

export default JsonTransformer;