/**
 * True send module
 * @module lib/true_send
 */

'use strict';
let trueSend;

/**
 * This function is basically a singleton that accepts 
 * a the res.send and assigns it to trueSend once
 * @param {function} send - The res.send function
 * @returns {function} The original res.send assigned in trueSend
 */
function trueResSend(send){
    if (trueSend == null){
        trueSend = send;
    }
    return trueSend;
}

/**
 * Export the function trueResSend
 */
module.exports = trueResSend;