import { EventLog, Trace, Event, BinaryLog, ClassifiedTraces } from "../types";

import fs from "fs";
import parser from "fast-xml-parser";

const parserOptions = {
  attributeNamePrefix: "",
  attrNodeName: "attr", //default is 'false'
  textNodeName: "#text",
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: true,
  trimValues: true,
  parseTrueNumberOnly: false,
  arrayMode: true, //"strict"
  stopNodes: ["parse-me-as-string"],
};

// Parse .xes file to an EventLog
export const parseBinaryLog = (
  filepath: string
): { trainingLog: BinaryLog; testLog: EventLog; gtLog: ClassifiedTraces } => {
  if (!filepath.endsWith(".xes")) {
    throw new Error("Invalid file extension");
  }
  const data = fs.readFileSync(filepath);
  const logJson = parser.parse(data.toString(), parserOptions);
  const trainingLog: BinaryLog = {
    events: new Set<Event>(),
    traces: {},
    nTraces: {},
  };

  const testLog: EventLog = {
    events: new Set<Event>(),
    traces: {},
  };

  const gtLog: ClassifiedTraces = {};

  for (const i in logJson.log[0].trace) {
    const trace: Trace = [];
    let traceId: string = "";
    let label: string = "";
    const xmlTrace = logJson.log[0].trace[i];
    for (const elem of xmlTrace.string) {
      if (elem.attr.key === "concept:name") {
        traceId = elem.attr.value;
      }
      if (elem.attr.key === "label") {
        label = elem.attr.value;
      }
    }
    if (traceId === "" || label === "") {
      throw new Error("No trace id or label found!");
    }
    const events = xmlTrace.event ? xmlTrace.event : [];
    for (const elem of events) {
      for (const event of elem.string) {
        if (event.attr.key === "concept:name") {
          trace.push(event.attr.value.toString());
          trainingLog.events.add(event.attr.value.toString());
        }
      }
    }
    (label === "Required" ? trainingLog.traces : trainingLog.nTraces)[traceId] =
      trace;
    testLog.traces[traceId] = trace;
    gtLog[traceId] = label === "Required";
  }
  testLog.events = trainingLog.events;
  return { trainingLog, testLog, gtLog };
};
