import Zbam from 'zbam'

export default class {
  constructor(obj) {
    this.animate = this.animate.bind(this)
    // get element
    if (obj instanceof HTMLElement) this.element = obj
    else this.element = obj.element

    // other default settings
    this.handle = obj.handle || this.element
    this.positionDamping = obj.positionDamping || 0.4
    this.rotationDamping = obj.rotationDamping || 0.1
    this.rotationMaxDegree = obj.rotationMaxDegree || 75
    this.rotationMultiplier = obj.rotationMultiplier || 3
    this.rotationFn = num => {
      num = num * this.rotationMultiplier
      if (num > this.rotationMaxDegree) num = this.rotationMaxDegree
      if (num < -this.rotationMaxDegree) num = -this.rotationMaxDegree
      return num
    }

    // Element's transforms, stays consistent with element's style
    this.actual = {
      position: { x: 0, y: 0 },
      rotation: { x: 0, y: 0 }
    }

    // Element's target transforms, applied after some damping
    this.target = {
      position: { x: 0, y: 0 },
      rotation: { x: 0, y: 0 }
    }

    // Element's target transforms during mousedown
    this.targetInitial = {
      position: { x: 0, y: 0 },
      rotation: { x: 0, y: 0 }
    }

    this.setListeners()
    this.animate()
  }

  animate() {
    let { target, actual, element } = this

    // set position and rotation
    actual.position.x += (target.position.x - actual.position.x) * this.positionDamping
    actual.position.y += (target.position.y - actual.position.y) * this.positionDamping
    actual.rotation.x += (target.rotation.x - actual.rotation.x) * this.rotationDamping
    actual.rotation.y += (target.rotation.y - actual.rotation.y) * this.rotationDamping

    // normalize values
    actual.position.x = parseFloat(actual.position.x.toFixed(2))
    actual.position.y = parseFloat(actual.position.y.toFixed(2))
    actual.rotation.x = parseFloat(actual.rotation.x.toFixed(2))
    actual.rotation.y = parseFloat(actual.rotation.y.toFixed(2))

    // prettier-ignore
    element.style.transform =
      `translate(${actual.position.x}px, ${actual.position.y}px) 
       rotateX(${actual.rotation.x}deg) 
       rotateY(${actual.rotation.y}deg)`

    // finnally call the function again
    requestAnimationFrame(this.animate)
  }

  setListeners() {
    let self = this
    let x, y, initialX, initialY, previousX, previousY

    new Zbam({
      dragStartCondition(e) {
        return self.handle === e.target || isDescendant(self.handle, e.target)
      },
      dragStart(e) {
        previousX = 0
        previousY = 0
        initialX = e.clientX
        initialY = e.clientY
        self.targetInitial.position.x = self.target.position.x
        self.targetInitial.position.y = self.target.position.y
      },
      dragMove(e) {
        x = e.clientX - initialX
        y = e.clientY - initialY
        self.target.position.x = self.targetInitial.position.x + x
        self.target.position.y = self.targetInitial.position.y + y
        self.target.rotation.y = -self.rotationFn(previousX - x)
        self.target.rotation.x = self.rotationFn(previousY - y)
        previousX = x
        previousY = y
      },
      dragEnd() {
        self.target.rotation.y = previousX = x = 0
        self.target.rotation.x = previousY = y = 0
      }
    })
  }
}

const isDescendant = (parent, child) => {
  var node = child.parentNode
  while (node != null) {
    if (node === parent) {
      return true
    }
    node = node.parentNode
  }
  return false
}
