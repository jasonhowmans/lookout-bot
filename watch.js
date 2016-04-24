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
 *  Simply give it a URL and a update interval, then sit back and wait...
 *  example:
 *    `$ node watch 'http://www.google.com' 100`
 */

 const q = require('q');
 const md5 = require('md5');
 const say = require('say');
 const request = require('request');

(function () {
  const secondsToWait = 10;
  let masterHash = null;
  let checkInterval;

  run();

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

  function run() {
    let url = process.argv[2]; // The first given argument when calling
    createMasterHash(url)
      .then(() => {
        console.log('Master hash created: %s', masterHash);
        checkTillChanged(url, secondsToWait)
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
    return md5(str);
  }


  /**!
   * Compare the original and most recent hash
   * @returns {Bool} -- Is different?
   */
  function hasChanged(hash) {
    return hash !== masterHash;
  }


  function pushChangeNotification() {
    console.log('⚡️ Content at URL has changed ⚡️');
    say.speak(`Oh shit, hurry, the page content has changed`);
  }

  /**!
   * Check the url every n seconds, and exits when the content changes
   * @param {String} url
   * @param {Number} interval -- the interval to use when re-checking the page
   */
  function checkTillChanged(url, interval) {
    let seconds = parseInt(interval) * 1000;
    checkInterval = setInterval(checkUrl, seconds)

    function checkUrl() {
      loadUrl(url)
        .then(hashWebpage)
        .then(hasChanged)
        .then((goneChanged) => {
          if (goneChanged && checkInterval) {
            clearInterval(checkInterval);
            pushChangeNotification();
          }
        });
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
