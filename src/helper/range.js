module.exports = (totoalSize, req, res) => {
  const range = req.headers['range'];
  if (!range) {
    return { code: 200 };
  }

  const sizes = range.match(/bytes=(\d*)-(\d*)/);
  const end = sizes[2] || totoalSize - 1;
  const start = sizes[1] || totoalSize - end;

  if (start > end || start < 0 || end > totoalSize) {
    return { code: 200 };
  }
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Range', `bytes ${start} -${end}/${totoalSize}`);
  res.setHeader('Content-Length', end - start);

  return { code: 206, start: parseInt(start), end: parseInt(end) };
};
