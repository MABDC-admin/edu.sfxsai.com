import {
  __name
} from "./chunk-4WDR47UG.js";
import {
  __async
} from "./chunk-OOTEPBR6.js";

// node_modules/@mermaid-js/parser/dist/mermaid-parser.core.mjs
var parsers = {};
var initializers = {
  info: __name(() => __async(null, null, function* () {
    const { createInfoServices: createInfoServices2 } = yield import("./info-J43DQDTF-KRESB4S2.js");
    const parser = createInfoServices2().Info.parser.LangiumParser;
    parsers.info = parser;
  }), "info"),
  packet: __name(() => __async(null, null, function* () {
    const { createPacketServices: createPacketServices2 } = yield import("./packet-YPE3B663-JOQPRAH7.js");
    const parser = createPacketServices2().Packet.parser.LangiumParser;
    parsers.packet = parser;
  }), "packet"),
  pie: __name(() => __async(null, null, function* () {
    const { createPieServices: createPieServices2 } = yield import("./pie-LRSECV5Y-N7LY4IHL.js");
    const parser = createPieServices2().Pie.parser.LangiumParser;
    parsers.pie = parser;
  }), "pie"),
  treeView: __name(() => __async(null, null, function* () {
    const { createTreeViewServices: createTreeViewServices2 } = yield import("./treeView-BLDUP644-J2N4GTGH.js");
    const parser = createTreeViewServices2().TreeView.parser.LangiumParser;
    parsers.treeView = parser;
  }), "treeView"),
  architecture: __name(() => __async(null, null, function* () {
    const { createArchitectureServices: createArchitectureServices2 } = yield import("./architecture-7EHR7CIX-7BMMOIC6.js");
    const parser = createArchitectureServices2().Architecture.parser.LangiumParser;
    parsers.architecture = parser;
  }), "architecture"),
  gitGraph: __name(() => __async(null, null, function* () {
    const { createGitGraphServices: createGitGraphServices2 } = yield import("./gitGraph-WXDBUCRP-OJWVGIFG.js");
    const parser = createGitGraphServices2().GitGraph.parser.LangiumParser;
    parsers.gitGraph = parser;
  }), "gitGraph"),
  eventmodeling: __name(() => __async(null, null, function* () {
    const { createEventModelingServices: createEventModelingServices2 } = yield import("./eventmodeling-FCH6USID-N4MG575C.js");
    const parser = createEventModelingServices2().EventModel.parser.LangiumParser;
    parsers.eventmodeling = parser;
  }), "eventmodeling"),
  radar: __name(() => __async(null, null, function* () {
    const { createRadarServices: createRadarServices2 } = yield import("./radar-GUYGQ44K-2FVVVLUW.js");
    const parser = createRadarServices2().Radar.parser.LangiumParser;
    parsers.radar = parser;
  }), "radar"),
  treemap: __name(() => __async(null, null, function* () {
    const { createTreemapServices: createTreemapServices2 } = yield import("./treemap-LRROVOQU-BK5DH4HJ.js");
    const parser = createTreemapServices2().Treemap.parser.LangiumParser;
    parsers.treemap = parser;
  }), "treemap"),
  wardley: __name(() => __async(null, null, function* () {
    const { createWardleyServices: createWardleyServices2 } = yield import("./wardley-L42UT6IY-BNGZXW3O.js");
    const parser = createWardleyServices2().Wardley.parser.LangiumParser;
    parsers.wardley = parser;
  }), "wardley")
};
function parse(diagramType, text) {
  return __async(this, null, function* () {
    const initializer = initializers[diagramType];
    if (!initializer) {
      throw new Error(`Unknown diagram type: ${diagramType}`);
    }
    if (!parsers[diagramType]) {
      yield initializer();
    }
    const parser = parsers[diagramType];
    const result = parser.parse(text);
    if (result.lexerErrors.length > 0 || result.parserErrors.length > 0) {
      throw new MermaidParseError(result);
    }
    return result.value;
  });
}
__name(parse, "parse");
var _a;
var MermaidParseError = (_a = class extends Error {
  constructor(result) {
    const lexerErrors = result.lexerErrors.map((err) => {
      const line = err.line !== void 0 && !isNaN(err.line) ? err.line : "?";
      const column = err.column !== void 0 && !isNaN(err.column) ? err.column : "?";
      return `Lexer error on line ${line}, column ${column}: ${err.message}`;
    }).join("\n");
    const parserErrors = result.parserErrors.map((err) => {
      const line = err.token.startLine !== void 0 && !isNaN(err.token.startLine) ? err.token.startLine : "?";
      const column = err.token.startColumn !== void 0 && !isNaN(err.token.startColumn) ? err.token.startColumn : "?";
      return `Parse error on line ${line}, column ${column}: ${err.message}`;
    }).join("\n");
    super(`Parsing failed: ${lexerErrors} ${parserErrors}`);
    this.result = result;
  }
}, __name(_a, "MermaidParseError"), _a);

export {
  parse
};
//# sourceMappingURL=chunk-DZDO2XG3.js.map
