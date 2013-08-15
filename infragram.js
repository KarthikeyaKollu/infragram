// Generated by CoffeeScript 1.4.0
var Image, colorify, file_reader, get_channels, histogram, image, nvdi, on_file_sel, render, segmented_colormap, segments, update;

image = null;

Image = (function() {

  function Image(data, width, height, channels) {
    this.data = data;
    this.width = width;
    this.height = height;
    this.channels = channels;
  }

  Image.prototype.copyToImageData = function(imgData) {
    return imgData.data.set(this.data);
  };

  Image.prototype.extrema = function() {
    var c, i, j, maxs, mins, n, _i, _j, _ref;
    n = this.width * this.height;
    mins = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.channels; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.data[i]);
      }
      return _results;
    }).call(this);
    maxs = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.channels; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.data[i]);
      }
      return _results;
    }).call(this);
    j = 0;
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      for (c = _j = 0, _ref = this.channels; 0 <= _ref ? _j < _ref : _j > _ref; c = 0 <= _ref ? ++_j : --_j) {
        if (this.data[j] > maxs[c]) {
          maxs[c] = this.data[j];
        }
        if (this.data[j] < mins[c]) {
          mins[c] = this.data[j];
        }
        j++;
      }
    }
    return [mins, maxs];
  };

  return Image;

})();

histogram = function(array, _arg, nbins) {
  var a, bins, d, i, max, min, _i, _len;
  min = _arg[0], max = _arg[1];
  bins = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; 0 <= nbins ? _i < nbins : _i > nbins; i = 0 <= nbins ? ++_i : --_i) {
      _results.push(0);
    }
    return _results;
  })();
  d = (max - min) / nbins;
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    a = array[_i];
    i = Math.floor((a - min) / d);
    if ((0 <= i && i < nbins)) {
      bins[i]++;
    }
  }
  return bins;
};

segmented_colormap = function(segments) {
  return function(x) {
    var i, result, x0, x1, xstart, y0, y1, _i, _j, _len, _ref, _ref1, _ref2, _ref3;
    _ref = [0, 0], y0 = _ref[0], y1 = _ref[1];
    _ref1 = [segments[0][0], 1], x0 = _ref1[0], x1 = _ref1[1];
    if (x < x0) {
      return y0;
    }
    for (i = _i = 0, _len = segments.length; _i < _len; i = ++_i) {
      _ref2 = segments[i], xstart = _ref2[0], y0 = _ref2[1], y1 = _ref2[2];
      x0 = xstart;
      if (i === segments.length - 1) {
        x1 = 1;
        break;
      }
      x1 = segments[i + 1][0];
      if ((xstart <= x && x < x1)) {
        break;
      }
    }
    result = [];
    for (i = _j = 0, _ref3 = y0.length; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
      result[i] = (x - x0) / (x1 - x0) * (y1[i] - y0[i]) + y0[i];
    }
    return result;
  };
};

get_channels = function(img) {
  var b, g, i, mkImage, n, r, _i;
  n = img.width * img.height;
  r = new Float32Array(n);
  g = new Float32Array(n);
  b = new Float32Array(n);
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    r[i] = img.data[4 * i + 0];
    g[i] = img.data[4 * i + 1];
    b[i] = img.data[4 * i + 2];
  }
  mkImage = function(d) {
    return new Image(d, img.width, img.height, 1);
  };
  return [mkImage(r), mkImage(g), mkImage(b)];
};

nvdi = function(nir, vis) {
  var d, i, n, _i;
  n = nir.width * nir.height;
  d = new Float64Array(n);
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    d[i] = (nir.data[i] - vis.data[i]) / (nir.data[i] + vis.data[i]);
  }
  return new Image(d, nir.width, nir.height, 1);
};

colorify = function(img, colormap) {
  var b, cimg, data, g, i, j, n, r, _i, _ref;
  n = img.width * img.height;
  data = new Uint8ClampedArray(4 * n);
  j = 0;
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    _ref = colormap(img.data[i]), r = _ref[0], g = _ref[1], b = _ref[2];
    data[j++] = r;
    data[j++] = g;
    data[j++] = b;
    data[j++] = 255;
  }
  cimg = new Image();
  cimg.width = img.width;
  cimg.height = img.height;
  cimg.data = data;
  return new Image(data, img.width, img.height, 4);
};

render = function(img) {
  var ctx, d, e;
  e = document.getElementById("image");
  e.width = img.width;
  e.height = img.height;
  ctx = e.getContext("2d");
  d = ctx.getImageData(0, 0, img.width, img.height);
  img.copyToImageData(d);
  return ctx.putImageData(d, 0, 0);
};

segments = [[0, [0, 0, 0], [0, 255, 0]], [1, [255, 0, 0], [0, 0, 255]]];

update = function(img) {
  var b, colormap, d, g, max, min, mode, nvdi_img, r, result, _ref, _ref1, _ref2, _ref3, _ref4;
  mode = $('input[name="output-type"]:checked').val();
  if (mode === "nvdi") {
    _ref = get_channels(img), r = _ref[0], g = _ref[1], b = _ref[2];
    nvdi_img = nvdi(r, b);
    _ref1 = nvdi_img.extrema(), (_ref2 = _ref1[0], min = _ref2[0]), (_ref3 = _ref1[1], max = _ref3[0]);
    d = max - min;
    colormap = segmented_colormap(segments);
    result = colorify(nvdi_img, colormap);
  } else if (mode === "raw") {
    result = img;
  } else if (mode === "nir") {
    _ref4 = get_channels(img), r = _ref4[0], g = _ref4[1], b = _ref4[2];
    result = colorify(r, function(x) {
      return [x, x, x];
    });
  }
  return render(result);
};

file_reader = new FileReader();

file_reader.onload = function(oFREvent) {
  var d, data, file, img, jpeg, png;
  file = document.forms["file-form"]["file-sel"].files[0];
  data = new Uint8Array(file_reader.result);
  if (file.type === "image/png") {
    png = new PNG(data);
    data = png.decode();
    img = new Image(data, png.width, png.height);
  } else if (file.type === "image/jpeg") {
    jpeg = new JpegImage();
    jpeg.parse(data);
    d = new Uint8ClampedArray(4 * jpeg.width * jpeg.height);
    img = new Image(d, jpeg.width, jpeg.height, 4);
    jpeg.copyToImageData(img);
  } else {
    document.getElementById("error").html = "Unrecognized file format (supports PNG and JPEG)";
    return;
  }
  image = img;
  return update(img);
};

on_file_sel = function() {
  var file;
  file = document.forms["file-form"]["file-sel"].files[0];
  if (file) {
    return file_reader.readAsArrayBuffer(file);
  }
};
