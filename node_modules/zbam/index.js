export default class Zbam {
  constructor(options) {
    // If any option is provided, apply it
    if (options) {
      let self = this
      Object.keys(options).forEach(key => {
        self[key] = options[key]
      })
    }

    if (this.startDraggingAfter === undefined) this.startDraggingAfter = 0 //ms
    if (this.dragStartCondition === undefined) this.dragStartCondition = () => true
    if (this.settings === undefined) this.settings = {}
    if (this.dragStart === undefined) this.dragStart = () => true
    if (this.dragMove === undefined) this.dragMove = () => true
    if (this.dragEnd === undefined) this.dragEnd = () => true

    this.startDraggingTimeout = null

    this._dragStart = this._dragStart.bind(this)
    this._dragMove = this._dragMove.bind(this)
    this._dragEnd = this._dragEnd.bind(this)

    // Initialize listeners
    // Optimized for mobile and touch devices
    window.addEventListener('mousedown', this._dragStart, this.settings)
    window.addEventListener('touchstart', this._dragStart, this.settings)
    window.addEventListener('mousemove', this._dragMove, this.settings)
    window.addEventListener('touchmove', this._dragMove, this.settings)
    window.addEventListener('mouseup', this._dragEnd, this.settings)
    window.addEventListener('touchend', this._dragEnd, this.settings)

    this.dragging = false
  }

  _dragStart(e) {
    if (this.dragStartCondition(e)) {
      if (this.startDraggingAfter === 0) {
        this.dragging = true
      } else {
        this.startDraggingTimeout = setTimeout(() => {
          this.dragging = true
          this.startDraggingTimeout = null
        }, this.startDraggingAfter)
      }
      this.dragStart(e)
    }
  }

  _dragMove(e) {
    if (this.dragging) {
      this.dragMove(e)
    }
  }

  _dragEnd(e) {
    if (this.startDraggingTimeout) {
      clearTimeout(this.startDraggingTimeout)
      this.startDraggingTimeout = null
    }
    if (this.dragging) {
      this.dragEnd(e)
      this.dragging = false
    }
  }

  destroy() {
    window.removeEventListener('mousedown', this._dragStart, this.settings)
    window.removeEventListener('touchstart', this._dragStart, this.settings)
    window.removeEventListener('mousemove', this._dragMove, this.settings)
    window.removeEventListener('touchmove', this._dragMove, this.settings)
    window.removeEventListener('mouseup', this._dragEnd, this.settings)
    window.removeEventListener('touchend', this._dragEnd, this.settings)
  }
}
