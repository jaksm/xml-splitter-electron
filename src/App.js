import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import logo from "./logo.svg";
import "./App.css";
import parser, { j2xParser as ToXMLParser } from "fast-xml-parser";
import he from "he";
const { ipcRenderer } = window;

const options = {
  attributeNamePrefix: "",
  // attrNodeName: "attr", //default is 'false'
  // textNodeName: "#text",
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: true,
  parseNodeValue: true,
  parseAttributeValue: true,
  trimValues: true,
  format: false,
  indentBy: "  ",
  // cdataTagName: "__cdata", //default is 'false'
  // cdataPositionChar: "\\c",
  // localeRange: "", //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: a => he.decode(a, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: a => he.decode(a) //default is a=>a
};

const App = () => {
  const reader = new FileReader();
  const toXmlParser = new ToXMLParser(options);
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];

    reader.onload = ({ target }) => {
      const content = target.result;

      if (parser.validate(content)) {
        const json = parser.parse(content, options);
        const results = json.porudzbine.porudzbinaDobavljac;
        // transformation logic
        const xmlContents = results.map(res => {
          res.sifraObjekta = `0${res.sifraObjekta}`;
          return {
            fileName: `${file.name.split(".xml")[0]}_${res.storeID}.xml`,
            content: `<?xml version="1.0" encoding="windows-1250" standalone="no"?> \n${toXmlParser.parse({
              porudzbine: { porudzbineDobavljac: res }
            })}`
          };
        });
        ipcRenderer.send("request-xml-export", xmlContents);
      } else {
        console.error("XML not valid");
      }
    };

    reader.readAsText(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="App" {...getRootProps()}>
      <header className={isDragActive ? "App-header App-header-drop-active" : "App-header"}>
        <img src={logo} className={isDragActive ? "App-logo App-logo-medium-spin" : "App-logo"} alt="logo" />
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Release the file.</p>
        ) : (
          <p>
            Drop your <code>.xml</code> file here.
          </p>
        )}
      </header>
    </div>
  );
};

export default App;
