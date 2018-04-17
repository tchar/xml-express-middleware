/**
 * Json transform module
 * @module lib/transformers/json
 * @author Tilemachos Charalampous
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class JsonTransformer {
    _transform(data) {
        if (data == null) {
            return data;
        }
        if (typeof data !== 'object') {
            return data;
        }
        let resData = {};
        Object.keys(data).forEach(key => {
            let newKey = this.options.transformJsonKeys(key);
            if (typeof data[key] === 'object' && data[key].constructor == Array) {
                resData[newKey] = [];
                data[key].forEach(d => {
                    resData[newKey].push(this._transform(d));
                });
            }
            else {
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
    transform(data) {
        if (this.options.transformJsonKeys == null) {
            return data;
        }
        else {
            return this._transform(data);
        }
    }
    constructor(options) {
        this.options = options;
    }
}
exports.default = JsonTransformer;
//# sourceMappingURL=json.js.map