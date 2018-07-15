import React from 'react'
import PropTypes from 'prop-types'
import isFunction from 'lodash/isFunction'
import uniq from 'lodash/uniq'
import { bindEvents } from './events'
import { TransitionText } from './transition'

const textSharedPropTypes = {
    transition: PropTypes.shape({
        enable: PropTypes.bool,
        transitionOn: PropTypes.arrayOf(PropTypes.string),
        duration: PropTypes.number,
        onEnter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        onLeave: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    }),
    xScale: PropTypes.func,
    yScale: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    xBandwidth: PropTypes.number,
    yBandwidth: PropTypes.number,
    pivot: PropTypes.bool,
    styles: PropTypes.shape({
        stroke: PropTypes.string
    }),
    showValue: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
    yOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number])
}

export class Text extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        ...textSharedPropTypes   
    }

    static defaultProps = {
        xOffset: 0,
        yOffset: 0,
        transition: {}
    }

    render() {
        let { data,
            xScale,
            yScale,
            width,
            height,
            xBandwidth,
            yBandwidth,
            xOffset,
            yOffset,
            pivot,
            styles,
            showValue,
            transition } = this.props
        let { width: textWidth } = styles

        xOffset = isFunction(xOffset) ? xOffset(xBandwidth, textWidth) : xOffset
        yOffset = isFunction(yOffset) ? yOffset(yBandwidth, textWidth) : yOffset

        
        return data.map((item, index) =>
            showValue &&
            <TransitionText
                key={`${item.name}-${item.value}-${item.order || ''}`}
                className='value'
                x={pivot ? xScale(item.value) + xOffset : xScale(item.name) + xOffset}
                y={pivot ? yScale(item.name) + yOffset : yScale(item.value) + yOffset}
                {...styles}
                text={isFunction(showValue)? showValue(item.value) : item.value}
                transitionOn={transition.transitionOn}
                enable={transition.enable}
                duration={transition.duration}
                onEnter={isFunction(transition.onEnter) ? transition.onEnter(width, height) : transition.onEnter}
            />
        )
    }
}

export class GroupText extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        ...textSharedPropTypes
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { data, pivot, styles, showValue, transition, xOffset, yOffset, ...restProps } = this.props
        let names = uniq(data.map(d => d.name))

        return names.map((name, groupIndex) => {
            let group = data.filter(d => d.name === name)
            group.sort(compare)

            return group.map((d, i) => {
                let offset = (bandwidth, textWidth) => (bandwidth - textWidth * group.length) / 2 + i * textWidth + textWidth / 2

                return (
                    <Text
                        key={`${d.name}-${d.value}-${d.order}`}
                        index={groupIndex}
                        data={[d]}
                        xOffset={pivot ? xOffset : offset}
                        yOffset={pivot ? offset : yOffset}
                        pivot={pivot}
                        styles={styles}
                        showValue={showValue}
                        transition={transition}
                        {...restProps}
                    />
                )
            })
        })
    }
}

function compare(a, b) {
    return a.order - b.order
}