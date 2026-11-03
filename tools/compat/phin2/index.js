'use strict';
// @jimp/core 0.16 calls phin 2's callback API, `phin(options, (err, res) => ...)`,
// only for Jimp.read(<http(s) url>). phin < 3.7.1 carries GHSA-x565-32qp-m3vf
// (headers kept on cross-origin redirects), and phin 3 dropped the callback form.
// This dependency-free facade serves both call styles with Node's built-in
// fetch (undici), which decompresses responses and drops credentials on
// cross-origin redirects. The response has phin's shape: statusCode, headers,
// body (Buffer). jimp only passes { url, compression, headers }.
//
// Dependency-free on purpose: Nx 23's pruned api lockfile (generatePackageJson)
// drops the dependency edges of a file: package whose lockfile snapshot carries a
// peer suffix (as it would with file-type 21 / phin 3 underneath), failing the build.
async function request(options) {
  const opts = typeof options === 'string' ? { url: options } : options || {};
  if (!opts.url) throw new Error('Missing url option from options for request method.');
  const res = await fetch(opts.url, {
    method: opts.method || 'GET',
    headers: opts.headers,
    body: opts.data,
    redirect: opts.followRedirects === false ? 'manual' : 'follow',
    signal: typeof opts.timeout === 'number' ? AbortSignal.timeout(opts.timeout) : undefined,
  });
  let body = Buffer.from(await res.arrayBuffer());
  if (opts.parse === 'json') body = JSON.parse(body.toString());
  else if (opts.parse === 'string') body = body.toString();
  return {
    statusCode: res.status,
    statusMessage: res.statusText,
    headers: Object.fromEntries(res.headers),
    body,
  };
}

function phin(options, callback) {
  const result = request(options);
  if (typeof callback === 'function') {
    result.then((res) => callback(null, res), (err) => callback(err, null));
    return undefined;
  }
  return result;
}
phin.promisified = (options) => request(options);
phin.unpromisified = (options, callback) => phin(options, callback);

module.exports = phin;
