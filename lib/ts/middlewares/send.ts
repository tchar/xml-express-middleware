/**
 * Send module
 * @module lib/send
 * @author Tilemachos Charalampous
 */

'use strict';
import * as Camelize from 'camelize';
import * as Decamelize from 'decamelize';

import ExpressMiddleware from './middleware';
import Transformer from '../transformers/transformer';
import XmlTransformer from '../transformers/xml';
import JsonTransformer from '../transformers/json';

class SendMiddleware implements ExpressMiddleware {

    private options: {
        sendName: string,
        noXmlTransform: boolean,
        transformXmlKeys: any,
        transformJsonKeys: any,
        rootXmlKey: string,
        xmlAcceptHeaders: any,
    }

    private xmlTransformer: Transformer;
    private jsonTransformer: Transformer;

    /**
     * This function parses the options passed to this middleware
     * and returns the parsed object.
     * @param {object} options - The options object 
     * @returns {object} - The parsed options object
     */
    private parseOptions(options: {
        sendName: string,
        noXmlTransform: boolean,
        transformXmlKeys: any,
        transformJsonKeys: any,
        rootXmlKey: string,
        xmlAcceptHeaders: any,
    }): {
            sendName: string,
            noXmlTransform: boolean,
            transformXmlKeys: any,
            transformJsonKeys: any,
            rootXmlKey: string,
            xmlAcceptHeaders: any,
        }{

        if (options != null) {
            if (options.sendName != null && typeof options.sendName !== 'string') {
                throw new Error('Options sendName property should be a string');
            } else if (options.sendName == null) {
                options.sendName = 'send';
            }

            if (options.noXmlTransform != null && typeof options.noXmlTransform !== 'boolean') {
                throw new Error('Options noXmlTransform property should be a boolean');
            } else if (options.noXmlTransform == null) {
                options.noXmlTransform = false;
            }

            if (options.transformXmlKeys === 'camelize') {
                options.transformXmlKeys = Camelize;
            } else if (options.transformXmlKeys === 'decamelize') {
                options.transformXmlKeys = Decamelize;
            } else if (options.transformXmlKeys === 'none') {
                options.transformXmlKeys = (k) => k;
            }
            else if (typeof options.transformXmlKeys === 'string') {
                throw new Error('Options transformXmlKeys string allowed values are camelize, decamelize and none');
            } else if (typeof options.transformXmlKeys === 'function') {
                options.transformXmlKeys = options.transformXmlKeys;
            } else if (options.transformXmlKeys != null) {
                throw new Error('Options transformXmlKeys property should be a string or a function');
            } else {
                options.transformXmlKeys = (k) => k;
            }

            if (options.transformJsonKeys === 'camelize') {
                options.transformJsonKeys = Camelize;
            } else if (options.transformJsonKeys === 'decamelize') {
                options.transformJsonKeys = Decamelize;
            } else if (options.transformJsonKeys === 'none') {
                options.transformJsonKeys = null;
            } else if (typeof options.transformJsonKeys === 'string') {
                throw new Error('Options transformJsonKeys string allowed values are camelize, decamelize and none');
            } else if (typeof options.transformJsonKeys === 'function') {
                options.transformXmlKeys = options.transformJsonKeys;
            } else if (options.transformJsonKeys != null) {
                throw new Error('Options transformJsonKeys property should be a string or a function');
            }

            if (options.rootXmlKey != null && typeof options.rootXmlKey !== 'string') {
                throw new Error('Options rootXmlKey property should be a string');
            } else if (options.rootXmlKey == null) {
                options.rootXmlKey = 'elements';
            }

            if (options.xmlAcceptHeaders != null
                && typeof options.xmlAcceptHeaders !== 'object'
                || (options.xmlAcceptHeaders != null
                    && options.xmlAcceptHeaders.constructor != Array
                    && options.xmlAcceptHeaders.constructor != RegExp)) {
                throw new Error('Options xmlAcceptHeaders property should be an array or a RegExp');
            }
            if (options.xmlAcceptHeaders != null
                && options.xmlAcceptHeaders.constructor == Array
                && options.xmlAcceptHeaders.filter(h => typeof h !== 'string').length !== 0) {
                throw new Error('Options xmlAcceptHeaders accepts only array of strings');
            }

            if (options.xmlAcceptHeaders != null && options.xmlAcceptHeaders.constructor == Array) {
                options.xmlAcceptHeaders = new Set(options.xmlAcceptHeaders);
            }
            else if (options.xmlAcceptHeaders == null) {
                options.xmlAcceptHeaders = new Set(['application/xml', 'text/xml']);
            }
        } else {
            options = {
                sendName: 'send',
                transformXmlKeys: (k) => k,
                noXmlTransform: false,
                transformJsonKeys: null,
                rootXmlKey: 'elements',
                xmlAcceptHeaders: new Set(['application/xml', 'text/xml'])
            };
        }
        return options;
    }

    /**
     * This function gets the Accept header and checks if it
     * agrees with the xmlAcceptHeaders. If xmlAcceptHeaders is a Set
     * then checks if it is in the Set, else if xmlAcceptHeaders is a RegExp
     * it tests it against the RegExp. Returns if an XML response should be sent.
     * @param {string} acceptHeader - The header to check
     * @param {Set<string> or RegExp} xmlAcceptHeaders - A Set of strings or a regexp to check acceptHeader against
     * @returns {boolean} - Returns if with this Accept Header an xml response should be sent
     */
    private checkAcceptHeader(acceptHeader, xmlAcceptHeaders) {
        if (acceptHeader == null) {
            return false;
        }
        if (xmlAcceptHeaders.constructor == Set) {
            return xmlAcceptHeaders.has(acceptHeader);
        } else {
            return xmlAcceptHeaders.test(acceptHeader);
        }
    }

    /**
     * This function returns an express middleware function with res, req, next 
     * signature that assigns to res[sendName], (default res.send) a function that 
     * checks the headers of the request and based on xmlAcceptHeaders
     * (default application/xml, text/xml) returns a response in json,
     * xml, or text.
     * @returns {function} - an express middleware function
     */
    public middleware(): any {
        
        let _this = this;

        return function (req: any, res: any, next: any): void {

            try {
                let trueSend = res.send;
                let send = function (data) {
                    if (typeof data === 'object') {
                        if (_this.checkAcceptHeader(req.headers['accept'], _this.options.xmlAcceptHeaders)) {
                            let resOptionsclear = { xmlHeader: true, escape: false };
                            if (req.headers['user-agent'] != null) {
                                resOptionsclear.escape = true;
                            }

                            if (data != null && data.constructor == Array && _this.options.noXmlTransform) {
                                let tempData = data;
                                data = {};
                                data[_this.options.rootXmlKey] = tempData;
                            }

                            res.set('Content-Type', 'application/xml; charset=utf-8');
                            trueSend.apply(res, [_this.xmlTransformer.transform(data, resOptionsclear)]);
                        } else {
                            res.json(_this.jsonTransformer.transform(data, null));
                        }
                    } else {
                        trueSend.apply(res, [data]);
                    }
                };
                res[_this.options.sendName] = send;
                next();
            } catch (err) {
                next(err);
            }
        };
    }

    /**
     * Constructor
     * @param options - the middleware options
     */
    constructor(options: {
        sendName: string,
        noXmlTransform: boolean,
        transformXmlKeys: any,
        transformJsonKeys: any,
        rootXmlKey: string,
        xmlAcceptHeaders: any,
    }){
        this.options = this.parseOptions(options);
        this.xmlTransformer = new XmlTransformer({
            noXmlTransform: this.options.noXmlTransform,
            transformXmlKeys: this.options.transformXmlKeys
        });
        this.jsonTransformer = new JsonTransformer({
            transformJsonKeys: this.options.transformJsonKeys
        })
    }
}

export default SendMiddleware;