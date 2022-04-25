import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { readFileSync } from 'fs'
import { resolve, relative, dirname } from 'path'


const projectRoot = resolve(__dirname, 'project_3')

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
  const code = readFileSync(filepath).toString()
  depRelation[key] = {
    deps: [],
    code: code
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
// 分析project_3 index.js的依赖 循环依赖 报错 Maximum call stack size exceeded