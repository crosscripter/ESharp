'use strict'
const log = x => console.log(x)


let rule = (re, cb) => ({re: new RegExp(`^${re}$`), cb})
let arglist = args => args.split(',').filter(x => x) 
let params = args => arglist(args).join(',')

let rules = [
    rule(/^\s*$/, () => ``),
    rule(/^\#(.*)$/, (...[_, text]) => `/*${text}*/`),
    rule(/^let ([A-Z_][A-Z_\d]*)\s*\=\s*(.*)$/i, (...[_, id, expr]) => `let ${id}=${expr};`),
    rule(/^type ([A-Z][A-Za-z_\d]*)\s*\(\s*((?:[^=]*)\s*(?:\,\s*(?:[^=]*))*)+\s*\)\s*$/, (...[_, id, args]) => `let ${id}=(${params(args)})=>({${params(args)}});`),
    rule(/^let ([A-Z][A-Za-z_\d]*)\s*\(\s*((?:[^=]*)\s*(?:\,\s*(?:[^=]*))*)+\s*\)\s*\=\s*(.*)$/, (...[_, id, args, expr]) => `let ${id}=(${params(args)})=>${expr};`),
    rule(/^([a-z_][A-Za-z_\d]*)\s*\(\s*((?:[^=]*)\s*(?:\,\s*(?:[^=]*))*)+\s*\)\s*$/, (...[_, id, args]) => `${id}(${params(args)});`),
    rule(/^let ([a-z_][A-Za-z_\d]*)\s*\(\s*((?:[^=]*)\s*(?:\,\s*(?:[^=]*))*)+\s*\)\s*\=\s*(.*)$/,
        (...[_, id, args, expr]) => `let ${id}=(${params(args)})=>{return ${expr};};`),
]

let lines = text => code.split(/\r|\n|\r\n/g)

let compile = code => lines(code).map(line => {
    let rule = rules.find(rule => rule.re.test(line))
    if (!rule) throw `Bad syntax: ${line}`
    return line.replace(rule.re, rule.cb)
}).join('')

let run = code => eval(compile(code))

let code = `
# Shapes.cross

type Rectangle(width, height)
type Square(size) = Rectangle(size, size)
let r = Rectangle(2, 4)
log(r.width + "x" + r.height)
let s = Square(4)
log(s.size)
`

log(compile(code))
run(code)
