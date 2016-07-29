var WS = require('pull-ws')
var URL = require('url')

module.exports = function (opts) {
  opts = opts || {}
  opts.binaryType = (opts.binaryType || 'arraybuffer')
  var secure = opts.server && !!opts.server.key
  return {
    name: 'ws',
    server: function (onConnect) {
      var server = WS.createServer(opts, function (stream) {
        onConnect(stream)
      })

      if(!opts.server) server.listen(opts.port)
      return server.close.bind(server)
    },
    client: function (addr, cb) {
      if(!addr.host) {
        addr.hostname = addr.hostname || opts.host || 'localhost'
        addr.slashes = true
        addr = URL.format(addr)
      }
      if('string' !== typeof addr)
        addr = URL.format(addr)

      var stream = WS.connect(addr, {
        binaryType: opts.binaryType,
        onConnect: function (err) {
          cb(err, stream)
        }
      })
    },
    stringify: function () {
      var port
      if(opts.server)
        port = opts.server.address().port
      else
        port = opts.port

      return URL.format({
        protocol: secure ? 'wss' : 'ws',
        slashes: true,
        hostname: opts.host || 'localhost', //detect ip address
        port: (secure ? port == 443 : port == 80) ? undefined : port
      })
    },
    parse: function (str) {
      var addr = URL.parse(str)
      if(!/^wss?\:$/.test(addr.protocol)) return null
      return addr
    }
  }
}



