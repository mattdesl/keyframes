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
var closest = keyframes.nearest( timeStamp, radius )

//get the keyframe that matches the given time stamp
var match = keyframes.get( timeStamp )

//the underlying array
console.log( keyframes.frames )
```

This does not make any assumptions about the unit of time. The `value` for a keyframe is generally a number or array of numbers, but you could also use a custom `interpolation` function (see below) if you want to support color strings or some other data type. 

## Usage

[![NPM](https://nodei.co/npm/keyframes.png)](https://nodei.co/npm/keyframes/)

#### `var keys = require('keyframes')([frames][, sorted])`

Creates a new set of keyframes, optionally with some frames to use as default. The frames will then be sorted in order of their time stamp. 

It's assumed the list of keyframes is unsorted; but if it already has been, you can pass `false` for `sorted` and it won't perform another sort.

#### `keys.nearest(timeStamp[, radius])`

Gets the nearest keyframe to the specified time stamp. If `radius` is not specified, this will return the closest keyframe. If `radius` is a number, this only returns the closest result within that distance; otherwise returns null.

If radius is zero, this function behaves the same as `keys.get()`. 

If it can't find any keyframes, null is returned.

#### `keys.nearestIndex(timeStamp[, radius])`

Like `nearest()`, but returns an index to the `frames` array instead of a keyframe object.

#### `keys.get(timeStamp)`
#### `keys.getIndex(timeStamp)`

Convenience methods to get the keyframe or index exactly at the given time stamp. Same as `keys.nearest(timeStamp, 0)` and `keys.nearestIndex(timeStamp, 0)`.

#### `keys.value(timeStamp[, interpolator][, out])`

Determines the value at the given time stamp, based on keyframe interpolation.

If the time stamp falls on a keyframe, the value of that keyframe will be returned. If the time stamp falls between two keyframes, we use linear interpolation between the two. The result is clamped to the first and last keyframes; so if your first keyframe is at `2.5` and you're querying the value at `0.0`, the returned value will be of the keyframe at `2.5`. 

Here, `out` will get passed to the interpolator function. The default interpolator function is [lerp-array](https://www.npmjs.com/package/lerp-array) – this allows you to re-use arrays instead of creating new ones per frame.

You can also pass your own `interpolator` function for custom features and easings. This will get called with `(startFrame, endFrame, t, out)`, which you can operate to return a value. This may be useful if your values are, for example, color strings and need a custom easing. 

Example:

```js
var expoOut = require('eases/expo-out')
var lerpArray = require('lerp-array')

var keys = [
  { time: 0, value: [ 0, 0 ] },
  { time: 1, value: [ 10, 5 ] }
]

// get interpolated value at time stamp 0.5 
var result = timeline.value(0.5)
//=> [ 5, 2.5 ]

// get the value with custom interpolation
var result2 = timeline.value(0.5, function (a, b, t) {
  t = expoOut(t) // remap time
  return lerpArray(a, b, t)
})
```

#### `keys.next(timeStamp)` 
#### `keys.previous(timeStamp)`

This is useful for jumping left and right in a timeline editor. From the given time stamp, it will return the next keyframe to the left or right. If none exist (i.e. we are at the bounds already) then null will be returned.

#### `keys.add(frame)`

Adds a "keyframe" object (which has `time` and `value` properties). When a new frame is added, the list is re-sorted. For bulk adds, you may want to access the `frames` object directly.

#### `keys.splice(index, howmany, item1, ..., itemX)`

Similar to `Array.splice`, this allows you to remove or insert keyframes within the array. If new keyframes have been inserted, the list will be re-sorted. 

#### `keys.sort()`

To be called when you manually change the underlying `frames` structure (i.e. after a bulk add).

#### `keys.clear()`

Clears the list of keyframes.

#### `keys.frames`

The underlying array that holds keyframes.

#### `keys.count`

A getter for `keys.frames.length`.

#### `keys.interpolation(time)`

This is a more advanced method that returns the start and end indices and interpolation factor for a time stamp. The return value is an array with the following format: 

```js
[startFrameIndex, endFrameIndex, interpolationFactor]
```

If we are sitting on a keyframe, then start and end indices will be equal. If we have no keyframes, both indices will be -1.

The returned array is *re-used* to reduce GC load. You should not store reference to it since it will change with subsequent calls. 

This is useful for tools that wish to separate the easing function (i.e. remap the value of t using [eases](https://nodei.co/npm/eases/)) from a user-defined interpolator (i.e. interpolating objects with `{x, y}` properties). 

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/keyframes/blob/master/LICENSE.md) for details.
