import ExpressMiddleware from './middleware';
declare class XmlMiddleware implements ExpressMiddleware {
    private options;
    private xmlTransformer;
    /**
     * This function parses the options passed to this middleware
     * and returns the parsed object.
     * @param {object} options - The options object
     * @returns {object} - The parsed options object
     */
    private parseOptions(options);
    /**
     * This function accepts an options object and returns
     * an express middleware function with res, req, next signature
     * that assigns to res.xml a function that transforms a javascript
     * object to xml.
     * @param {object} options
     * @returns {function} an express middleware function
     */
    middleware(): any;
    constructor(options: {
        noXmlTransform: boolean;
        rootXmlKey: string;
        transformXmlKeys: any;
        xmlName: string;
    });
}
export default XmlMiddleware;
