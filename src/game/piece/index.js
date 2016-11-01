const yo = require('yo-yo')
const container = document.getElementById('container')
const $ = require('jquery')
const request = require('superagent')

const appendTo = document.getElementById('game-container')
const $scrollBars = $('<div></div>')
const $grid = $('<div></div>')
const $appendTo = $(appendTo)

let imageTemplate = require('./imageTemplate')
// let skillTemplate = require('./skillTemplate')

$scrollBars.addClass('game-scrollbars')
$grid.addClass('game-grid')

$scrollBars.append($grid)
$appendTo.append($scrollBars)

// setInterval(moveTo, 10)
let $sight

function targetClick (x, y) {

  if ($sight) {
    $sight.remove()
  }

  let sight = yo`
    <div class="mouse-target"></div>
  `
  $sight = $(sight)

  let body = document.getElementsByTagName('body')[0]
  body.appendChild(sight)

  $sight.css({
    left: x + 'px' ,
    top: y + 'px'
  })

  setTimeout(function() {
    $sight.addClass('mouse-target-start')
    setTimeout(function() {
      $sight.remove()
    }, 200);
  }, 1);
}

let skillTimeLine = new TimelineMax({paused: true})


skillTimeLine.eventCallback('onReverseComplete', function () {
  skillTimeLine.clear()
})

$grid.on('click', '.skills-list-container', (e) => {
  e.preventDefault()
  let $this = $(e.currentTarget).find('.skills-list')
  let $particlesLeft = $this.find('.skill-particles[name=left]')
  let $particlesRight = $this.find('.skill-particles[name=right]')
  let $singleSkills = $this.find('.skills-single')

  if (skillTimeLine.time() <= 0) {
    skillTimeLine.to($this, 0.01, {
      opacity: 1,
      ease: Power2.easeOut,
    })
    .to($this, 0.2, {
      // marginTop: -50,
      height: 2,
      width: 180,
      marginLeft: -90,
      ease: Power2.easeOut
    })
    .to($this, 0.2, {
      marginTop: -90,
      height: 180,
      ease: Elastic.easeOut.config(1.75, 0.75)
    }, '-=0.05')
    .to($particlesLeft, 0.05, {
      width: 20,
      marginLeft: '0px',
      ease: Power2.easeIn
    }, '-=0.15')
    .to($particlesLeft, 0.15, {
      width: 0,
      marginLeft: '-40px',
      ease: Power2.easeOut
    }, '-=0.1')
    .to($particlesRight, 0.05, {
      width: 20,
      marginLeft: '-10px',
      ease: Power2.easeIn
    }, '-=0.25')
    .to($particlesRight, 0.05, {
      width: 0,
      marginLeft: '40px',
      ease: Power2.easeOut
    }, '-=0.1')
    .staggerTo($singleSkills, 0.05, {
      ease: Power2.easeOut,
    }, '-=0.1')
    .staggerTo($singleSkills, 0.15, {
      rotationX: "0deg",
      ease: Elastic.easeOut.config(2.75, 1.75),
    }, 0.1)


    skillTimeLine.play()
  }

})

$grid.on('mouseleave', '.skills-list-container', (e) => {
  e.preventDefault()
  // skillTimeLine.clear()
  skillTimeLine.reverse()
})


class Image {
  constructor (game, x, y, size, publicId, data, skills, user) {
    this.x = x
    this.y = y
    this.size = size || 70;
    this.id = publicId
    this.data = data
    this.skills = skills
    this.user = user
    this.game = game
    this.$pieceContainer = $('<div></div>')
    this.init()
  }

  init () {
    let _thisX = this.x
    let _thisY = this.y
    let _thisSize = this.size

    this.$pieceContainer.css({
      position: 'absolute',
      top: _thisX * _thisSize + 'px',
      left: _thisY * _thisSize + 'px',
      width: _thisSize + 'px',
      height: _thisSize + 'px',
      borderBottom: '0.5px dotted rgba(200, 200, 200, 0.06)',
      borderRight: '0.5px dotted rgba(200, 200, 200, 0.06)'
    }).html(imageTemplate(this.data))

    if (this.data) {
      console.log('here')
      this.$pieceContainer.css({
        'box-shadow': '0 5px 0 rgba(0, 0, 0, 0.2)',
        '-webkit-box-shadow': '0 10px 0 rgba(0, 0, 0, 0.2)',
      })
    }

    let gridSize = this.size * this.game.length + 'px'

    $grid.css({
      width: gridSize,
      height: gridSize,
    })

    $grid.append(this.$pieceContainer)
  }

  skillTemplateOn (skillTemplate) {
    this.$pieceContainer.append(skillTemplate)
    let $skillTemplate = $(skillTemplate)

    this.$skillTemplate = $skillTemplate

    switch (this.skills.length) {
      case 1:
        $skillTemplate.find('.skills-single').css({
          width: '100%',
          height: '100%'
        })
        break;
      case 2:
        $skillTemplate.find('.skills-single').css({
          width: '50%',
          height: '50%'
        })
        break;
      default:
        $skillTemplate.find('.skills-single').css({
          width: '33.3%',
          height: '33.3%'
        })
    }

    let getterPos = this.getterPos.bind(this)
    let getUsername = this.getterUsername.bind(this)

    this.$skillTemplate.on('click', '.skills-single', (e) => {
      e.preventDefault()
      let $skill = $(e.currentTarget)
      let skill = $skill[0].attributes['name'].value
      let dataToSend = {
        pos: getterPos(),
        skill: skill,
        username: getUsername().username
      }

      console.log(dataToSend)

      request
        .post(`/game/${skill}`)
        .send(dataToSend)
        .end(function (err, res) {
          console.log(err, res);
        })
      })
  }

  getterUsername () {
    return this.user
  }

  getterPos () {
    return {
      x: this.x,
      y: this.y
    }
  }

  drawMoveTo (x, y) {
    console.log(this.x, this.y, x, y)
    this.x = x
    this.y = y

    let _thisSize = this.size
    let _thisX = this.x
    let _thisY = this.y

    this.$pieceContainer.css({
      top: _thisY * _thisSize + 'px',
      left: _thisX * _thisSize + 'px'
    })
  }

  static viewportToCenter () {
    // antes se hacia cuando se cargaba el objeto window
    let scrollWidth = $scrollBars[0].clientWidth
    let scrollHeight = $scrollBars[0].clientHeight

    $scrollBars[0].scrollTop = ($scrollBars[0].scrollHeight - scrollHeight) / 2
    $scrollBars[0].scrollLeft = ($scrollBars[0].scrollWidth - scrollWidth) / 2
  }

  static viewportMoveActivate () {
    let distance, startPoint
    let scrollLeft = 0
    let scrollTop = 0
    let x, y = 0
    let move = false
    // let computer = true

    if (computer) {
      $scrollBars
        .mousemove(function (e) {
          if (!move) return
          this.scrollLeft = scrollLeft + x - e.clientX
          this.scrollTop = scrollTop + y - e.clientY
        })
        .mousedown(function (e) {
          if (e.which === 2) {
            move = true
            scrollLeft = this.scrollLeft
            scrollTop = this.scrollTop
            x = e.clientX
            y = e.clientY

            targetClick(x, y)
          }
        })
        .mouseup(function (e) {
          move = false
        })
    }
  }
}

module.exports = Image