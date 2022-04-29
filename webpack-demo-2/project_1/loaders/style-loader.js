const transform = code =>
`if(document) {
  const style = document.createElement('style')
  style.innerHTML = ${code}
  document.head.appendChild(style)
}
`
module.exports = transform
