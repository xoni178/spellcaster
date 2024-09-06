const EventEmitter = require('events')

export class VariableEmitter extends EventEmitter {
  constructor(initialValue) {
    super()
    this._value = initialValue
  }

  get value() {
    return this._value
  }

  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue
      this.emit('update', newValue)
    }
  }

  checkNumListeners() {
    // Check and log the number of listeners
    const listenerCount = this.listenerCount('update')
    console.log(`Number of listeners: ${listenerCount}`)
  }

  removeListenerUpdate(func) {
    this.off('update', func)
  }
}
