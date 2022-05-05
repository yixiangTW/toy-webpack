import * as babel from '@babel/core'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import path, { resolve, dirname } from 'path'
import fs from 'fs'
import config from './bundler.config'

const projectRoot = path.resolve(__dirname)
const depEntry = path.resolve(projectRoot, config.entry)

type DepRelation = {
  key: string;
  deps: string[];
  code: string;
}

const depRelation: DepRelation[] = []

const collectCodeAndDeps = (depEntry: string) => {
  if(depRelation.find(i => i.key === depEntry)) {
   return 
  }
  let code = fs.readFileSync(depEntry).toString()
  if(/\.css$/.test(depEntry)) {
    code = require('./loaders/css-loader')(code)
    code = require('./loaders/style-loader')(code)
  }
  const result = babel.transform(code, {
    presets: ['@babel/preset-env']
  })
  let item: DepRelation
  if(result && result.code) {
    item = {
      key: depEntry,
      deps: [],
      code: result.code
    }
    depRelation.push(item)
  }

  const ast = parse(code, { sourceType: 'module' })
  traverse(ast, {
    enter: path => {
      if(path.node.type === 'ImportDeclaration') {
        const depAbsolutePath = resolve(dirname(depEntry), path.node.source.value)
        item.deps.push(depAbsolutePath)
        collectCodeAndDeps(depAbsolutePath)
      }
    }
  })
}

collectCodeAndDeps(depEntry)

console.log(
  'result', depRelation
)

const generateCode = () => {
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
      if(modules[key]) {
        return modules[key]
      }
      var item = depRelation.find(i => i.key === key)
      if(!item) {
        throw new Error(\`\${item} is not found\`)
      }
      var require = (path) => {
        var dirname = key.substring(0, key.lastIndexOf('/') + 1)
        var projectPath = (dirname + path).replace(\/\\.\\\/\/g, '').replace(\/\\\/\\\/\/, '/')
        path = depRelation.find(i => i.key.indexOf(projectPath) !== -1).key
        return execute(path)
      }
      modules[key] = { __esModule: true }
      var module = { exports: modules[key] }
      item.code(require, module, module.exports)
      return modules[key]
    }
  `
  code += 'console.log(depRelation)'
  return code
}

fs.writeFileSync('dist.js', generateCode())
