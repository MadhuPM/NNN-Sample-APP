import React from 'react'
import PropTypes from 'prop-types'
import { bindEvents } from './events'
import { TransitionCircle, transitionPropTypes } from './transition'
import max from 'lodash/max'

export class Bubble extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            radius: PropTypes.number
        })),
        events: PropTypes.object,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        color: PropTypes.string,
        styles: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        transition: transitionPropTypes
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { data, events, xScale, yScale, xBandwidth, yBandwidth, styles, transition } = this.props,
            xOffset = xBandwidth

        const getRadius = (value, radius) => {
            let maxValue = max(data.map(i => i.value))
            let maxRadius = Math.min(xBandwidth, yBandwidth)
            let percent = isNaN(radius) ? value / maxValue : radius
            return maxRadius * percent
        }

        //draw bubble
        return (
            data.map((item, index) => {
                let _events = bindEvents(events, item, index)
                return (
                    <TransitionCircle
                        key={`${item.name}-${index}`}
                        className='bubble'
                        r={getRadius(item.value, item.radius)}
                        cx={xScale(item.name) + xOffset}
                        cy={yScale(item.value)}
                        fill={styles.colors[index % styles.colors.length]}
                        {..._events}
                        transitionOn={transition.transitionOn}
                        enable={transition.enable}
                        duration={transition.duration}
                        onEnter={transition.onEnter}
                    />
                )
            })
        )
    }
}