
const path = require('path')

module.exports = {
  codes: {
    LR_001: 'LR_001',
    LR_002: 'LR_002',
    LR_003: 'LR_003',
    LR_004: 'LR_004',
    LR_005: 'LR_005',
    LR_006: 'LR_006',
    LR_007: 'LR_007',
    LR_008: 'LR_008',
  },
  sitePaths: [
    'public/index.htm',
    'public/index.html',
    'public/html/index.htm',
    'public/html/index.html',
    'client/index.htm',
    'client/index.html',
    'client/html/index.htm',
    'client/html/index.html'
  ],
  paths: {
    liveReload: path.join(__dirname, '../../static/live-reload.js')
  },
  ports: {
    wss: 4001,
    http: 4000
  },
  tags: {
    refresh: 'refresh'
  },
  events: {
    connection: 'connection',
    message: 'message'
  }
}
