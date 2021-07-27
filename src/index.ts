import * as convert from 'xml-js';
import * as fs from 'fs';
import * as path from 'path';

type XMLHash = {
  apigeeProperty: string;
  xmlString: string;
}

const getXMLStringFromFile = (filepath: string) : string =>  {
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
