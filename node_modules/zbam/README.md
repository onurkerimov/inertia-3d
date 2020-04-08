# zbam
A tiny plugin for orchestrating drag/draw/swipe-like mouse/touch events, with tiny API. Event listeners are added to the window object, and element targeting is carried out with `dragStartCondition` setting.

## Usage
Zbam can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm), by the following command:

```sh
npm install zbam
```

Importing by the default export is enough. Simply create instances as following:
```js
import Zbam from 'zbam'

let instance = new Zbam({
  dragStart(event) {...},
  dragMove(event) {...},
  dragEnd(event) {...},
})

// Then remove event listeners with
instance.destroy()
```

## API

| Options            | Type     | Description                                                                                                                                                                             |
|--------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| startDraggingAfter | Number   | Set a duration (in milliseconds) to differentiate pan from click.  Pan class won't execute if the duration between mousedown/mouseup or touchstart/touchend is less than this duration. |
| dragStartCondition | Function | Is a function with event argument as the argument.                                                                                                                                      |   |
| settings           | Object   | Passed directly to event listeners as the third argument. You can set `passive: true` if you want to create passive event listeners.                                                    |   |
| dragStart          | Function | Main callback for drag start: runs on `touchstart` and `mousedown`                                                                                                                      |   |
| dragMove           | Function | Main callback for drag move: runs on `touchmove` and `mousemove`                                                                                                                        |   |
| dragEnd            | Function | Main callback for drag end: runs on `touchend` and `mouseup`                                                                                                                            |   |

## License
Licensed with the MIT License