"use strict";

exports.__esModule = true;
exports.default = _default;

var loaderUtils = _interopRequireWildcard(require("loader-utils"));

var _path = _interopRequireDefault(require("path"));

var _sharp = _interopRequireDefault(require("sharp"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

const prepareSizes = (options) => {
  const result = [
    options.height
      ? [
          {
            height: options.height,
            width: options.width || options.height,
          },
        ]
      : (options.sizes || [])
          .map((val) => val.trim())
          .map((val) => [val, /([0-9]+)([x,])?([0-9]+)?/.exec(val)])
          .map((val) => val[1])
          .map((val) => ({
            height: val[1],
            width: val[3] || val[1],
          })),
  ][0];

  if (result.length === 0) {
    return [
      {
        width: -1,
        height: -1,
      },
    ];
  }

  return result.map((size) => ({
    width: parseInt(`${size.width || 1}`),
    height: parseInt(`${size.height || 1}`),
  }));
};

function getIssuer(loaderContext, currentModule) {
  const compilation = loaderContext._compilation;

  if (
    compilation &&
    compilation.moduleGraph &&
    typeof compilation.moduleGraph.getIssuer === "function"
  ) {
    return compilation.moduleGraph.getIssuer(currentModule);
  }

  return currentModule && currentModule.issuer;
}

function shouldExportAsDataUrl(loaderContext) {
  const documentEntryPattern = /\.document\.tsx(?:[?#].*)?$/;
  let currentModule = loaderContext._module;
  const visited = new Set();

  while (currentModule && !visited.has(currentModule)) {
    visited.add(currentModule);

    const request =
      currentModule.resource ||
      currentModule.userRequest ||
      currentModule.request ||
      "";

    if (documentEntryPattern.test(request)) {
      return true;
    }

    currentModule = getIssuer(loaderContext, currentModule);
  }

  return false;
}

function _default(content) {
  const options = Object.assign(
    {},
    loaderUtils.getOptions(this),
    loaderUtils.parseQuery(this.resourceQuery || "?"),
  );
  const context = options.context || this.rootContext;
  const callback = this.async();
  options.resizeFactor = options.resizeFactor || 1;
  options.name = options.name || "[contenthash].png";
  options.name = options.name.replace(
    "[name]",
    _path.default.basename(this.resourcePath).replace(/\..*$/, ""),
  );
  let outputPathBase = loaderUtils.interpolateName(this, options.name, {
    context,
    content,
    regExp: options.regExp,
  });

  if (options.outputPath) {
    outputPathBase = _path.default.join(options.outputPath, outputPathBase);
  }

  const exportAsDataUrl = shouldExportAsDataUrl(this);

  Promise.all(
    prepareSizes(options).map((size) => {
      return new Promise((resolve, reject) => {
        let sharpInst = (0, _sharp.default)(this.resourcePath); // Do conversion

        if (size.width > -1 && size.height > -1) {
          sharpInst = sharpInst.resize(
            size.width * options.resizeFactor,
            size.height * options.resizeFactor,
          );
        }

        sharpInst
          .sharpen()
          .png({
            compressionLevel: 0,
            dither: 0,
            progressive: true,
          })
          .toBuffer((err, data, info) => {
            if (err) {
              reject(err);
            } else {
              const finalSize = {
                height: info.height,
                width: info.width,
              }; // Determine webpack output path

              const outputPath = outputPathBase.replace(
                /\[([^\]]+)]/g,
                (match) => {
                  match = match.replace(/^\[|]$/g, "");
                  return finalSize[match] || finalSize[match] === 0
                    ? finalSize[match]
                    : match;
                },
              );

              if (!exportAsDataUrl) {
                this.emitFile(outputPath, data);
              }

              resolve({
                size: finalSize,
                outputPath,
                data,
              });
            }
          });
      });
    }),
  )
    .then((results) => {
      let output = exportAsDataUrl
        ? `module.exports = "data:image/png;base64,${results[0].data.toString("base64")}";`
        : `module.exports = __webpack_public_path__ + "${results[0].outputPath}";`;
      callback(null, output);
    })
    .catch((error) => {
      callback(error);
    });
}
