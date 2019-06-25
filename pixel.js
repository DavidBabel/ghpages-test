(function() {
  'use strict';

  /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

  var __assign = function() {
    __assign =
      Object.assign ||
      function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };

  var CONFIG = {
    DEFAULT_SCROLL_VALUE: 50,
    MS_POST_CLICK_URL: 'http://localhost:9876'
  };

  function objectToQueryString(track) {
    var qs = Object.keys(track)
      .map(function(key) {
        return track[key] ? key + '=' + track[key] : '';
      })
      .filter(function(x) {
        return x;
      })
      .join('&');
    return qs ? '?' + qs : '';
  }
  function extractQueryStringParameters(url) {
    var _a = url.split('?'),
      rawParams = _a[1];
    return rawParams
      ? rawParams.split('&').reduce(function(stack, next) {
          var _a = next.split('='),
            key = _a[0],
            value = _a[1];
          try {
            stack[key] = JSON.parse(value);
          } catch (e) {
            stack[key] = value;
          }
          return stack;
        }, {})
      : {};
  }
  function trimLastSlash(s) {
    var pos = s.length - 1;
    return s.charAt(pos) === '/' ? s.slice(0, pos) : s;
  }
  function trimFirstSlash(s) {
    return s.charAt(0) === '/' ? s.slice(1, s.length) : s;
  }
  function trimSlashes(s) {
    return trimLastSlash(trimFirstSlash(s));
  }
  function simpleJoin() {
    var parts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      parts[_i] = arguments[_i];
    }
    return parts
      .map(trimSlashes)
      .filter(function(x) {
        return x;
      })
      .join('/')
      .replace('/?', '?');
  }

  var cachedParams;
  function getCurrentUrl() {
    /* istanbul ignore next */
    return window.location.href || document.URL || '';
  }
  function getCurrentParameters() {
    if (!cachedParams) {
      var scriptTag = document.querySelector(
        'script[src^="' + CONFIG.MS_POST_CLICK_URL + '"]'
      );
      var params = {};
      if (scriptTag) {
        params = extractQueryStringParameters(scriptTag.src);
      }
      cachedParams = __assign(
        { currentUrl: getCurrentUrl(), scrollTo: CONFIG.DEFAULT_SCROLL_VALUE },
        params
      );
    }
    return cachedParams;
  }

  var ping = function(url, retryLeft) {
    if (retryLeft === void 0) {
      retryLeft = 3;
    }
    if (retryLeft > 0) {
      var img = new Image();
      img.onerror = function() {
        return setTimeout(function() {
          return ping(url, retryLeft - 1);
        }, 100);
      };
      img.src = url;
    }
  };
  function sendTrack(event, context) {
    if (context === void 0) {
      context = {};
    }
    var params = getCurrentParameters();
    var track = __assign(
      { e: event, site: params.site, t: new Date().getTime() },
      context,
      { full_url: context.full_url || params.currentUrl }
    );
    ping(
      simpleJoin(CONFIG.MS_POST_CLICK_URL, 'pixel', objectToQueryString(track))
    );
  }

  function listenClicks() {
    document.addEventListener('click', clickListener);
  }
  function getNodeName(nodeName) {
    return nodeName ? nodeName.toLowerCase() : '';
  }
  function getId(id) {
    return id ? '#' + id : '';
  }
  function getClasses(classes) {
    return classes ? '.' + classes.replace(/ /g, '.') : '';
  }
  function clickListener(event) {
    var target = (event && event.target) || {};
    var id =
      getNodeName(target.nodeName) +
        getId(target.id) +
        getClasses(target.className) || 'unknown';
    sendTrack('click', { id: id });
  }

  function listenScrolls() {
    window.addEventListener('scroll', scrollListener);
  }
  function getCurrentScrollLevel() {
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }
  var scrollSended = false;
  function scrollListener() {
    var params = getCurrentParameters();
    if (!scrollSended && getCurrentScrollLevel() >= params.scrollTo) {
      scrollSended = true;
      sendTrack('scroll');
    }
  }

  sendTrack('pv');
  listenScrolls();
  listenClicks();
})();
//# sourceMappingURL=pixel.js.map
