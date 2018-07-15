import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleOrdinal } from 'd3-scale'
import { containerCommonPropTypes } from './container'
import isFunction from 'lodash/isFunction'
import isFinite from 'lodash/isFinite'

export class ShareProps extends React.Component {
    static get propTypes() {
        return {
            data: PropTypes.array,
            dataMapper: PropTypes.func,
            xScale: PropTypes.func,
            yScale: PropTypes.func,
            xAxisName: PropTypes.string,
            yAxisName: PropTypes.string,
            xDomain: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            xRange: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            yDomain: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            xBandwidth: PropTypes.number,
            yBandwidth: PropTypes.number,
            yRange: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            ...containerCommonPropTypes
        }
    }

    render() {
        let {   children, //eslint-disable-line
                data,
                dataMapper,
                xScale,
                xAxisName,
                xDomain,
                xRange,
                xBandwidth,
                yAxisName,
                yScale,
                yDomain,
                yRange,
                yBandwidth,
                width,
                height,
                ...restProps} = this.props;
        
        [].concat(dataMapper).forEach(mapper => {
            if(mapper) data = data.map(mapper)
        })
        

        //API backward compatible
        if (typeof (xAxisName) === 'string' && typeof (yAxisName) === 'string') {
            data = data.map(i => Object.assign({}, i, { name: i[xAxisName], value: i[yAxisName] }))
        }
        //End
        
        let _xTicks, _xBandwidth, _xDomain, _xRange
        

        if(xScale && xDomain) {
            _xDomain = isFunction(xDomain) ? xDomain(data) : xDomain

            xScale.domain(_xDomain)

            _xTicks = getTicks(xScale)

            _xBandwidth = getBandwidth(xBandwidth, _xTicks, width, xScale)

            _xRange = isFunction(xRange) ? xRange(_xBandwidth, _xTicks, width) : xRange || [0, _xBandwidth * _xTicks.length]

            xScale.range(_xRange)
        }

        let _yTicks, _yBandwidth, _yDomain, _yRange
        
        if(yScale && yDomain) {
            _yDomain = isFunction(yDomain) ? yDomain(data) : yDomain

            yScale.domain(_yDomain)

            _yTicks = getTicks(yScale)

            _yBandwidth = getBandwidth(yBandwidth, _yTicks, height, yScale)

            _yRange = isFunction(yRange) ? yRange(_yBandwidth, _yTicks, height) : yRange || [_yBandwidth * _yTicks.length, 0]

            yScale.range(_yRange)
        }

        return React.Children.map(children, component =>
            component && React.cloneElement(component, {
                data,
                xDomain: _xTicks,
                yDomain: _yTicks,
                xScale,
                yScale,
                width,
                height,
                xBandwidth: _xBandwidth,
                yBandwidth: _yBandwidth,
                ...restProps
            })
        )
    }
}

function getTicks(scale) {
    if(scale.ticks) {
        return scale.ticks()
    }

    if(scale.domain) {
        return scale.domain()
    }
}

function getBandwidth(original, ticks, distance, scale) {
    if(isFinite(original)) return original

    if(ticks) return distance / ticks.length

    return 0
}

