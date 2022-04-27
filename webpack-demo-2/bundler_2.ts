import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { readFileSync } from 'fs'
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
// console.log(depRelation)


function collectCodeAndDeps(filepath: string) {
  const key = getProjectPath(filepath)
  if(depRelation.find(i => i.key === key)) {
    console.log('发现重复依赖')
    return;
  }
  const code = readFileSync(filepath).toString()
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
  console.log(relative(projectRoot, path))
  return relative(projectRoot, path).replace(/\\/g, '/')
}

// 分析project_1 index.js 依赖 并且编译为es5语法
// 将depRelation对象转为数组
// path.relative(from, to) 返回from 到to的相对路径
// path.resolve([...from], to) 将to参数解析为绝对路径，从后向前解析，若字符以/开头，不会再继续拼接路径，因为已经拼接到一个绝对路径了
// path.resolve('/foo/bar', './baz')  /foo/bar/baz
// path.resolve('/foo/bar', '/baz')  /baz
// path.resolve('/foo/bar', '../baz')  /foo/baz
// path.resolve('home', '/foo/bar', '../baz') /foo/baz