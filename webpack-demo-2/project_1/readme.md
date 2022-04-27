现代浏览器可以通过<script type="module"> 来支持import export
IE 8 ~ 15 不支持 import export，所以不可能运行
运行index.html 执行： http-server project_1


在webpack-demo-2 中执行bundler_1.ts 打包 project_1 编译后的a.js 如下

开启严格模式
__esModule true 方便跟CommonJS模块区分开
void 0 等价于 undefined 过时的技巧
_interopRequireDefault 下划线前缀是为了避免重名 判断如果没有default 就加一个default
导出a 作为默认导出


'"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      '\n' +
      'var _b = _interopRequireDefault(require("./b.js"));\n' +
      '\n' +
      'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
      '\n' +
      'var a = {\n' +
      "  value: 'a',\n" +
      '  getB: function getB() {\n' +
      `    return _b["default"].value + 'from a.js';\n` +
      '  }\n' +
      '};\n' +
      'var _default = a;\n' +
      'exports["default"] = _default;'

import 关键字会变成 require函数
export 关键字会变成 exports对象
本质：ESModule语法变成了CommonJS规则