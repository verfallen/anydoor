const promisify = require('util').promisify;
const fs = require('fs');
const Handlebars = require('handlebars');
const path = require('path');
const config = require('../config/defaultConfig');
const mime = require('./mime');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const tplPath = path.join(__dirname, '../template/dir.tpl');
const source = fs.readFileSync(tplPath, 'utf8');
const template = Handlebars.compile(source);

module.exports = async function(req, res, filePath) {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const contentType = mime(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
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
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`${filePath} is not a directory or file`);
  }
};
