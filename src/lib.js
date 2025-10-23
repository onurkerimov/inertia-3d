import Zbam from 'zbam'

/** Precision for rounding transform values */
const PRECISION = 2

/** Threshold for considering movement stopped (in pixels/degrees) */
const IDLE_THRESHOLD = 0.01

/**
 * Inertia - Drag DOM elements with simulated inertia using 3D CSS transformations
 * @class
 */
export default class Inertia {
  /**
   * Creates an instance of Inertia
   * @param {HTMLElement|Object} obj - The target element or configuration object
   * @param {HTMLElement} obj.element - Target element to be moved
   * @param {HTMLElement} [obj.handle] - Element to use as drag handle (defaults to element)
   * @param {number} [obj.positionDamping=0.4] - Damping for position (0-1)
   * @param {number} [obj.rotationDamping=0.1] - Damping for rotation (0-1)
   * @param {number} [obj.rotationMaxDegree=75] - Upper threshold for rotation in degrees
   * @param {number} [obj.rotationMultiplier=3] - Factor for rotation amplitude
   */
  constructor(obj) {
    this.animate = this.animate.bind(this)

    // Get element
    if (obj instanceof HTMLElement) {
      this.element = obj
    } else {
      this.element = obj.element
    }

    // Validate element
    if (!this.element || !(this.element instanceof HTMLElement)) {
      throw new Error('Inertia: element must be a valid HTMLElement')
    }

    // Set options with validation
    this.handle = obj.handle || this.element
    this.positionDamping = this._validateDamping(obj.positionDamping, 0.4)
    this.rotationDamping = this._validateDamping(obj.rotationDamping, 0.1)
    this.rotationMaxDegree = this._validateNumber(obj.rotationMaxDegree, 75, 0, 180)
    this.rotationMultiplier = this._validateNumber(obj.rotationMultiplier, 3, 0, Infinity)

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

    // Track animation state
    this.animationId = null
    this.isDestroyed = false
    this.zbamInstance = null

    // Drag state
    this.dragState = {
      x: 0,
      y: 0,
      initialX: 0,
      initialY: 0,
      previousX: 0,
      previousY: 0
    }

    this.setListeners()
    this.animate()
  }

  /**
   * Validates damping values (should be between 0 and 1)
   * @private
   * @param {*} value - Value to validate
   * @param {number} defaultValue - Default value if invalid
   * @returns {number} Validated damping value
   */
  _validateDamping(value, defaultValue) {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0 || num > 1) {
      return defaultValue
    }
    return num
  }

  /**
   * Validates numeric values within a range
   * @private
   * @param {*} value - Value to validate
   * @param {number} defaultValue - Default value if invalid
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number} Validated number
   */
  _validateNumber(value, defaultValue, min, max) {
    const num = parseFloat(value)
    if (isNaN(num) || num < min || num > max) {
      return defaultValue
    }
    return num
  }

  /**
   * Clamps a number between min and max values
   * @private
   * @param {number} num - Number to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped number
   */
  _clamp(num, min, max) {
    return Math.max(min, Math.min(max, num))
  }

  /**
   * Calculates rotation with clamping
   * @private
   * @param {number} num - Input rotation value
   * @returns {number} Clamped rotation value
   */
  _calculateRotation(num) {
    num = num * this.rotationMultiplier
    return this._clamp(num, -this.rotationMaxDegree, this.rotationMaxDegree)
  }

  /**
   * Applies damping to a value
   * @private
   * @param {number} current - Current value
   * @param {number} target - Target value
   * @param {number} damping - Damping factor
   * @returns {number} New value after damping
   */
  _applyDamping(current, target, damping) {
    return current + (target - current) * damping
  }

  /**
   * Normalizes a value to fixed precision
   * @private
   * @param {number} value - Value to normalize
   * @returns {number} Normalized value
   */
  _normalize(value) {
    return parseFloat(value.toFixed(PRECISION))
  }

  /**
   * Checks if the element is currently idle (not moving)
   * @private
   * @returns {boolean} True if element is idle
   */
  _isIdle() {
    const { target, actual } = this
    const positionDelta = Math.abs(target.position.x - actual.position.x) +
                          Math.abs(target.position.y - actual.position.y)
    const rotationDelta = Math.abs(target.rotation.x - actual.rotation.x) +
                          Math.abs(target.rotation.y - actual.rotation.y)

    return positionDelta < IDLE_THRESHOLD &&
           rotationDelta < IDLE_THRESHOLD
  }

  /**
   * Animation loop - updates element transforms
   * @private
   */
  animate() {
    if (this.isDestroyed) return

    const { target, actual, element } = this

    // Apply damping to position
    actual.position.x = this._applyDamping(actual.position.x, target.position.x, this.positionDamping)
    actual.position.y = this._applyDamping(actual.position.y, target.position.y, this.positionDamping)

    // Apply damping to rotation
    actual.rotation.x = this._applyDamping(actual.rotation.x, target.rotation.x, this.rotationDamping)
    actual.rotation.y = this._applyDamping(actual.rotation.y, target.rotation.y, this.rotationDamping)

    // Normalize values
    actual.position.x = this._normalize(actual.position.x)
    actual.position.y = this._normalize(actual.position.y)
    actual.rotation.x = this._normalize(actual.rotation.x)
    actual.rotation.y = this._normalize(actual.rotation.y)

    // Apply transform
    element.style.transform =
      `translate(${actual.position.x}px, ${actual.position.y}px) ` +
      `rotateX(${actual.rotation.x}deg) ` +
      `rotateY(${actual.rotation.y}deg)`

    // Only continue animation if element is still moving
    if (!this._isIdle()) {
      this.animationId = requestAnimationFrame(this.animate)
    } else {
      this.animationId = null
    }
  }

  /**
   * Resumes the animation loop if it was paused
   * @private
   */
  _resumeAnimation() {
    if (!this.animationId && !this.isDestroyed) {
      this.animationId = requestAnimationFrame(this.animate)
    }
  }

  /**
   * Sets up event listeners for drag interactions
   * @private
   */
  setListeners() {
    this.zbamInstance = new Zbam({
      dragStartCondition: (e) => {
        return this.handle === e.target || this.handle.contains(e.target)
      },
      dragStart: (e) => {
        this.dragState.previousX = 0
        this.dragState.previousY = 0
        this.dragState.initialX = e.clientX
        this.dragState.initialY = e.clientY
        this.targetInitial.position.x = this.target.position.x
        this.targetInitial.position.y = this.target.position.y
        this._resumeAnimation()
      },
      dragMove: (e) => {
        this.dragState.x = e.clientX - this.dragState.initialX
        this.dragState.y = e.clientY - this.dragState.initialY

        this.target.position.x = this.targetInitial.position.x + this.dragState.x
        this.target.position.y = this.targetInitial.position.y + this.dragState.y
        this.target.rotation.y = -this._calculateRotation(this.dragState.previousX - this.dragState.x)
        this.target.rotation.x = this._calculateRotation(this.dragState.previousY - this.dragState.y)

        this.dragState.previousX = this.dragState.x
        this.dragState.previousY = this.dragState.y

        this._resumeAnimation()
      },
      dragEnd: () => {
        this.target.rotation.y = 0
        this.target.rotation.x = 0
        this.dragState.previousX = 0
        this.dragState.previousY = 0
        this.dragState.x = 0
        this.dragState.y = 0
        this._resumeAnimation()
      }
    })
  }

  /**
   * Destroys the instance and cleans up resources
   * Cancels animation loop and removes event listeners
   * @public
   */
  destroy() {
    if (this.isDestroyed) return

    this.isDestroyed = true

    // Cancel animation frame
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    // Cleanup Zbam instance
    if (this.zbamInstance && typeof this.zbamInstance.destroy === 'function') {
      this.zbamInstance.destroy()
    }

    // Clear references
    this.element = null
    this.handle = null
    this.zbamInstance = null
  }
}
