const pluralize = require('pluralize');

function transform(data, transformXmlKey) {

    function _transform(data) {
        if (data == null) {
            return '';
        }
        if (typeof data !== 'object') {
            return data;
        }
        let resData = {};
        Object.keys(data).forEach(key => {
            let singKey = transformXmlKey(pluralize.singular(key));
            let newKey = transformXmlKey(key);
            if (data[key] != null && data[key].constructor == Array) {
                newKey = pluralize(newKey);
                resData[newKey] = [];
                data[key].forEach(d => {
                    let newData = {};
                    newData[singKey] = _transform(d);
                    resData[newKey].push(newData);
                });
            } else {
                resData[newKey] = _transform(data[key]);
            }
        });
        return resData;
    }
    return _transform(data);
}

module.exports = transform;