# XML Express Middleware

## How to use
Run
```bash
npm install xml-express-middleware --save
```

This module exposes two middlewares

## xml
This middleware adds an xml function to res to use with res.xml

### Usage
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

### Options
The following options can be passed

Property | Value | Description
--- | --- | ---
transformXmlKeys | string:['decamelize','camelize','none'], default:'none' | transform the xml keys 
rootXmlKey | string, default:elements | adds root xml key when the json is an array
xmlName | string, default: 'xml' | the name of the function to be added to res. default is xml meaning it will add an xml method to res.
noXmlTransform | boolean, default: false | if true does not transform the original json to xml and ignores all other xml related options

So for example the following json response
```json
[{
    "someKey": "someValue1"
},{
    "someKey": "someValue2"
}]
```
by using
```javascript
app.use(require('xml-express-middleware').xml({transformXmlKeys: 'decamelize', rootXmlKey: 'someElement'}))
```
will produce a response
```xml
<?xml version="1.0" encoding="utf-8"?>
<some_elements>
    <some_element>
        <some_key>
            someValue1
        </some_key>
    </some_element>
    <some_element>
        <some_key>
            someValue2
        </some_key>
    </some_element>
</some_elements>
```

**Note: undefined and null values will be transformed to '' in the xml in order to avoid having undefined values. So a value with the respecive keyname "key" will result in the <key/> xml version of it. In the relevant json response, null and undefined values are not transformed.**

**Note: If the json is an array then you should use the option rootXmlKey to add a root to your xml, otherwise the keys will have a default root element named 'elements'. You can use this middleware in a specific express path instead of app.use(xmlMiddleware()), in order to have different root keys if need be.**

## send
This middleware by default replaces the send function of express' res.send method with the equivalent send version which sends an xml response
when the header proper `Accept` header is set (default `application/xml`, `text/xml`).

In this way you can use res.send() and let the function handle the response type. If there is no header and the data to be sent is an object, then res.json is used otherwise the original epxress' res.send is used.

It can also be defined through optons the send name to be assigned to res if you don't want to override res's default send function.

### Usage
```javascript
const app = require('express')();
const sendMiddleware = require('xml-express-middleware');
//or
const sendMiddleware = require('xml-express-middleware').send;
const options = {
    // Define your options
};

app.use(sendMiddleware(options));

app.get('/', function(req, res, next){
    res.send({
        someProperty: 'someValue',
        someOtherProperty: ['someOtherValue1', 'someOtherValue2']
    });
});

app.listen(8080);
```
if `Accept` headers are not set the response will be:
```json
{
    "someProperty": "someValue",
    "someOtherProperty": [
        "someOtherValue1",
        "someOtherValue2"
    ]
}
```

whereas if `Accept: application/xml` or `Accept: application/xml` header is set the response will be (with no options):
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

### Options
The options are a superset of the options from the xml middleware

Key | Value | Description
--- | --- | ---
transformXmlKeys | string:['decamelize','camelize','none'], default:'none' | transform the xml keys
rootXmlKey | string, default:elements | adds a root xml to the xml tree only when the json is an array
transformJsonKeys | string:['decamelize','camelize','none'], default:'none' | transform the json properties
sendName | string, default: 'send' | the name of the function to be added to res. default is send meaning res' default send method will be overriden.
xmlAcceptHeaders | array of strings or RegExp, default ['application/xml', 'text/xml'] | the headers which res.send checks to send a response in xml. You can pass a RegExp instead of an array of strings.
noXmlTransform | boolean, default: false | if true does not transform the original json to xml and ignores all other xml related options

## Tests
You can run the tests using npm test, which spawns an express app listening to the port 8095 and performs the tests.

You will need the following dev dependencies
```json
{
    "devDependencies": {
        "assert": "^1.4.1",
        "express": "^4.16.3",
        "mocha": "^5.0.5",
        "request": "^2.85.0",
        "request-promise": "^4.2.2"
    }
}
```
Run with
```bash
npm test
```
