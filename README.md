[![browser support](https://ci.testling.com/mattdesl/keyframes.png)](https://ci.testling.com/mattdesl/keyframes)

# keyframes

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Keyframe utils for a generic timeline. Imagine the low-level structure of After Effect's keyframes for a single control. The control (such as image position, color, etc) might use a 2-component vector (x, y), a color, or some other tweenable value. 

When a keyframe is added, the list is sorted to ensure the time stamps go from low to high. 

```js
var keyframes = require('keyframes')()

keyframes.add({ time: 0, value: 0 })
keyframes.add({ time: 1.5, value: 50 })
keyframes.add({ time: 4, value: 100 })

//get the interpolated value at the given time stamp
var eased = keyframes.value( timeStamp ) 

//get the closest keyframe within given (time) radius
var closest = keyframes.get( timeStamp, radius )

//the underlying array
console.log( keyframes.frames )
```

## Usage

[![NPM](https://nodei.co/npm/keyframes.png)](https://nodei.co/npm/keyframes/)

#### `var keys = require('keyframes')([frames][, sorted])`

Creates a new set of keyframes, optionally with some frames to use as default. The frames will then be sorted in order of their time stamp. 

It's assumed the list of keyframes is unsorted; but if it already has been, you can pass `false` for `sorted` and it won't perform another sort.

#### `keyframes.get(timeStamp[, radius])`

Gets the nearest keyframe to the specified time stamp. If `radius` is not specified, this will return the closest keyframe. If `radius` is a number, this only returns the closest result within that distance; otherwise returns null.

If it can't find any keyframes, null is returned.

#### `keyframes.getIndex(timeStamp[, radius])`

Like `get()`, but returns an index to the `frames` array instead of a keyframe object.

#### `keyframes.value(timeStamp[, ease])`

Determines the value at the given time stamp; bounded to the first and last keyframe (i.e. any time stamps before the first keyframe will receive it's value).

If the time stamp falls on a keyframe, the value of that keyframe will be returned. If the time stamp falls between two keyframes, we use linear interpolation between the two.

If both `value` of the interpolated frames are number types, they will be interpolated as expected. Otherwise, they are assumed to be an array with a variable number of components (e.g. `lerp(vec2a, vec2b, t)`).

You can also pass your own interpolation function for custom easings. This will get called with `(startFrame, endFrame, t)`, which you can operate to return a value. 

#### `keyframes.next(timeStamp)` 
#### `keyframes.previous(timeStamp)`

This is useful for jumping left and right in a timeline editor. From the given time stamp, it will return the next keyframe to the left or right. If none exist (i.e. we are at the bounds already) then null will be returned.

#### `keyframes.add(frame)`
#### `keyframes.remove(frame)`

Adds/removes a "keyframe" object (which has `time` and `value` properties). When a new frame is added, the list is re-sorted. For bulk adds, you may want to access the `frames` object directly.

#### `keyframes.sort()`

To be called when you manually change the underlying `frames` structure (i.e. after a bulk add).

#### `keyframes.frames`

The underlying array that holds keyframes.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/keyframes/blob/master/LICENSE.md) for details.
