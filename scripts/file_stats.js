const fs = require('fs')
const path = require('path')

const root = process.cwd()
const excludeDirs = new Set(['node_modules', '.next', '.git', 'dist', 'out', 'build', 'coverage', 'public'])
const exts = new Set(['.tsx', '.ts', '.jsx', '.js'])

function walk(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (excludeDirs.has(e.name)) continue
      walk(full, files)
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase()
      if (exts.has(ext)) files.push(full)
    }
  }
}

function statFile(file) {
  const content = fs.readFileSync(file, 'utf8')
  const size = Buffer.byteLength(content, 'utf8')
  const lines = content.split('\n').length
  return { file: path.relative(root, file), size, lines }
}

function human(n) {
  if (n < 1024) return n + ' B'
  if (n < 1024*1024) return (n/1024).toFixed(1) + ' KB'
  return (n/(1024*1024)).toFixed(2) + ' MB'
}

const files = []
walk(root, files)
const stats = files.map(statFile)

stats.sort((a,b) => b.size - a.size)

const topBySize = stats.slice(0, 50)
const topByLines = stats.slice().sort((a,b) => b.lines - a.lines).slice(0,50)

const out = { topBySize, topByLines, totalFiles: stats.length }

console.log(JSON.stringify(out, null, 2))
