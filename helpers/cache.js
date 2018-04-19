
const nodeCache = require('node-cache');

const staticKeyValue = {};

module.exports = function (logger) {
    // init cache
    var cache = null;

    this.initCache = function(dataLoaders) {
      logger.info('cache', 'initCache', 'Enter.');
      cache = new nodeCache({ stdTTL: 10, checkperiod: 10 });

      cache.on('expired', function(key, value){
          logger.verbose('cache', 'initCache(expired)', 'Key[' + key + '].');
          var loadAt = dataLoaders.filter(function(d) { return d.name == key });
          if(loadAt != undefined && loadAt.length > 0){
              loadAt[0].loaderFunc();
          }
      });
      logger.info('cache', 'initCache', 'Exit.');
    }

    this.set = function(key, value) {
        //cache set
        cache.set(key, value, function(err, success){
            if(!err || success){
                staticKeyValue[key] = value;
            }
            else{
                logger.error('cache', 'set', 'Saving of key[' + key + '] to cache failed.', { exception: err.stack });
            }
        });
    }

    this.setWithTTL = function(key, value, ttl) {
        //cache set
        cache.set(key, value, ttl, function(err, success){
            if(!err || success){
                staticKeyValue[key] = value;
            }
            else{
                logger.error('cache', 'set', 'Saving of key[' + key + '] to cache failed.', { exception: err.stack });
            }
        });
    }

    this.get = function(key){
        var value = cache.get(key);
        if(value == undefined){
            value = staticKeyValue[key];
        }
        return value;
    }
}