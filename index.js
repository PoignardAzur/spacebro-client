'use strict'

const mdns = require('./lib/mdns.js')
const io = require('socket.io-client')
const _ = require('lodash')
let socket

function registerToMaster (actionList, clientName, zeroconfName) {
  mdns.connectToService(zeroconfName || 'spacebro', function socketioInit (err, address, port) {
    console.log('service found: ', address)
    socket = io('http://' + address + ':' + port)
      .on('connect', function () {
        console.log('socketio connected to ' + 'http://' + address + ':' + port)
        var nameList = _.map(actionList, function (el) {
          return el.name
        })
        socket.emit('register', { eventsList: nameList, clientName: clientName || 'pid-' + process.pid })
      })
    for (let action of actionList) {
      console.log(action.name)
      socket.on(action.name, function (data) {
        if (action.trigger) {
          action.trigger(data)
        }
      })
    }
  })
}

module.exports = {
  registerToMaster: registerToMaster,
  emit: function (event, data) {
    if (socket) {
      socket.emit(event, data)
    }
  }
}
