/**
 * Index module
 * @module index
 * @author Tilemachos Charalampous
 */

'use strict';
import SendMiddleware from './middlewares/send';
import XmlMiddleware from './middlewares/xml';


function send(options: {
        sendName: string,
        noXmlTransform: boolean,
        transformXmlKeys: any,
        transformJsonKeys: any,
        rootXmlKey: string,
        xmlAcceptHeaders: any,
    }): any {
    let sendMiddleware = new SendMiddleware(options);
    return sendMiddleware.middleware();
}

function xml(options: {
        noXmlTransform: boolean,
        rootXmlKey: string,
        transformXmlKeys: any,
        xmlName: string
    }): any{
    let xmlMiddleware = new XmlMiddleware(options);
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