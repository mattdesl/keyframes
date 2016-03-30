//Generic list of keyframes with timestamps and values

var lerp = require('lerp-array')
var range = require('unlerp')
var vec3 = require('gl-vec3/set')

var temp = [0, 0, 0]

function sort(a, b) {
    return a.time - b.time
}

function Keyframes(frames, sorted) {
    if (!(this instanceof Keyframes)) 
        return new Keyframes(frames, sorted)
    this.frames = frames||[]
    if (!sorted)
        this.sort()
}

//Finds the index of the nearest keyframe to the given time stamp.
//If radius is specified, it will return the nearest only within that radius
Keyframes.prototype.nearestIndex = function(time, radius) {
    radius = typeof radius === 'number' ? radius : Number.MAX_VALUE
    var minDist = Number.MAX_VALUE
    var nearest = -1
    for (var i=0; i<this.frames.length; i++) {
        var dist = Math.abs(this.frames[i].time - time)
        if (dist < minDist && dist <= radius) {
            minDist = dist
            nearest = i
        }
    }
    return nearest
}

//Gets the keyframe at the index
Keyframes.prototype.nearest = function(time, radius) {
    var idx = this.nearestIndex(time, radius)
    return idx === -1 ? null : this.frames[idx]
}

//Gets the keyframe at time
Keyframes.prototype.get = function(time) {
    return this.nearest(time, 0)
}

//Gets the keyframe index at time
Keyframes.prototype.getIndex = function(time) {
    return this.nearestIndex(time, 0)
}

//lerps the value at the specified time stamp
//returns null if no keyframes exist
Keyframes.prototype.value = function(time, interpolator, out) {
    var v = this.interpolation(time)
    if (v[0] === -1 || v[1] === -1)
        return null

    var startFrame = this.frames[ v[0] ]
    var endFrame = this.frames[ v[1] ]
    var t = v[2]
    
    //We interpolator from left keyframe to right, with a custom easing
    //equation if specified
    if (typeof interpolator === 'function')
        return interpolator(startFrame, endFrame, t, out)

    //Otherwise we assume the values are simple numbers and lerp them
    return lerp(startFrame.value, endFrame.value, t, out)
}

Keyframes.prototype.interpolation = function(time) {
    if (this.frames.length === 0)
        return vec3(temp, -1, -1, 0)

    var prev = -1
    //get last keyframe to time
    for (var i=this.frames.length-1; i>=0; i--) {
        if (time >= this.frames[i].time) {
            prev = i
            break
        }
    }
    
    //start or end keyframes
    if (prev === -1 || prev === this.frames.length-1) {
        if (prev < 0)
            prev = 0
        return vec3(temp, prev, prev, 0)
    } 
    else {
        var startFrame = this.frames[prev]
        var endFrame = this.frames[prev+1]

        //clamp and get range
        time = Math.max(startFrame.time, Math.min(time, endFrame.time))
        var t = range(startFrame.time, endFrame.time, time)

        //provide interpolation factor
        return vec3(temp, prev, prev+1, t)
    }
}

Keyframes.prototype.next = function(time) {
    if (this.frames.length < 1)
        return null

    var cur = -1
    //get last keyframe to time
    for (var i=0; i<this.frames.length; i++) {
        if (time < this.frames[i].time) {
            cur = i
            break
        }
    }
    return cur===-1 ? null : this.frames[cur]
}

Keyframes.prototype.previous = function(time) {
    if (this.frames.length < 1)
        return null

    var cur = -1
    //get last keyframe to time
    for (var i=this.frames.length-1; i>=0; i--) {
        if (time > this.frames[i].time) {
            cur = i
            break
        }
    }
    return cur===-1 ? null : this.frames[cur]
}

//Adds a frame at the given time stamp
Keyframes.prototype.add = function(frame) {
    this.frames.push(frame)
    this.sort()
}

//convenience for .frames.splice
//if items are inserted, a sort will be applied after insertion
Keyframes.prototype.splice = function(index, howmany, itemsN) {
    this.frames.splice.apply(this.frames, arguments)
    if (arguments.length > 2)
        this.sort()
}

//sorts the keyframes. you should do this after 
//adding new keyframes that are not in linear time
Keyframes.prototype.sort = function() {
    this.frames.sort(sort)
}

//Clears the keyframe list
Keyframes.prototype.clear = function() {
    this.frames.length = 0
}

Object.defineProperty(Keyframes.prototype, "count", {
    get: function() {
        return this.frames.length
    }
})

module.exports = Keyframes