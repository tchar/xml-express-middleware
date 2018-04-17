import Transformer from './transformer';
declare class XmlTransformer implements Transformer {
    private transformOptions;
    private jsonToXmlOptions;
    private _transform(data);
    /**
     * This function accepts a javascript object and transforms it to an XML string.
     * If a property is an array then it assigns a property with a pluralized name of the original
     * property and then assigns singularized names for the respecive array elements.
     * Then the object is transformed using jsontoxml
     * @param {object} data - A javascript object to be transformed
     * @param {function} transformXmlKeys - A function to transform the object's property names
     * @param {string} - The XML equivalent of the passed object
     */
    transform(data: object, jsonToXmlOptions: object): string;
    constructor(transformOptions: {
        noXmlTransform: boolean;
        transformXmlKeys: any;
    });
}
export default XmlTransformer;
