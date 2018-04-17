/**
 * Index module
 * @module index
 * @author Tilemachos Charalampous
 */

'use strict';
import SendMiddleware from './middlewares/send';
import XmlMiddleware from './middlewares/xml';
import ExpressMiddleware from './middlewares/middleware';

/**
 * This function wraps the SendMiddleware.middleware method
 * @param {object} options - the options for send middleware
 * @return {function} - the middleware function 
 */
function send(options: {
        sendName: string,
        noXmlTransform: boolean,
        transformXmlKeys: any,
        transformJsonKeys: any,
        rootXmlKey: string,
        xmlAcceptHeaders: any,
    }): any {
    let sendMiddleware: ExpressMiddleware = new SendMiddleware(options);
    return sendMiddleware.middleware();
}

/**
 * This function wraps the XmlMiddleware.middleware method
 * @param {object} options - the options for xml middleware
 * @return {function} - the middleware function 
 */
function xml(options: {
        noXmlTransform: boolean,
        rootXmlKey: string,
        transformXmlKeys: any,
        xmlName: string
    }): any{
    let xmlMiddleware: ExpressMiddleware = new XmlMiddleware(options);
    return xmlMiddleware.middleware();
}

/**
 * Export send as default
 * Export send as send
 * Export xml as xml
 */
module.exports = send;
module.exports.send = send;
module.exports.xml = xml;