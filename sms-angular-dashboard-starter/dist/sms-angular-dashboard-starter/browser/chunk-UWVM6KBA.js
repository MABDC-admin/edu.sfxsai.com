import {
  ImperativeState
} from "./chunk-CQHX5FK2.js";
import {
  populateCommonDb
} from "./chunk-RIMCYVLR.js";
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
  cleanAndMerge
} from "./chunk-7MGTYN5B.js";
import "./chunk-TTK3XHA2.js";
import {
  clear,
  configureSvgSize,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
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

// node_modules/mermaid/dist/chunks/mermaid.core/diagram-5GNKFQAL.mjs
var state = new ImperativeState(() => ({
  cnt: 1,
  stack: [
    {
      id: 0,
      level: -1,
      name: "/",
      children: []
    }
  ]
}));
var clear2 = /* @__PURE__ */ __name(() => {
  state.reset();
  clear();
}, "clear");
var getRoot = /* @__PURE__ */ __name(() => {
  return state.records.stack[0];
}, "getRoot");
var getCount = /* @__PURE__ */ __name(() => state.records.cnt, "getCount");
var defaultConfig = defaultConfig_default.treeView;
var getConfig2 = /* @__PURE__ */ __name(() => {
  return cleanAndMerge(defaultConfig, getConfig().treeView);
}, "getConfig");
var addNode = /* @__PURE__ */ __name((level, name) => {
  while (level <= state.records.stack[state.records.stack.length - 1].level) {
    state.records.stack.pop();
  }
  const node = {
    id: state.records.cnt++,
    level,
    name,
    children: []
  };
  state.records.stack[state.records.stack.length - 1].children.push(node);
  state.records.stack.push(node);
}, "addNode");
var db = {
  clear: clear2,
  addNode,
  getRoot,
  getCount,
  getConfig: getConfig2,
  getAccTitle,
  getAccDescription,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
};
var db_default = db;
var populate = /* @__PURE__ */ __name((ast) => {
  populateCommonDb(ast, db_default);
  ast.nodes.map((node) => db_default.addNode(node.indent ? parseInt(node.indent) : 0, node.name));
}, "populate");
var parser = {
  parse: /* @__PURE__ */ __name((input) => __async(null, null, function* () {
    const ast = yield parse("treeView", input);
    log.debug(ast);
    populate(ast);
  }), "parse")
};
var positionLabel = /* @__PURE__ */ __name((x, y, node, domElem, config) => {
  const label = domElem.append("text").text(node.name).attr("dominant-baseline", "middle").attr("class", "treeView-node-label");
  const { height: labelHeight, width: labelWidth } = label.node().getBBox();
  const height = labelHeight + config.paddingY * 2;
  const width = labelWidth + config.paddingX * 2;
  label.attr("x", x + config.paddingX);
  label.attr("y", y + height / 2);
  node.BBox = {
    x,
    y,
    width,
    height
  };
}, "positionLabel");
var positionLine = /* @__PURE__ */ __name((domElem, x1, y1, x2, y2, lineThickness) => {
  return domElem.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke-width", lineThickness).attr("class", "treeView-node-line");
}, "positionLine");
var drawTree = /* @__PURE__ */ __name((elem, root, config) => {
  let totalHeight = 0;
  let totalWidth = 0;
  const drawNode = /* @__PURE__ */ __name((elem2, node, config2, depth) => {
    const indent = depth * (config2.rowIndent + config2.paddingX);
    positionLabel(indent, totalHeight, node, elem2, config2);
    const { height, width } = node.BBox;
    positionLine(
      elem2,
      indent - config2.rowIndent,
      totalHeight + height / 2,
      indent,
      totalHeight + height / 2,
      config2.lineThickness
    );
    totalWidth = Math.max(totalWidth, indent + width);
    totalHeight += height;
  }, "drawNode");
  const processNode = /* @__PURE__ */ __name((node, depth = 0) => {
    drawNode(elem, node, config, depth);
    node.children.forEach((child) => {
      processNode(child, depth + 1);
    });
    const { x, y, height } = node.BBox;
    if (node.children.length) {
      const { y: endY, height: endHeight } = node.children[node.children.length - 1].BBox;
      positionLine(
        elem,
        x + config.paddingX,
        y + height,
        x + config.paddingX,
        endY + endHeight / 2 + config.lineThickness / 2,
        config.lineThickness
      );
    }
  }, "processNode");
  processNode(root);
  return { totalHeight, totalWidth };
}, "drawTree");
var draw = /* @__PURE__ */ __name((text, id, _ver, diagObj) => {
  log.debug("Rendering treeView diagram\n" + text);
  const db2 = diagObj.db;
  const root = db2.getRoot();
  const config = db2.getConfig();
  const svg = selectSvgElement(id);
  const treeElem = svg.append("g");
  treeElem.attr("class", "tree-view");
  const { totalHeight, totalWidth } = drawTree(treeElem, root, config);
  svg.attr("viewBox", `-${config.lineThickness / 2} 0 ${totalWidth} ${totalHeight}`);
  configureSvgSize(svg, totalHeight, totalWidth, config.useMaxWidth);
}, "draw");
var renderer = {
  draw
};
var renderer_default = renderer;
var defaultTreeViewDiagramStyles = {
  labelFontSize: "16px",
  labelColor: "black",
  lineColor: "black"
};
var styles = /* @__PURE__ */ __name(({
  treeView
}) => {
  const { labelFontSize, labelColor, lineColor } = cleanAndMerge(
    defaultTreeViewDiagramStyles,
    treeView
  );
  return `
    .treeView-node-label {
        font-size: ${labelFontSize};
        fill: ${labelColor};
    }
    .treeView-node-line {
        stroke: ${lineColor};
    }
    `;
}, "styles");
var styles_default = styles;
var diagram = {
  db: db_default,
  renderer: renderer_default,
  parser,
  styles: styles_default
};
export {
  diagram
};
//# sourceMappingURL=chunk-UWVM6KBA.js.map
