import React from 'react'
import PropTypes from 'prop-types'
import isFunction from 'lodash/isFunction'
import uniq from 'lodash/uniq'
import { bindEvents } from './events'
import { TransitionRect } from './transition'

export class Bar extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
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
        styles: PropTypes.shape({
            width: PropTypes.number,
            fill: PropTypes.string
        }),
        pivot: PropTypes.bool,
        xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        yOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number])
    }

    static defaultProps = {
        xOffset: 0,
        yOffset: 0,
        transition: {}
    }

    render() {
        let { data, events, xScale, yScale, width, height, xBandwidth, yBandwidth, xOffset, yOffset, styles, transition, pivot } = this.props,
            { width: barWidth, fill } = styles

        xOffset = isFunction(xOffset) ? xOffset(xBandwidth, barWidth) : xOffset
        yOffset = isFunction(yOffset) ? yOffset(yBandwidth, barWidth) : yOffset

        return data.map((item, index) => {
            let _events = bindEvents(events, item, index)
            return (
                <TransitionRect key={`${item.name}-${item.value}-${item.order || ''}`}
                    className='bar'
                    x={pivot ? 0 : xScale(item.name) + xOffset}
                    y={pivot ? yScale(item.name) + yOffset : yScale(item.value) + yOffset}
                    height={pivot ? barWidth : height - yScale(item.value)}
                    width={pivot ? xScale(item.value) : barWidth}
                    fill={fill}
                    {..._events}
                    transitionOn={transition.transitionOn}
                    enable={transition.enable}
                    duration={transition.duration}
                    onEnter={isFunction(transition.onEnter) ? transition.onEnter(width, height) : transition.onEnter}
                />
            )
        })
    }
}

export class GroupBar extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        pivot: PropTypes.bool,
        styles: PropTypes.object,
        transition: PropTypes.shape({
            enable: PropTypes.bool,
            transitionOn: PropTypes.arrayOf(PropTypes.string),
            duration: PropTypes.number,
            onEnter: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
            onLeave: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
        })
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { data, events, styles, transition, pivot, ...restProps } = this.props
        let names = uniq(data.map(d => d.name))

        return names.map((name, groupIndex) => {
            let group = data.filter(d => d.name === name)
            group.sort(compare)

            return group.map((d, i) => {
                let offset = (bandwidth, barWidth) => (bandwidth - barWidth * group.length) / 2 + i * barWidth
                let barStyles = {width: styles.width, fill: styles.colors[i]}
                return (
                    <Bar key={`${d.name}-${d.value}-${d.order}`}
                        index={groupIndex}
                        data={[d]}
                        xOffset={pivot ? 0 : offset}
                        yOffset={pivot ? offset : 0}
                        styles={barStyles}
                        pivot={pivot}
                        events={events}
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