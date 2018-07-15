import cloneDeep from 'lodash/cloneDeep'

export function assignStyle(original, obj = {}) {

    if (Array.isArray(original) && Array.isArray(obj)) return obj

    //let result = Object.assign({},original)
    let result = cloneDeep(original)

    for (let key in obj) {
        let prop = result[key]
        result[key] = typeof prop === 'object' && typeof obj === 'object' ? assignStyle(prop, obj[key]) : obj[key]
    }

    return result
}

export function autoRange(array) {
    let max = Math.max.apply(null, array)
    max = Math.ceil(max * 1.2)
    return [0, max]
}

export function niceNumberArray(arr=[]) {
    try{
        let isNumberArray = true

        arr.forEach(i=>{
            if(typeof i !== 'number') isNumberArray = false
        })

        if(!isNumberArray) return arr

        let len = 0, maxLen = 2
        //get the len of digital part
        arr.forEach(i=>{
            let str = i.toString()
            let _len = str.indexOf('.') > 0? str.split('.')[1].length : 0
            len = Math.max(len, _len)
        })

        let niced = arr.map(i=>i.toFixed(len > maxLen? maxLen : len))

        return niced
    }
    catch(e) {
        return arr
    }
}

export function delay(on, func) {
    if(!delay.queue) delay.queue = {}
    if(!delay.queue[on]) delay.queue[on] = []

    delay.queue[on].push(func)

    setTimeout(function(){
        let task = delay.queue[on].shift()
        //only execute the last task
        if(delay.queue[on].length === 0){
            task()
        }
    },200)
}

export function isNumberOrNumberString(value) {
    switch (value) {
        case '': return false;
        case null: return false;
        case undefined: return false;
        default: return isFinite(value)
    }
}

export function inject(object, objectFuncName, func) {
    let original = object && object[objectFuncName]

    return Object.assign({}, object, {
        [objectFuncName]: function () {
            func(...arguments)
            if (typeof original === 'function') {
                original(...arguments)
            }
        }
    })
}

const isIE = /*@cc_on!@*/false || !!document.documentMode

export function animationFrame(f) {
    if (isIE) {
        setTimeout(f, 1000 / 60)
    }
    else {
        window.requestAnimationFrame(f)
    }
}