/**
 * Index module
 * @module index
 */
const xml = require('./lib/xml');
const send = require('./lib/send');

/**
 * Export send as default
 * Export send as send
 * Export xml as xml
 */
module.exports = send;
module.exports.send = send;
module.exports.xml = xml;