import React from 'react'
import PropTypes from 'prop-types'
import { bindEvents } from './events'
import uniq from 'lodash/uniq'
import { TransitionRect, transitionPropTypes } from './transition'

export class StackedBar extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        width: PropTypes.number,
        height: PropTypes.number,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        styles: PropTypes.shape({
            width: PropTypes.number,
            colors: PropTypes.arrayOf(PropTypes.string)
        }),
        transition: transitionPropTypes
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { data, events, xScale, yScale, height, xBandwidth, styles, transition } = this.props,
            { colors, width } = styles,
            xOffset = (xBandwidth - width) / 2,
            reducer = (accumulator, current) => accumulator + current.value,
            compare = (a, b) => a.order - b.order

        let names = uniq(data.map(d => d.name))

        return names.map((name, groupIndex) => {
            let items = data.filter(d => d.name == name).sort(compare)

            return items.map((item, index, arr) => {
                let a = arr.slice(0, index)
                let b = arr.slice(0, index + 1)

                let bottom = a.reduce(reducer, 0)
                let top = b.reduce(reducer, 0)

                let yBottom = yScale(bottom)
                let yTop = yScale(top)

                let _events = bindEvents(events, item, index, groupIndex)

                return (
                    <TransitionRect 
                        key={`${index}`}
                        className='bar'
                        x={xScale(item.name) + xOffset}
                        y={yTop}
                        width={width}
                        height={height - yTop - height + yBottom}
                        fill={colors[index % colors.length]}
                        {..._events}
                        transitionOn={transition.transitionOn}
                        enable={transition.enable}
                        duration={transition.duration}
                        onEnter={transition.onEnter}
                    />
                )
            })

        })
    }
}