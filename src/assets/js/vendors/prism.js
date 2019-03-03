/* PrismJS 1.15.0
https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript+markup-templating+php+scss+twig&plugins=normalize-whitespace */
var _self =
  typeof window !== "undefined"
    ? window // if in browser
    : typeof WorkerGlobalScope !== "undefined" &&
      self instanceof WorkerGlobalScope
    ? self // if in worker
    : {}; // if in node js

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function() {
  // Private helper vars
  var lang = /\blang(?:uage)?-([\w-]+)\b/i;
  var uniqueId = 0;

  var _ = (_self.Prism = {
    manual: _self.Prism && _self.Prism.manual,
    disableWorkerMessageHandler:
      _self.Prism && _self.Prism.disableWorkerMessageHandler,
    util: {
      encode: function(tokens) {
        if (tokens instanceof Token) {
          return new Token(
            tokens.type,
            _.util.encode(tokens.content),
            tokens.alias
          );
        } else if (_.util.type(tokens) === "Array") {
          return tokens.map(_.util.encode);
        } else {
          return tokens
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\u00a0/g, " ");
        }
      },

      type: function(o) {
        return Object.prototype.toString.call(o).slice(8, -1);
      },

      objId: function(obj) {
        if (!obj["__id"]) {
          Object.defineProperty(obj, "__id", { value: ++uniqueId });
        }
        return obj["__id"];
      },

      // Deep clone a language definition (e.g. to extend it)
      clone: function(o, visited) {
        var type = _.util.type(o);
        visited = visited || {};

        switch (type) {
          case "Object":
            if (visited[_.util.objId(o)]) {
              return visited[_.util.objId(o)];
            }
            var clone = {};
            visited[_.util.objId(o)] = clone;

            for (var key in o) {
              if (o.hasOwnProperty(key)) {
                clone[key] = _.util.clone(o[key], visited);
              }
            }

            return clone;

          case "Array":
            if (visited[_.util.objId(o)]) {
              return visited[_.util.objId(o)];
            }
            var clone = [];
            visited[_.util.objId(o)] = clone;

            o.forEach(function(v, i) {
              clone[i] = _.util.clone(v, visited);
            });

            return clone;
        }

        return o;
      }
    },

    languages: {
      extend: function(id, redef) {
        var lang = _.util.clone(_.languages[id]);

        for (var key in redef) {
          lang[key] = redef[key];
        }

        return lang;
      },

      /**
       * Insert a token before another token in a language literal
       * As this needs to recreate the object (we cannot actually insert before keys in object literals),
       * we cannot just provide an object, we need an object and a key.
       * @param inside The key (or language id) of the parent
       * @param before The key to insert before.
       * @param insert Object with the key/value pairs to insert
       * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
       */
      insertBefore: function(inside, before, insert, root) {
        root = root || _.languages;
        var grammar = root[inside];
        var ret = {};

        for (var token in grammar) {
          if (grammar.hasOwnProperty(token)) {
            if (token == before) {
              for (var newToken in insert) {
                if (insert.hasOwnProperty(newToken)) {
                  ret[newToken] = insert[newToken];
                }
              }
            }

            // Do not insert token which also occur in insert. See #1525
            if (!insert.hasOwnProperty(token)) {
              ret[token] = grammar[token];
            }
          }
        }

        var old = root[inside];
        root[inside] = ret;

        // Update references in other language definitions
        _.languages.DFS(_.languages, function(key, value) {
          if (value === old && key != inside) {
            this[key] = ret;
          }
        });

        return ret;
      },

      // Traverse a language definition with Depth First Search
      DFS: function(o, callback, type, visited) {
        visited = visited || {};
        for (var i in o) {
          if (o.hasOwnProperty(i)) {
            callback.call(o, i, o[i], type || i);

            if (
              _.util.type(o[i]) === "Object" &&
              !visited[_.util.objId(o[i])]
            ) {
              visited[_.util.objId(o[i])] = true;
              _.languages.DFS(o[i], callback, null, visited);
            } else if (
              _.util.type(o[i]) === "Array" &&
              !visited[_.util.objId(o[i])]
            ) {
              visited[_.util.objId(o[i])] = true;
              _.languages.DFS(o[i], callback, i, visited);
            }
          }
        }
      }
    },
    plugins: {},

    highlightAll: function(async, callback) {
      _.highlightAllUnder(document, async, callback);
    },

    highlightAllUnder: function(container, async, callback) {
      var env = {
        callback: callback,
        selector:
          "code[class*=\"language-\"], [class*=\"language-\"] code, code[class*=\"lang-\"], [class*=\"lang-\"] code"
      };

      _.hooks.run("before-highlightall", env);

      var elements = env.elements || container.querySelectorAll(env.selector);

      for (var i = 0, element; (element = elements[i++]); ) {
        _.highlightElement(element, async === true, env.callback);
      }
    },

    highlightElement: function(element, async, callback) {
      // Find language
      var language,
        grammar,
        parent = element;

      while (parent && !lang.test(parent.className)) {
        parent = parent.parentNode;
      }

      if (parent) {
        language = (parent.className.match(lang) || [, ""])[1].toLowerCase();
        grammar = _.languages[language];
      }

      // Set language on the element, if not present
      element.className =
        element.className.replace(lang, "").replace(/\s+/g, " ") +
        " language-" +
        language;

      if (element.parentNode) {
        // Set language on the parent, for styling
        parent = element.parentNode;

        if (/pre/i.test(parent.nodeName)) {
          parent.className =
            parent.className.replace(lang, "").replace(/\s+/g, " ") +
            " language-" +
            language;
        }
      }

      var code = element.textContent;

      var env = {
        element: element,
        language: language,
        grammar: grammar,
        code: code
      };

      var insertHighlightedCode = function(highlightedCode) {
        env.highlightedCode = highlightedCode;

        _.hooks.run("before-insert", env);

        env.element.innerHTML = env.highlightedCode;

        _.hooks.run("after-highlight", env);
        _.hooks.run("complete", env);
        callback && callback.call(env.element);
      };

      _.hooks.run("before-sanity-check", env);

      if (!env.code) {
        _.hooks.run("complete", env);
        return;
      }

      _.hooks.run("before-highlight", env);

      if (!env.grammar) {
        insertHighlightedCode(_.util.encode(env.code));
        return;
      }

      if (async && _self.Worker) {
        var worker = new Worker(_.filename);

        worker.onmessage = function(evt) {
          insertHighlightedCode(evt.data);
        };

        worker.postMessage(
          JSON.stringify({
            language: env.language,
            code: env.code,
            immediateClose: true
          })
        );
      } else {
        insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
      }
    },

    highlight: function(text, grammar, language) {
      var env = {
        code: text,
        grammar: grammar,
        language: language
      };
      _.hooks.run("before-tokenize", env);
      env.tokens = _.tokenize(env.code, env.grammar);
      _.hooks.run("after-tokenize", env);
      return Token.stringify(_.util.encode(env.tokens), env.language);
    },

    matchGrammar: function(
      text,
      strarr,
      grammar,
      index,
      startPos,
      oneshot,
      target
    ) {
      var Token = _.Token;

      for (var token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
          continue;
        }

        if (token == target) {
          return;
        }

        var patterns = grammar[token];
        patterns = _.util.type(patterns) === "Array" ? patterns : [patterns];

        for (var j = 0; j < patterns.length; ++j) {
          var pattern = patterns[j],
            inside = pattern.inside,
            lookbehind = !!pattern.lookbehind,
            greedy = !!pattern.greedy,
            lookbehindLength = 0,
            alias = pattern.alias;

          if (greedy && !pattern.pattern.global) {
            // Without the global flag, lastIndex won't work
            var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
            pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
          }

          pattern = pattern.pattern || pattern;

          // Don’t cache length as it changes during the loop
          for (
            var i = index, pos = startPos;
            i < strarr.length;
            pos += strarr[i].length, ++i
          ) {
            var str = strarr[i];

            if (strarr.length > text.length) {
              // Something went terribly wrong, ABORT, ABORT!
              return;
            }

            if (str instanceof Token) {
              continue;
            }

            if (greedy && i != strarr.length - 1) {
              pattern.lastIndex = pos;
              var match = pattern.exec(text);
              if (!match) {
                break;
              }

              var from = match.index + (lookbehind ? match[1].length : 0),
                to = match.index + match[0].length,
                k = i,
                p = pos;

              for (
                var len = strarr.length;
                k < len &&
                (p < to || (!strarr[k].type && !strarr[k - 1].greedy));
                ++k
              ) {
                p += strarr[k].length;
                // Move the index i to the element in strarr that is closest to from
                if (from >= p) {
                  ++i;
                  pos = p;
                }
              }

              // If strarr[i] is a Token, then the match starts inside another Token, which is invalid
              if (strarr[i] instanceof Token) {
                continue;
              }

              // Number of tokens to delete and replace with the new match
              delNum = k - i;
              str = text.slice(pos, p);
              match.index -= pos;
            } else {
              pattern.lastIndex = 0;

              var match = pattern.exec(str),
                delNum = 1;
            }

            if (!match) {
              if (oneshot) {
                break;
              }

              continue;
            }

            if (lookbehind) {
              lookbehindLength = match[1] ? match[1].length : 0;
            }

            var from = match.index + lookbehindLength,
              match = match[0].slice(lookbehindLength),
              to = from + match.length,
              before = str.slice(0, from),
              after = str.slice(to);

            var args = [i, delNum];

            if (before) {
              ++i;
              pos += before.length;
              args.push(before);
            }

            var wrapped = new Token(
              token,
              inside ? _.tokenize(match, inside) : match,
              alias,
              match,
              greedy
            );

            args.push(wrapped);

            if (after) {
              args.push(after);
            }

            Array.prototype.splice.apply(strarr, args);

            if (delNum != 1)
              _.matchGrammar(text, strarr, grammar, i, pos, true, token);

            if (oneshot) break;
          }
        }
      }
    },

    tokenize: function(text, grammar) {
      var strarr = [text];

      var rest = grammar.rest;

      if (rest) {
        for (var token in rest) {
          grammar[token] = rest[token];
        }

        delete grammar.rest;
      }

      _.matchGrammar(text, strarr, grammar, 0, 0, false);

      return strarr;
    },

    hooks: {
      all: {},

      add: function(name, callback) {
        var hooks = _.hooks.all;

        hooks[name] = hooks[name] || [];

        hooks[name].push(callback);
      },

      run: function(name, env) {
        var callbacks = _.hooks.all[name];

        if (!callbacks || !callbacks.length) {
          return;
        }

        for (var i = 0, callback; (callback = callbacks[i++]); ) {
          callback(env);
        }
      }
    }
  });

  var Token = (_.Token = function(type, content, alias, matchedStr, greedy) {
    this.type = type;
    this.content = content;
    this.alias = alias;
    // Copy of the full string this token was created from
    this.length = (matchedStr || "").length | 0;
    this.greedy = !!greedy;
  });

  Token.stringify = function(o, language, parent) {
    if (typeof o == "string") {
      return o;
    }

    if (_.util.type(o) === "Array") {
      return o
        .map(function(element) {
          return Token.stringify(element, language, o);
        })
        .join("");
    }

    var env = {
      type: o.type,
      content: Token.stringify(o.content, language, parent),
      tag: "span",
      classes: ["token", o.type],
      attributes: {},
      language: language,
      parent: parent
    };

    if (o.alias) {
      var aliases = _.util.type(o.alias) === "Array" ? o.alias : [o.alias];
      Array.prototype.push.apply(env.classes, aliases);
    }

    _.hooks.run("wrap", env);

    var attributes = Object.keys(env.attributes)
      .map(function(name) {
        return (
          name +
          "=\"" +
          (env.attributes[name] || "").replace(/"/g, "&quot;") +
          "\""
        );
      })
      .join(" ");

    return (
      "<" +
      env.tag +
      " class=\"" +
      env.classes.join(" ") +
      "\"" +
      (attributes ? " " + attributes : "") +
      ">" +
      env.content +
      "</" +
      env.tag +
      ">"
    );
  };

  if (!_self.document) {
    if (!_self.addEventListener) {
      // in Node.js
      return _self.Prism;
    }

    if (!_.disableWorkerMessageHandler) {
      // In worker
      _self.addEventListener(
        "message",
        function(evt) {
          var message = JSON.parse(evt.data),
            lang = message.language,
            code = message.code,
            immediateClose = message.immediateClose;

          _self.postMessage(_.highlight(code, _.languages[lang], lang));
          if (immediateClose) {
            _self.close();
          }
        },
        false
      );
    }

    return _self.Prism;
  }

  //Get current script and highlight
  var script =
    document.currentScript ||
    [].slice.call(document.getElementsByTagName("script")).pop();

  if (script) {
    _.filename = script.src;

    if (!_.manual && !script.hasAttribute("data-manual")) {
      if (document.readyState !== "loading") {
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(_.highlightAll);
        } else {
          window.setTimeout(_.highlightAll, 16);
        }
      } else {
        document.addEventListener("DOMContentLoaded", _.highlightAll);
      }
    }
  }

  return _self.Prism;
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== "undefined") {
  global.Prism = Prism;
}
Prism.languages.markup = {
  comment: /<!--[\s\S]*?-->/,
  prolog: /<\?[\s\S]+?\?>/,
  doctype: /<!DOCTYPE[\s\S]+?>/i,
  cdata: /<!\[CDATA\[[\s\S]*?]]>/i,
  tag: {
    pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
    greedy: true,
    inside: {
      tag: {
        pattern: /^<\/?[^\s>\/]+/i,
        inside: {
          punctuation: /^<\/?/,
          namespace: /^[^\s>\/:]+:/
        }
      },
      "attr-value": {
        pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
        inside: {
          punctuation: [
            /^=/,
            {
              pattern: /(^|[^\\])["']/,
              lookbehind: true
            }
          ]
        }
      },
      punctuation: /\/?>/,
      "attr-name": {
        pattern: /[^\s>\/]+/,
        inside: {
          namespace: /^[^\s>\/:]+:/
        }
      }
    }
  },
  entity: /&#?[\da-z]{1,8};/i
};

Prism.languages.markup["tag"].inside["attr-value"].inside["entity"] =
  Prism.languages.markup["entity"];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add("wrap", function(env) {
  if (env.type === "entity") {
    env.attributes["title"] = env.content.replace(/&amp;/, "&");
  }
});

Prism.languages.xml = Prism.languages.extend("markup", {});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.css = {
  comment: /\/\*[\s\S]*?\*\//,
  atrule: {
    pattern: /@[\w-]+?[\s\S]*?(?:;|(?=\s*\{))/i,
    inside: {
      rule: /@[\w-]+/
      // See rest below
    }
  },
  url: /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
  selector: /[^{}\s][^{};]*?(?=\s*\{)/,
  string: {
    pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  property: /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
  important: /!important\b/i,
  function: /[-a-z0-9]+(?=\()/i,
  punctuation: /[(){};:,]/
};

Prism.languages.css["atrule"].inside.rest = Prism.languages.css;

if (Prism.languages.markup) {
  Prism.languages.insertBefore("markup", "tag", {
    style: {
      pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
      lookbehind: true,
      inside: Prism.languages.css,
      alias: "language-css",
      greedy: true
    }
  });

  Prism.languages.insertBefore(
    "inside",
    "attr-value",
    {
      "style-attr": {
        pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
        inside: {
          "attr-name": {
            pattern: /^\s*style/i,
            inside: Prism.languages.markup.tag.inside
          },
          punctuation: /^\s*=\s*['"]|['"]\s*$/,
          "attr-value": {
            pattern: /.+/i,
            inside: Prism.languages.css
          }
        },
        alias: "language-css"
      }
    },
    Prism.languages.markup.tag
  );
}
Prism.languages.clike = {
  comment: [
    {
      pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
      lookbehind: true
    },
    {
      pattern: /(^|[^\\:])\/\/.*/,
      lookbehind: true,
      greedy: true
    }
  ],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  "class-name": {
    pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
    lookbehind: true,
    inside: {
      punctuation: /[.\\]/
    }
  },
  keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
  boolean: /\b(?:true|false)\b/,
  function: /\w+(?=\()/,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
  punctuation: /[{}[\];(),.:]/
};

Prism.languages.javascript = Prism.languages.extend("clike", {
  "class-name": [
    Prism.languages.clike["class-name"],
    {
      pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
      lookbehind: true
    }
  ],
  keyword: [
    {
      pattern: /((?:^|})\s*)(?:catch|finally)\b/,
      lookbehind: true
    },
    /\b(?:as|async|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/
  ],
  number: /\b(?:(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+)n?|\d+n|NaN|Infinity)\b|(?:\b\d+\.?\d*|\B\.\d+)(?:[Ee][+-]?\d+)?/,
  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  function: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\(|\.(?:apply|bind|call)\()/,
  operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
});

Prism.languages.javascript[
  "class-name"
][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore("javascript", "keyword", {
  regex: {
    pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})\]]))/,
    lookbehind: true,
    greedy: true
  },
  // This must be declared before keyword because we use "function" inside the look-forward
  "function-variable": {
    pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/i,
    alias: "function"
  },
  parameter: [
    {
      pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
      lookbehind: true,
      inside: Prism.languages.javascript
    },
    {
      pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
      inside: Prism.languages.javascript
    },
    {
      pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
      lookbehind: true,
      inside: Prism.languages.javascript
    },
    {
      pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
      lookbehind: true,
      inside: Prism.languages.javascript
    }
  ],
  constant: /\b[A-Z][A-Z\d_]*\b/
});

Prism.languages.insertBefore("javascript", "string", {
  "template-string": {
    pattern: /`(?:\\[\s\S]|\${[^}]+}|[^\\`])*`/,
    greedy: true,
    inside: {
      interpolation: {
        pattern: /\${[^}]+}/,
        inside: {
          "interpolation-punctuation": {
            pattern: /^\${|}$/,
            alias: "punctuation"
          },
          rest: Prism.languages.javascript
        }
      },
      string: /[\s\S]+/
    }
  }
});

if (Prism.languages.markup) {
  Prism.languages.insertBefore("markup", "tag", {
    script: {
      pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
      lookbehind: true,
      inside: Prism.languages.javascript,
      alias: "language-javascript",
      greedy: true
    }
  });
}

Prism.languages.js = Prism.languages.javascript;

Prism.languages["markup-templating"] = {};

Object.defineProperties(Prism.languages["markup-templating"], {
  buildPlaceholders: {
    // Tokenize all inline templating expressions matching placeholderPattern
    // If the replaceFilter function is provided, it will be called with every match.
    // If it returns false, the match will not be replaced.
    value: function(env, language, placeholderPattern, replaceFilter) {
      if (env.language !== language) {
        return;
      }

      env.tokenStack = [];

      env.code = env.code.replace(placeholderPattern, function(match) {
        if (typeof replaceFilter === "function" && !replaceFilter(match)) {
          return match;
        }
        var i = env.tokenStack.length;
        // Check for existing strings
        while (
          env.code.indexOf("___" + language.toUpperCase() + i + "___") !== -1
        )
          ++i;

        // Create a sparse array
        env.tokenStack[i] = match;

        return "___" + language.toUpperCase() + i + "___";
      });

      // Switch the grammar to markup
      env.grammar = Prism.languages.markup;
    }
  },
  tokenizePlaceholders: {
    // Replace placeholders with proper tokens after tokenizing
    value: function(env, language) {
      if (env.language !== language || !env.tokenStack) {
        return;
      }

      // Switch the grammar back
      env.grammar = Prism.languages[language];

      var j = 0;
      var keys = Object.keys(env.tokenStack);
      var walkTokens = function(tokens) {
        if (j >= keys.length) {
          return;
        }
        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];
          if (
            typeof token === "string" ||
            (token.content && typeof token.content === "string")
          ) {
            var k = keys[j];
            var t = env.tokenStack[k];
            var s = typeof token === "string" ? token : token.content;

            var index = s.indexOf("___" + language.toUpperCase() + k + "___");
            if (index > -1) {
              ++j;
              var before = s.substring(0, index);
              var middle = new Prism.Token(
                language,
                Prism.tokenize(t, env.grammar, language),
                "language-" + language,
                t
              );
              var after = s.substring(
                index + ("___" + language.toUpperCase() + k + "___").length
              );
              var replacement;
              if (before || after) {
                replacement = [before, middle, after].filter(function(v) {
                  return !!v;
                });
                walkTokens(replacement);
              } else {
                replacement = middle;
              }
              if (typeof token === "string") {
                Array.prototype.splice.apply(
                  tokens,
                  [i, 1].concat(replacement)
                );
              } else {
                token.content = replacement;
              }

              if (j >= keys.length) {
                break;
              }
            }
          } else if (token.content && typeof token.content !== "string") {
            walkTokens(token.content);
          }
        }
      };

      walkTokens(env.tokens);
    }
  }
});
/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */
(function(Prism) {
  Prism.languages.php = Prism.languages.extend("clike", {
    keyword: /\b(?:__halt_compiler|abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|parent|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/i,
    boolean: {
      pattern: /\b(?:false|true)\b/i,
      alias: "constant"
    },
    constant: [/\b[A-Z_][A-Z0-9_]*\b/, /\b(?:null)\b/i],
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
      lookbehind: true
    }
  });

  Prism.languages.insertBefore("php", "string", {
    "shell-comment": {
      pattern: /(^|[^\\])#.*/,
      lookbehind: true,
      alias: "comment"
    }
  });

  Prism.languages.insertBefore("php", "keyword", {
    delimiter: {
      pattern: /\?>|<\?(?:php|=)?/i,
      alias: "important"
    },
    variable: /\$+(?:\w+\b|(?={))/i,
    package: {
      pattern: /(\\|namespace\s+|use\s+)[\w\\]+/,
      lookbehind: true,
      inside: {
        punctuation: /\\/
      }
    }
  });

  // Must be defined after the function pattern
  Prism.languages.insertBefore("php", "operator", {
    property: {
      pattern: /(->)[\w]+/,
      lookbehind: true
    }
  });

  var string_interpolation = {
    pattern: /{\$(?:{(?:{[^{}]+}|[^{}]+)}|[^{}])+}|(^|[^\\{])\$+(?:\w+(?:\[.+?]|->\w+)*)/,
    lookbehind: true,
    inside: {
      rest: Prism.languages.php
    }
  };

  Prism.languages.insertBefore("php", "string", {
    "nowdoc-string": {
      pattern: /<<<'([^']+)'(?:\r\n?|\n)(?:.*(?:\r\n?|\n))*?\1;/,
      greedy: true,
      alias: "string",
      inside: {
        delimiter: {
          pattern: /^<<<'[^']+'|[a-z_]\w*;$/i,
          alias: "symbol",
          inside: {
            punctuation: /^<<<'?|[';]$/
          }
        }
      }
    },
    "heredoc-string": {
      pattern: /<<<(?:"([^"]+)"(?:\r\n?|\n)(?:.*(?:\r\n?|\n))*?\1;|([a-z_]\w*)(?:\r\n?|\n)(?:.*(?:\r\n?|\n))*?\2;)/i,
      greedy: true,
      alias: "string",
      inside: {
        delimiter: {
          pattern: /^<<<(?:"[^"]+"|[a-z_]\w*)|[a-z_]\w*;$/i,
          alias: "symbol",
          inside: {
            punctuation: /^<<<"?|[";]$/
          }
        },
        interpolation: string_interpolation // See below
      }
    },
    "single-quoted-string": {
      pattern: /'(?:\\[\s\S]|[^\\'])*'/,
      greedy: true,
      alias: "string"
    },
    "double-quoted-string": {
      pattern: /"(?:\\[\s\S]|[^\\"])*"/,
      greedy: true,
      alias: "string",
      inside: {
        interpolation: string_interpolation // See below
      }
    }
  });
  // The different types of PHP strings "replace" the C-like standard string
  delete Prism.languages.php["string"];

  Prism.hooks.add("before-tokenize", function(env) {
    if (!/(?:<\?php|<\?)/gi.test(env.code)) {
      return;
    }

    var phpPattern = /(?:<\?php|<\?)[\s\S]*?(?:\?>|$)/gi;
    Prism.languages["markup-templating"].buildPlaceholders(
      env,
      "php",
      phpPattern
    );
  });

  Prism.hooks.add("after-tokenize", function(env) {
    Prism.languages["markup-templating"].tokenizePlaceholders(env, "php");
  });
})(Prism);
Prism.languages.scss = Prism.languages.extend("css", {
  comment: {
    pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
    lookbehind: true
  },
  atrule: {
    pattern: /@[\w-]+(?:\([^()]+\)|[^(])*?(?=\s+[{;])/,
    inside: {
      rule: /@[\w-]+/
      // See rest below
    }
  },
  // url, compassified
  url: /(?:[-a-z]+-)*url(?=\()/i,
  // CSS selector regex is not appropriate for Sass
  // since there can be lot more things (var, @ directive, nesting..)
  // a selector must start at the end of a property or after a brace (end of other rules or nesting)
  // it can contain some characters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
  // the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
  // can "pass" as a selector- e.g: proper#{$erty})
  // this one was hard to do, so please be careful if you edit this one :)
  selector: {
    // Initial look-ahead is used to prevent matching of blank selectors
    pattern: /(?=\S)[^@;{}()]?(?:[^@;{}()]|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}]+[:{][^}]+))/m,
    inside: {
      parent: {
        pattern: /&/,
        alias: "important"
      },
      placeholder: /%[-\w]+/,
      variable: /\$[-\w]+|#\{\$[-\w]+\}/
    }
  },
  property: {
    pattern: /(?:[\w-]|\$[-\w]+|#\{\$[-\w]+\})+(?=\s*:)/,
    inside: {
      variable: /\$[-\w]+|#\{\$[-\w]+\}/
    }
  }
});

Prism.languages.insertBefore("scss", "atrule", {
  keyword: [
    /@(?:if|else(?: if)?|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)/i,
    {
      pattern: /( +)(?:from|through)(?= )/,
      lookbehind: true
    }
  ]
});

Prism.languages.insertBefore("scss", "important", {
  // var and interpolated vars
  variable: /\$[-\w]+|#\{\$[-\w]+\}/
});

Prism.languages.insertBefore("scss", "function", {
  placeholder: {
    pattern: /%[-\w]+/,
    alias: "selector"
  },
  statement: {
    pattern: /\B!(?:default|optional)\b/i,
    alias: "keyword"
  },
  boolean: /\b(?:true|false)\b/,
  null: {
    pattern: /\bnull\b/,
    alias: "keyword"
  },
  operator: {
    pattern: /(\s)(?:[-+*\/%]|[=!]=|<=?|>=?|and|or|not)(?=\s)/,
    lookbehind: true
  }
});

Prism.languages.scss["atrule"].inside.rest = Prism.languages.scss;

Prism.languages.twig = {
  comment: /\{#[\s\S]*?#\}/,
  tag: {
    pattern: /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/,
    inside: {
      ld: {
        pattern: /^(?:\{\{-?|\{%-?\s*\w+)/,
        inside: {
          punctuation: /^(?:\{\{|\{%)-?/,
          keyword: /\w+/
        }
      },
      rd: {
        pattern: /-?(?:%\}|\}\})$/,
        inside: {
          punctuation: /.*/
        }
      },
      string: {
        pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
        inside: {
          punctuation: /^['"]|['"]$/
        }
      },
      keyword: /\b(?:even|if|odd)\b/,
      boolean: /\b(?:true|false|null)\b/,
      number: /\b0x[\dA-Fa-f]+|(?:\b\d+\.?\d*|\B\.\d+)(?:[Ee][-+]?\d+)?/,
      operator: [
        {
          pattern: /(\s)(?:and|b-and|b-xor|b-or|ends with|in|is|matches|not|or|same as|starts with)(?=\s)/,
          lookbehind: true
        },
        /[=<>]=?|!=|\*\*?|\/\/?|\?:?|[-+~%|]/
      ],
      property: /\b[a-zA-Z_]\w*\b/,
      punctuation: /[()\[\]{}:.,]/
    }
  },

  // The rest can be parsed as HTML
  other: {
    // We want non-blank matches
    pattern: /\S(?:[\s\S]*\S)?/,
    inside: Prism.languages.markup
  }
};

(function() {
  var assign =
    Object.assign ||
    function(obj1, obj2) {
      for (var name in obj2) {
        if (obj2.hasOwnProperty(name)) obj1[name] = obj2[name];
      }
      return obj1;
    };

  function NormalizeWhitespace(defaults) {
    this.defaults = assign({}, defaults);
  }

  function toCamelCase(value) {
    return value.replace(/-(\w)/g, function(match, firstChar) {
      return firstChar.toUpperCase();
    });
  }

  function tabLen(str) {
    var res = 0;
    for (var i = 0; i < str.length; ++i) {
      if (str.charCodeAt(i) == "\t".charCodeAt(0)) res += 3;
    }
    return str.length + res;
  }

  NormalizeWhitespace.prototype = {
    setDefaults: function(defaults) {
      this.defaults = assign(this.defaults, defaults);
    },
    normalize: function(input, settings) {
      settings = assign(this.defaults, settings);

      for (var name in settings) {
        var methodName = toCamelCase(name);
        if (
          name !== "normalize" &&
          methodName !== "setDefaults" &&
          settings[name] &&
          this[methodName]
        ) {
          input = this[methodName].call(this, input, settings[name]);
        }
      }

      return input;
    },

    /*
     * Normalization methods
     */
    leftTrim: function(input) {
      return input.replace(/^\s+/, "");
    },
    rightTrim: function(input) {
      return input.replace(/\s+$/, "");
    },
    tabsToSpaces: function(input, spaces) {
      spaces = spaces | 0 || 4;
      return input.replace(/\t/g, new Array(++spaces).join(" "));
    },
    spacesToTabs: function(input, spaces) {
      spaces = spaces | 0 || 4;
      return input.replace(RegExp(" {" + spaces + "}", "g"), "\t");
    },
    removeTrailing: function(input) {
      return input.replace(/\s*?$/gm, "");
    },
    // Support for deprecated plugin remove-initial-line-feed
    removeInitialLineFeed: function(input) {
      return input.replace(/^(?:\r?\n|\r)/, "");
    },
    removeIndent: function(input) {
      var indents = input.match(/^[^\S\n\r]*(?=\S)/gm);

      if (!indents || !indents[0].length) return input;

      indents.sort(function(a, b) {
        return a.length - b.length;
      });

      if (!indents[0].length) return input;

      return input.replace(RegExp("^" + indents[0], "gm"), "");
    },
    indent: function(input, tabs) {
      return input.replace(
        /^[^\S\n\r]*(?=\S)/gm,
        new Array(++tabs).join("\t") + "$&"
      );
    },
    breakLines: function(input, characters) {
      characters = characters === true ? 80 : characters | 0 || 80;

      var lines = input.split("\n");
      for (var i = 0; i < lines.length; ++i) {
        if (tabLen(lines[i]) <= characters) continue;

        var line = lines[i].split(/(\s+)/g),
          len = 0;

        for (var j = 0; j < line.length; ++j) {
          var tl = tabLen(line[j]);
          len += tl;
          if (len > characters) {
            line[j] = "\n" + line[j];
            len = tl;
          }
        }
        lines[i] = line.join("");
      }
      return lines.join("\n");
    }
  };

  // Support node modules
  if (typeof module !== "undefined" && module.exports) {
    module.exports = NormalizeWhitespace;
  }

  // Exit if prism is not loaded
  if (typeof Prism === "undefined") {
    return;
  }

  Prism.plugins.NormalizeWhitespace = new NormalizeWhitespace({
    "remove-trailing": true,
    "remove-indent": true,
    "left-trim": true,
    "right-trim": true
    /*'break-lines': 80,
	'indent': 2,
	'remove-initial-line-feed': false,
	'tabs-to-spaces': 4,
	'spaces-to-tabs': 4*/
  });

  Prism.hooks.add("before-sanity-check", function(env) {
    var Normalizer = Prism.plugins.NormalizeWhitespace;

    // Check settings
    if (env.settings && env.settings["whitespace-normalization"] === false) {
      return;
    }

    // Simple mode if there is no env.element
    if ((!env.element || !env.element.parentNode) && env.code) {
      env.code = Normalizer.normalize(env.code, env.settings);
      return;
    }

    // Normal mode
    var pre = env.element.parentNode;
    var clsReg = /\bno-whitespace-normalization\b/;
    if (
      !env.code ||
      !pre ||
      pre.nodeName.toLowerCase() !== "pre" ||
      clsReg.test(pre.className) ||
      clsReg.test(env.element.className)
    )
      return;

    var children = pre.childNodes,
      before = "",
      after = "",
      codeFound = false;

    // Move surrounding whitespace from the <pre> tag into the <code> tag
    for (var i = 0; i < children.length; ++i) {
      var node = children[i];

      if (node == env.element) {
        codeFound = true;
      } else if (node.nodeName === "#text") {
        if (codeFound) {
          after += node.nodeValue;
        } else {
          before += node.nodeValue;
        }

        pre.removeChild(node);
        --i;
      }
    }

    if (!env.element.children.length || !Prism.plugins.KeepMarkup) {
      env.code = before + env.code + after;
      env.code = Normalizer.normalize(env.code, env.settings);
    } else {
      // Preserve markup for keep-markup plugin
      var html = before + env.element.innerHTML + after;
      env.element.innerHTML = Normalizer.normalize(html, env.settings);
      env.code = env.element.textContent;
    }
  });
})();
