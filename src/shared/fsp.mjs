
import * as fs from 'fs'

const fsp = {}

/**
 * Read a file
 *
 * @param {string} fpath the target file path
 *
 * @returns {Promise<buffer>} file content
 */
fsp.readFile = fpath => {
  return new Promise((resolve, reject) => {
    fs.readFile(fpath, (err, content) => {
      err ? reject(err) : resolve(content)
    })
  })
}

/**
 * Get file information for a file
 *
 * @param {string} fpath the target file path
 *
 * @returns {Promise<object>} file information
 */
fsp.stat = fpath => {
  return new Promise((resolve, reject) => {
    fs.stat(fpath, (err, stats) => {
      err ? reject(err) : resolve(stats)
    })
  })
}

export default fsp
