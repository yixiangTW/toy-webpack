import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { readFileSync, writeFile, writeFileSync } from 'fs'
import { resolve, relative, dirname } from 'path'
import * as babel from '@babel/core'


const projectRoot = resolve(__dirname, 'project_1')

type DepRelation = {
  key: string,
  deps: string[],
  code: string
}

const depRelation: DepRelation[] = []  

collectCodeAndDeps(resolve(projectRoot, 'index.js'))
console.log(depRelation)

writeFileSync('./bundle.js', generateCode())

function generateCode() {
  let code = ''
  code += 'var depRelation = [' + depRelation.map(item => {
    const { key, deps, code } = item
    return `{
      key: ${JSON.stringify(key)},
      deps: ${JSON.stringify(deps)},
      code: function(require, module, exports) {
        ${code}
      }
    }`
  }).join(',') + '];\n'
  code += 'var modules = {};\n'
  code += 'execute(depRelation[0].key)\n'
  code += `
  function execute(key) {
    if(modules[key]) { return modules[key] }
    var item = depRelation.find(i => i.key === key)
    if(!item) { throw new Error(\`\${item} is not found\`)}
    var pathToKey = (path) => {
      var dirname = key.substring(0, key.lastIndexOf('/') + 1)
      var projectPath = (dirname + path).replace(\/\\.\\\/\/g, '').replace(\/\\\/\\\/\/, '/')
      return projectPath
    }
    var require = (path) => {
      return execute(pathToKey(path))
    }
    modules[key] = { __esModule: true }
    var module = { exports: modules[key]}
    item.code(require, module, module.exports)
    return modules[key]
  }
  `
  return code
}

function collectCodeAndDeps(filepath: string) {
  const key = getProjectPath(filepath)
  if(depRelation.find(i => i.key === key)) {
    console.log('发现重复依赖')
    return;
  }
  let code = readFileSync(filepath).toString()
  if(/\.css$/.test(filepath)) {
    code = require('../loaders/css-loader')(code)
    code = require('../loaders/style-loader')(code)
  }
  // 将es6转为es5
  const result = babel.transform(code, {
    presets: ['@babel/preset-env']
  })
  let item: DepRelation
  if(result && result.code) {
    item = {
      key,
      deps: [],
      code: result.code
    }
    depRelation.push(item)
  }


  const ast = parse(code, { sourceType: 'module'})

  traverse(ast, {
    enter: path => {
      if(path.node.type === 'ImportDeclaration') {
        const depAbsolutePath = resolve(dirname(filepath), path.node.source.value)
        // 转为项目路径
        const depProjectPath = getProjectPath(depAbsolutePath)
        item.deps.push(depProjectPath)
        collectCodeAndDeps(depAbsolutePath)
      }
    }
  })
}

function getProjectPath(path: string) {
  return relative(projectRoot, path).replace(/\\/g, '/')
}

// 一个简易的打包器 打包 webpack-demo-2/project_1/index.js 生成 bundle.js
// 引入css-loader style-loader
