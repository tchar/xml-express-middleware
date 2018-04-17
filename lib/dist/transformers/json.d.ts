import Transformer from './transformer';
declare class JsonTransformer implements Transformer {
    private options;
    private _transform(data);
    /**
     * Transfroms a javascript object's property names based on a function passed.
     * If the function is null it does nothing and returns the object intact
     * @param {object} data - The object to transform
     * @param {object} options - options to transformer
     * @returns {object} - The transformed object
     */
    transform(data: object): object;
    constructor(options: {
        transformJsonKeys: any;
    });
}
export default JsonTransformer;
