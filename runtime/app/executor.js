'use strict'

var fork = require('child_process').fork;
var ExtApp = require('./extappServer.js');
var logger = require('logger')('executor');
var lightApp = require('./lightAppProxy.js');

// 应用执行器
function Executor(profile, prefix) {
  this.type = 'light';
  this.daemon = false;
  this.exec = null;
  this.errmsg = null;
  this.valid = true;
  this.connector = null;
  this.profile = profile;

  if (profile.metadata.native === true) {
    this.type = 'native';
    this.exec = prefix + '/' + (profile.main || 'index.js');
  } else if (profile.metadata.extapp === true) {
    if (profile.metadata.daemon === true) {
      this.daemon = true;
    }
    this.type = 'extapp';
    this.exec = prefix;
  } else {
    this.exec = prefix + '/app.js';
    this.connector = lightApp(this.exec);
  }
}
// 创建实例。runtime是Appruntime实例
Executor.prototype.create = function (appid, runtime) {
  if (!this.valid) {
    logger.log(`app ${appid} invalid`);
    return false;
  }
  var app = null;
  if (this.type === 'light') {
    // 创建实例
    app = this.connector(appid, runtime);
    return Promise.resolve(app);
  } else if (this.type === 'extapp') {
    // create extapp's sender
    app = new ExtApp(appid, this.profile.metadata.dbusConn, runtime);
    // run real extapp
    logger.log(`fork extapp ${this.exec}`);
    var handle = fork('/usr/lib/yoda/runtime/app/extappProxy.js', [this.exec], {
      env: {
        NODE_PATH: '/usr/lib'
      }
    });
    logger.log('fork complete');
    handle.on('exit', () => {
      logger.log(appid + ' exit');
    });
    handle.on('error', () => {
      logger.log(appid + ' error');
    });
    return new Promise((resolve, reject) => {
      // a message will received after extapp is startup
      handle.on('message', (message, sender) => {
        if (message.ready === true) {
          resolve(app);
        } else {
          reject(new Error('an error occurred when starting the extapp'));
        }
      });
    });
  }
}
module.exports = Executor;
