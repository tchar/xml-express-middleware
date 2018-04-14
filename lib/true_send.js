let trueSend;

module.exports = function(send){
    if (trueSend == null){
        trueSend = send;
    }
    return trueSend;
};