import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { readFileSync } from 'fs'
import { resolve, relative, dirname } from 'path'
import * as babel from '@babel/core'


const projectRoot = resolve(__dirname, 'project_1')

type DepRelation = {
  [key: string]: {
    deps: string[],
    code: string
  }
}

const depRelation: DepRelation = {} 

collectCodeAndDeps(resolve(projectRoot, 'index.js'))
console.log(depRelation)


function collectCodeAndDeps(filepath: string) {
  const key = getProjectPath(filepath)
  if(Object.keys(depRelation).includes(key)) {
    console.log('发现重复依赖')
    return;
  }
  const code = readFileSync(filepath).toString()
  // 将es6转为es5
  const result = babel.transform(code, {
    presets: ['@babel/preset-env']
  })

  if(result && result.code) {
    depRelation[key] = {
      deps: [],
      code: result.code
    }
  }


  const ast = parse(code, { sourceType: 'module'})

  traverse(ast, {
    enter: path => {
      if(path.node.type === 'ImportDeclaration') {
        const depAbsolutePath = resolve(dirname(filepath), path.node.source.value)
        // 转为项目路径
        const depProjectPath = getProjectPath(depAbsolutePath)
        depRelation[key].deps.push(depProjectPath)
        collectCodeAndDeps(depAbsolutePath)
      }
    }
  })
}

function getProjectPath(path: string) {
  return relative(projectRoot, path).replace(/\\/g, '/')
}

// 分析project_1 index.js 依赖 并且编译为es5语法