const promisify = require('util').promisify;
const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const tplPath = path.join(__dirname, '../template/dir.tpl');
const source = fs.readFileSync(tplPath, 'utf8');
const template = Handlebars.compile(source);

/**
 * 读取当前文件路径信息信息
 * 1.如果当前文件路径指向一个文件，设置response
 *   查看缓存是否过期吗，如果过期，重新请求，未过期则直接返回
 *   查看是否完整请求，如果是，读取文件全部内容，如果请求部分字节，则读取部分字节内容
 *   压缩内容，并将readStream 写入响应中
 * 2.当前文件路径指向一个文件夹
 *   读取文件夹中文件，设置响应头，返回内容类型为html
 *   生成板数据，渲染模板并设置响应内容
 */
module.exports = async function(req, res, filePath,config) {
  try {
    const stats = await stat(filePath);

    if (stats.isFile()) {
      const contentType = mime(filePath);
      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return;
      }

      res.setHeader('Content-Type', contentType);

      let rs;

      const { code, start, end } = range(stats.size, req, res);
      if (code === 200) {
        res.statusCode = 200;
        rs = fs.createReadStream(filePath);
      } else {
        res.statusCode = 206;
        rs = fs.createReadStream(filePath, { start, end });
      }

      //压缩文件
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res);
      }
      //将readStream 写入 response
      rs.pipe(res);
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      const dir = path.relative(config.root, filePath);

      const data = {
        files: files.map(file => ({
          file,
          icon: mime(file)
        })),
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : ''
      };
      res.end(template(data));
    }
  } catch (error) {
    console.error(error);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`${filePath} is not a directory or file!!!`);
  }
};
