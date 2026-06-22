import {
  parse
} from "./chunk-DZDO2XG3.js";
import "./chunk-TDO6EYEY.js";
import "./chunk-N664EAD3.js";
import "./chunk-VAGERWS2.js";
import "./chunk-XFZBIYAF.js";
import "./chunk-RHFLKBH3.js";
import "./chunk-OUIXU3KP.js";
import "./chunk-REABTPOE.js";
import "./chunk-K5TOCO3K.js";
import "./chunk-ROOPSITY.js";
import "./chunk-NMOWG3IN.js";
import "./chunk-4WDR47UG.js";
import {
  selectSvgElement
} from "./chunk-BA6SVGG3.js";
import {
  configureSvgSize
} from "./chunk-JPWQL57S.js";
import {
  __name,
  log
} from "./chunk-TJZKMYXV.js";
import "./chunk-KKGGQWCI.js";
import {
  __async
} from "./chunk-OOTEPBR6.js";

// node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-5YYISTIA.mjs
var parser = {
  parse: __name((input) => __async(null, null, function* () {
    const ast = yield parse("info", input);
    log.debug(ast);
  }), "parse")
};
var DEFAULT_INFO_DB = {
  version: "11.15.0" + (true ? "" : "-tiny")
};
var getVersion = __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
//# sourceMappingURL=infoDiagram-5YYISTIA-HHCBA35B.js.map
