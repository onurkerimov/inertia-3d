# inertia-3d

Drag DOM elements with simulated inertia, by 3D CSS transformations. Made using Zbam.js.

## Example

- [Moving 3D CSS cube example](https://onurkerimov.github.io/inertia-3d/)

## Usage

```js
import Inertia from "inertia-3d";

let cube = document.querySelector(".cube");
new Inertia(cube);
```

## API

Used as

```js
new Inertia(element);
```

or

```js
new Inertia({
  element, // (HTMLElement) target element to be moved 
  handle, // (HTMLElement) target element to be used as the handle (Default: same as handle)
  positionDamping, // (Number) Damping for position (Default: 0.4)
  rotationDamping, // (Number) Damping for rotation (Default: 0.1)
  rotationMaxDegree, // (Number) Upper threshold for rotation (Unit: deg) (Default: 75)
  rotationMultiplier, // (Number) A factor for setting rotation amplitude when the element is moved (Default: 3)
});
```

