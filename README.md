Here is the purpose of this research as defined by the ticket.

> As a development team building the provider onboarding flow
>
> I want to decide on a Node.js library for handling and processing XML as objects
>
> so that we know that we can manage Apigee XML configurations as objects within our code so we can automate processes related to configuration.

Our goal is to be able to convert from XML to JS objects and vice versa.

### XML-JS

[https://www.npmjs.com/package/xml-js](https://www.npmjs.com/package/xml-js)

Pros:

-   widely used at 3.8M downloads per month
-   maintains order of elements
-   fully xml complient
    -   can parse: elements, attributes, texts, comments, CData, DOCTYPE, XML declarations, and Processing instructions
-   fully reversible

[https://github.com/nashwaan/xml-js#readme](https://github.com/nashwaan/xml-js#readme)

It's important to note that we are converting XML to standard Javascript objects here, but converting to JSON is also possible, with no added complexity.

Example implementation:
```js
import * as convert from 'xml-js';
import * as fs from 'fs';
import * as path from 'path';

type XMLHash = {
	apigeeProperty: string;
	xmlString: string;
}

const getXMLStringFromFile = (filepath: string) : string => {
	return fs.readFileSync(filepath,'utf-8');
};

// Here I am accessing the example XML files
// attached to the ticket to simulate how this
// service would be passed the XML
const extractXMLFromDirectory = (dirpath: string) : Array<XMLHash> => {
	let result: Array<XMLHash> = [];
	let items = fs.readdirSync(dirpath)
	items.forEach(item => {
		if (item.endsWith('.xml')){
			console.log(`Reading file: ${dirpath}/${item}`)
			result.push({
				apigeeProperty: 'unknown',
				xmlString: getXMLStringFromFile(`${dirpath}/${item}`)
			});
		} else {
			console.log(`Reading directory: ${dirpath}/${item}`)
			let subfiles = fs.readdirSync(`${dirpath}/${item}`)
			subfiles.forEach(subfile => {
				console.log(`\tReading file: ${subfile}`);
				result.push({
					apigeeProperty: item,
					xmlString: getXMLStringFromFile(`${dirpath}/${item}/${subfile}`)
				})
			})
		}
	});
	return result;
};

const convertFromObjecttoXML = (xmlObject: Object) : string => {
	let result = convert.js2xml(xmlObject, {compact: true, spaces: 0});
	return result;
}

const saveXMLToFile = (xmlString: string, filepath: string) : void => {
	fs.writeFile(filepath, xmlString, (err)=>{
		if (err) {
			throw `could not write to file: ${err}`;
		}
		console.log(`File was saved at: ${filepath}`);
	});
}

const saveXMLToObjects = (xmlArray: XMLHash[]) => {
	let xmlObjects: any[] = [];
	xmlArray.forEach(el=>{
		let converted = convert.xml2js(el.xmlString, {compact: true})
		xmlObjects.push(converted);
	});
	return xmlObjects;
}

// get xml strings from example XML files.
let result = extractXMLFromDirectory(path.join(__dirname,'./apiproxy'));
// convert xml strings to JS Objects
let xmlAsObjects = saveXMLToObjects(result);
// grab a single XML object
let firstXML = xmlAsObjects[0];
// change part of the XML Object
let oldAttribute = firstXML['Manifest']['TargetEndpoints']['VersionInfo']['_attributes']['resourceName'];
firstXML['Manifest']['TargetEndpoints']['VersionInfo']['_attributes']['resourceName'] = 'new default';
console.log(`Old attribute: '${oldAttribute}'`);
console.log(`New attribute: '${firstXML['Manifest']['TargetEndpoints']['VersionInfo']['_attributes']['resourceName']}'`);
// convert back to XML String
let xmlString = convertFromObjecttoXML(firstXML);
console.log(`New XML String: \n ${xmlString}`);
// save new xml string to file
saveXMLToFile(xmlString, 'newfile.xml')

```
When the above file is run, it outputs the following:


```
Reading directory: /home/braden/work/xml_prototype/src/apiproxy/manifests
	Reading file: manifest.xml
Reading directory: /home/braden/work/xml_prototype/src/apiproxy/policies
	Reading file: impose-quota.xml
	Reading file: remove-query-param-apikey.xml
	Reading file: verify-api-key.xml
Reading directory: /home/braden/work/xml_prototype/src/apiproxy/proxies
	Reading file: default.xml
Reading directory: /home/braden/work/xml_prototype/src/apiproxy/targets
	Reading file: default.xml
Reading file: /home/braden/work/xml_prototype/src/apiproxy/test_api_claims.xml

Old attribute: 'default'
New attribute: 'new default'

New XML String:
<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Manifest name="manifest"><Policies><VersionInfo resourceName="impose-quota" version="SHA-512:c9fa343c043ee2a736b86ede60733f5c27b63e67d9e337d35098a3379ae00b846762d1d13a873cc436d3faf9c7c8dfebf14daf792cf47ae2c88586651e056f57"/><VersionInfo resourceName="remove-query-param-apikey" version="SHA-512:bebd2e662024f852231175e62f9aa7367aec21aa9ab4541f19e85d7d0f5d8dabe69cd2aea0ef00676549e0e7867693a907b8f661a0a7a4773587fd135a3b5f09"/><VersionInfo resourceName="verify-api-key" version="SHA-512:6595defb9a0b6d7fce111a9fe959f5e8a7aa03ffb301373c4c4e20e814648b42d5858631e95e4a8d698b5fe2139390c252e9011d9f1be8c3a35de73c1c269f97"/></Policies><ProxyEndpoints><VersionInfo resourceName="default" version="SHA-512:75346d98ed3d79501b52a28dc9cfcb7e14b807591dac9552c5ec61218360b578386713df54c9931205159d522ab8f4a7f5cb0e5978fc53e3b6807528dbb35c5a"/></ProxyEndpoints><Resources/><SharedFlows/><TargetEndpoints><VersionInfo resourceName="new default" version="SHA-512:9320f047d33f56599d30607d5061c4aeb6e9e0184c3013b01ef03d1aaca001768101759977f8e62cfaeb00e22ac32e7e1ea98ee9fcaaa48d44c7286d70463d8d"/></TargetEndpoints></Manifest>

File was saved at: newfile.xml
```
Here we have an implementation capable of

1.  Loading XML Files
2.  Converting those files to Javascript/JSON objects
3.  Manipulating those objects
4.  Converting objects back to XML
5.  Saving the updated XML to an output file

