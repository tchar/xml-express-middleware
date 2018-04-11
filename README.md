# XML Express Middleware

## How to use
Run
```bash
npm install xml-express-middleware --save
```

This module exposes two middleware functions

### xml
This middleware adds an xml function to res to use with res.xml

Use it with
```javascript
const app = require('express')();
const xmlMiddleware = require('xml-express-middleware').xml;
const options = {
    // Define your options
};

app.use(xmlMiddleware(options));

app.get('/', function(req, res, next){
    res.xml({
        someProperty: 'someValue',
        someOtherProperty: ['someOtherValue1', 'someOtherValue2']
    });
});

app.listen(8080);
```

In the above example if you perform an xml request on http://localhost:8080/ you will get the following xml response
```xml
<?xml version="1.0" encoding="utf-8"?>
<someProperty>
    someValue
</someProperty>
<someOtherProperties>
    <someOtherProperty>
        someOtherValue1
    </someOtherProperty>
    <someOtherProperty>
        someOtherValue2
    </someOtherProperty>
</someOtherProperties>
```