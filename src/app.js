'use strict'
var page = require('page')
let $ = require('jquery')
global.computer = true

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  computer = false
}

$('body').mousedown(function(e){if(e.button==1)return false});

page.base('/#!')
require('./homepage')
require('./signin')
require('./signup')
// require('./forms') // formularios de materialize... ya son engorrosos 
require('./leftMenu')
require('masonry-layout')
// axios
// empty-element
// page
// gsap
// ejs

page()
