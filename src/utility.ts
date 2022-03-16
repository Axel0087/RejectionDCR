import type { DCRGraph, EventMap, Marking, Event, Traces } from "../types";

// Makes deep copy of a eventMap
export const copyEventMap = (eventMap: EventMap): EventMap => {
  const copy: EventMap = {};
  for (const startEvent in eventMap) {
    copy[startEvent] = new Set(eventMap[startEvent]);
  }
  return copy;
};

export const copySet = <T>(set: Set<T>): Set<T> => {
  return new Set(set);
};

export const copyMarking = (marking: Marking): Marking => {
  return {
    executed: copySet(marking.executed),
    pending: copySet(marking.pending),
    included: copySet(marking.included),
  };
};

export const copyTraces = (traces: Traces): Traces => {
  const copy: Traces = {};
  for (const traceId in traces) {
    copy[traceId] = [...traces[traceId]];
  }
  return copy;
};

export const copyGraph = (graph: DCRGraph): DCRGraph => {
  return {
    conditionsFor: copyEventMap(graph.conditionsFor),
    events: copySet(graph.events),
    excludesTo: copyEventMap(graph.excludesTo),
    includesTo: copyEventMap(graph.includesTo),
    marking: copyMarking(graph.marking),
    milestonesFor: copyEventMap(graph.milestonesFor),
    responseTo: copyEventMap(graph.responseTo),
  };
};

export const makeEmptyGraph = (events: Set<string>) => {
  const graph: DCRGraph = {
    events: copySet(events),
    conditionsFor: {},
    excludesTo: {},
    includesTo: {},
    milestonesFor: {},
    responseTo: {},
    marking: {
      executed: new Set<Event>(),
      pending: new Set<Event>(),
      included: copySet(events),
    },
  };
  for (const event of events) {
    graph.conditionsFor[event] = new Set();
    graph.responseTo[event] = new Set();
    graph.excludesTo[event] = new Set();
    graph.includesTo[event] = new Set();
    graph.milestonesFor[event] = new Set();
  }
  return graph;
};

export const makeFullGraph = (events: Set<string>) => {
  const graph: DCRGraph = {
    events: copySet(events),
    conditionsFor: {},
    excludesTo: {},
    includesTo: {},
    milestonesFor: {},
    responseTo: {},
    marking: {
      executed: new Set<Event>(),
      pending: new Set<Event>(),
      included: copySet(events),
    },
  };
  for (const e of events) {
    graph.conditionsFor[e] = new Set();
    graph.responseTo[e] = new Set();
    graph.excludesTo[e] = new Set();
    graph.includesTo[e] = new Set();
    //graph.excludesTo[e].add(e);
    for (const j of events) {
      if (e !== j) {
        graph.conditionsFor[e].add(j);
        graph.responseTo[e].add(j);
        //graph.includesTo[e].add(j);
      }
      graph.excludesTo[e].add(j);
    }
  }
  return graph;
};

export const reverseRelation = (relation: EventMap): EventMap => {
  const retRelation: EventMap = {};
  for (const e in relation) {
    retRelation[e] = new Set();
  }
  for (const e in relation) {
    for (const j of relation[e]) {
      retRelation[j].add(e);
    }
  }
  return retRelation;
};
