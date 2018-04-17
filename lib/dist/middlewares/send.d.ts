import ExpressMiddleware from './middleware';
declare class SendMiddleware implements ExpressMiddleware {
    private options;
    private xmlTransformer;
    private jsonTransformer;
    /**
     * This function parses the options passed to this middleware
     * and returns the parsed object.
     * @param {object} options - The options object
     * @returns {object} - The parsed options object
     */
    private parseOptions(options);
    /**
     * This function gets the Accept header and checks if it
     * agrees with the xmlAcceptHeaders. If xmlAcceptHeaders is a Set
     * then checks if it is in the Set, else if xmlAcceptHeaders is a RegExp
     * it tests it against the RegExp. Returns if an XML response should be sent.
     * @param {string} acceptHeader - The header to check
     * @param {Set<string> or RegExp} xmlAcceptHeaders - A Set of strings or a regexp to check acceptHeader against
     * @returns {boolean} - Returns if with this Accept Header an xml response should be sent
     */
    private checkAcceptHeader(acceptHeader, xmlAcceptHeaders);
    /**
     * This function accepts an options object and returns
     * an express middleware function with res, req, next signature
     * that assigns to res[sendName], (default res.send) a function that
     * checks the headers of the request and based on xmlAcceptHeaders
     * (default application/xml, text/xml) returns a response in json,
     * xml, or text.
     * @param {object} options
     * @returns {function} an express middleware function
     */
    middleware(): any;
    constructor(options: {
        sendName: string;
        noXmlTransform: boolean;
        transformXmlKeys: any;
        transformJsonKeys: any;
        rootXmlKey: string;
        xmlAcceptHeaders: any;
    });
}
export default SendMiddleware;
