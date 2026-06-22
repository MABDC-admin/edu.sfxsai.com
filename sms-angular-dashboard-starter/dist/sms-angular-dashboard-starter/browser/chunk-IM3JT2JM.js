import {
  parse
} from "./chunk-QSVAJT6F.js";
import "./chunk-JEOT5DHJ.js";
import "./chunk-GMT5B2FZ.js";
import "./chunk-GON26RYH.js";
import "./chunk-JGXCCZWK.js";
import "./chunk-NVKK2M7Z.js";
import "./chunk-RZK3A36M.js";
import "./chunk-VJ6EXAQR.js";
import "./chunk-7XOMCEAR.js";
import "./chunk-2Q3Z7AQD.js";
import {
  selectSvgElement
} from "./chunk-QUUGZBUH.js";
import {
  configureSvgSize
} from "./chunk-XWPJIHYZ.js";
import {
  __name,
  log
} from "./chunk-JQXAE7P2.js";
import "./chunk-EJ7SGQBE.js";
import "./chunk-CKSQVCY3.js";
import {
  __async
} from "./chunk-KFN7JZX4.js";

// node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-5YYISTIA.mjs
var parser = {
  parse: /* @__PURE__ */ __name((input) => __async(null, null, function* () {
    const ast = yield parse("info", input);
    log.debug(ast);
  }), "parse")
};
var DEFAULT_INFO_DB = {
  version: "11.15.0" + (true ? "" : "-tiny")
};
var getVersion = /* @__PURE__ */ __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = /* @__PURE__ */ __name((text, id, version) => {
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
//# sourceMappingURL=chunk-IM3JT2JM.js.map
