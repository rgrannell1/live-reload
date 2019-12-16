
import * as fs from 'fs'

const fsp = {}

fsp.readFile = fpath => {
  return new Promise((resolve, reject) => {
    fs.readFile(fpath, (err, content) => {
      err ? reject(err) : resolve(content)
    })
  })
}

fsp.stat = fpath => {
  return new Promise((resolve, reject) => {
    fs.stat(fpath, (err, stats) => {
      err ? reject(err) : resolve(stats)
    })
  })
}

export default fsp
