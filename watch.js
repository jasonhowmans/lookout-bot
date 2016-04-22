'use strict';

/**!
 * A tool for checking when a webpage changes. Useful for watching for updates,
 * ticket availability, and stuff I haven't thought of yet.
 *
 * @author Jason Howmans (@jhwmns), made on a train in April 2016
 * @copyright APACHE LICENSE, VERSION 2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 * @todo Make better outputs (SMS, Email etc)
 *
 * Instructions:
 *  Simply give it a URL and leave it to run. It will speak when it's done.
 *  example:
 *    `$ node watch 'http://www.google.com'`
 */

 const q = require('q');
 const md5 = require('md5');
 const request = require('request');

(function () {
  let masterHash = null;

  run();

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

  function run() {
    let url = process.argv[2]; // The first given argument when calling
    createMasterHash(url)
      .then(() => {
        console.log('Master hash created: %s', masterHash);
        checkUrlEvery(url, 8)
      });
  }

  /**!
   * Load the requested url
   * @param {String} url -- The URL to request
   * @returns {String} -- The source from the requested webpage
   */
  function loadUrl(url) {
    let httpOptions = {
      method: 'get',
      url: url,
    };

    return q.promise(promiseHandler, handleRejection);

    function promiseHandler(resolve, reject) {
      request(httpOptions, (err, response, body) => {
        if (response.statusCode > 199 && response.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error('💩 Request fucked up'));
        }
      });
    }

  }


  /**!
  * Hash the webpage
  * @param {String} str -- The string to be hashed
  * @returns {String} -- A md5 of the webpage
  */
  function hashWebpage(str) {
    console.log(md5(str));
    return md5(str);
  }


  /**!
   * Compare the original and most recent hash
   * @returns {Bool} -- Is different?
   */
  function hasChanged(hash) {

  }

  /**!
   * Check the url every n seconds
   * @param {String} url
   * @param {Number} interval -- the interval to use when re-checking the page
   */
  function checkUrlEvery(url, interval) {
    let seconds = parseInt(interval) * 1000;
    let theInterval = setInterval(hasItChanged, seconds)

    function hasItChanged() {
      loadUrl(url)
        .then(hashWebpage)
    }
  }

  /**!
   * Create the master hash
   * @param {String} url
   */
  function createMasterHash(url) {
    return loadUrl(url)
      .then(hashWebpage)
      .then(globaliseMasterHash);

    function globaliseMasterHash(hash) {
      masterHash = hash;
      return q.when(masterHash, hash);
    }
  }

  function handleRejection(err) {
    return err;
  }
}.call(this));
