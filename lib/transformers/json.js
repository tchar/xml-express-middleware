function transform(data, transformJsonKey) {

    function _transform(data) {
        if (data == null) {
            return data;
        }
        if (typeof data !== 'object') {
            return data;
        }
        let resData = {};
        Object.keys(data).forEach(key => {
            let newKey = transformJsonKey(key);
            if (typeof data[key] === 'object' && data[key].constructor == Array) {
                resData[newKey] = [];
                data[key].forEach(d => {
                    resData[newKey].push(_transform(d));
                });
            } else {
                resData[newKey] = _transform(data[key]);
            }
        });
        return resData;
    }

    if (transformJsonKey == null) {
        return data;
    } else {
        return _transform(data);
    }
}

module.exports = transform;