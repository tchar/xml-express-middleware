/**
 * Index module
 * @module index
 * @author Tilemachos Charalampous
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const send_1 = require("./middlewares/send");
const xml_1 = require("./middlewares/xml");
function send(options) {
    let sendMiddleware = new send_1.default(options);
    return sendMiddleware.middleware();
}
function xml(options) {
    let xmlMiddleware = new xml_1.default(options);
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
//# sourceMappingURL=index.js.map