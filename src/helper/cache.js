const { cache } = require('../config/defaultConfig');
function refreshRes(stats, res) {
  const { maxAge, expires, lastModified, cacheControl, eTag } = cache;

  if (expires) {
    res.setHeader(
      'Expires',
      new Date(Date.now() + maxAge * 1000).toUTCString()
    );
  }

  if(cacheControl){
    res.setHeader('Cache-Control',`public, max-age=${maxAge}`);
  }

  if(lastModified){
    res.setHeader('Last-Modified',stats.mtime.toUTCString());
  }

  if(eTag){
    console.info(stats.mtime.toUTCString());
    res.setHeader('ETag',`${stats.size}-${stats.mtime.getMilliseconds()}`);
  }
}

module.exports = function isFresh(stats,req,res){
  refreshRes(stats,res);

  const lastModified = req.headers['if-modified-since'];
  const eTag = req.headers['if-none-match'];

  //第一次请求
  if(!lastModified && !eTag){
    return false;
  }

  //缓存已过期
  if(lastModified && lastModified !== res.getHeader('Last-Modified')){
    return false;
  }
  if(eTag && eTag!== res.getHeader('ETag')){
    return false;
  }

  return true;
};
