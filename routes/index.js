var mongoose = require( 'mongoose' );
var Image     = mongoose.model( 'Image' );

/*
 * GET home page.
 */

exports.index = function(req, res){
  Image.find( 'title author created_at src', function ( err, images, count ){
    res.render( 'index', {
      title : 'Infragram: online infrared image analysis',
      images : images
    });
  });
};

exports.show = function(req, res){
  Image.findOne({ _id: req.params.id }, 'src title desc author orig_src updated_at log', function (err, image) {
    if (err) return handleError(err);
    res.render( 'show', {
      image : image
    });
  })
};

// serve up the image itself, converting it from base64 to binary
exports.raw = function(req, res){
  Image.findOne({ _id: req.params.id }, 'src title desc author orig_src updated_at log', function (err, image) {
    if (err) return handleError(err);
    res.writeHead(200, { "Content-type": "image/png" });
    var atob = require('atob')
    res.end(atob(image.src.split(',')[1]), "binary");
  })
};

exports.delete = function(req, res){
  if (req.params.pwd == "easytohack") { // very temporary solution
    Image.remove({ _id: req.params.id }, function (err, image) {
      if (err) return handleError(err);
      res.redirect('/');
    })
  }
};

exports.create = function ( req, res ){
  new Image({
    title: req.body.title,
    author: req.body.author,
    desc: req.body.desc,
    log: req.body.log,
    orig_src: req.body.orig_src,
    thumb_src: req.body.thumb_src,
    src: req.body.src,
    updated_at : Date.now(),
  }).save( function( err, todo, count ){
    // if err, redirect to a filled-out form of the data, with validation errors 
    // ...i don't yet know how to do this, but here are some relevant things:
    //if (err) return handleError(err);
    //err.errors.desc.type // <= 'Description must be less than 1000 words'
    res.redirect( '/' );
  });
};

