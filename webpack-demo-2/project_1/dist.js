var depRelation = [{
      key: "/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/index.js",
      deps: ["/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/a.js","/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/b.js","/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/util/math.js","/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/style.css"],
      code: function(require, module, exports) {
        "use strict";

var _a = _interopRequireDefault(require("./a.js"));

var _b = _interopRequireDefault(require("./b.js"));

var _math = _interopRequireDefault(require("./util/math.js"));

require("./style.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log(_a["default"].getB());
console.log(_b["default"].getA());
console.log(_math["default"].getRandom());
      }
    },{
      key: "/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/a.js",
      deps: ["/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/b.js"],
      code: function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _b = _interopRequireDefault(require("./b.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a = {
  value: 'a',
  getB: function getB() {
    return _b["default"].value + 'from a.js';
  }
};
var _default = a;
exports["default"] = _default;
      }
    },{
      key: "/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/b.js",
      deps: ["/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/a.js"],
      code: function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _a = _interopRequireDefault(require("./a.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var b = {
  value: 'b',
  getA: function getA() {
    return _a["default"].value + 'from b.js';
  }
};
var _default = b;
exports["default"] = _default;
      }
    },{
      key: "/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/util/math.js",
      deps: [],
      code: function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _default = {
  getRandom: function getRandom() {
    return Math.random();
  }
};
exports["default"] = _default;
      }
    },{
      key: "/Users/yixiang.liu/webpack-demo/webpack-demo-2/project_1/style.css",
      deps: [],
      code: function(require, module, exports) {
        "use strict";

if (document) {
  var style = document.createElement('style');
  style.innerHTML = "body {\n  color: red;\n}";
  document.head.appendChild(style);
}
      }
    }];
var modules = {};
execute(depRelation[0].key)

    function execute(key) {
      if(modules[key]) {
        return modules[key]
      }
      var item = depRelation.find(i => i.key === key)
      if(!item) {
        throw new Error(`${item} is not found`)
      }
      var require = (path) => {
        var dirname = key.substring(0, key.lastIndexOf('/') + 1)
        var projectPath = (dirname + path).replace(/\.\//g, '').replace(/\/\//, '/')
        path = depRelation.find(i => i.key.indexOf(projectPath) !== -1).key
        return execute(path)
      }
      modules[key] = { __esModule: true }
      var module = { exports: modules[key] }
      item.code(require, module, module.exports)
      return modules[key]
    }
  console.log(depRelation)