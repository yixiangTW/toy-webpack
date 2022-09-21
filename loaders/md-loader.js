const transform = code =>  
`export default ${JSON.stringify(code)}
`

module.exports = transform
