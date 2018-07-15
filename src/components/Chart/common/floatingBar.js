import React from 'react'
import PropTypes from 'prop-types'
import { bindEvents } from './events'

export class FloatingBar extends React.Component {
    static get propTypes() {
        return {
            data: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
                begin: PropTypes.number,
                end: PropTypes.number
            })),
            events: PropTypes.object,
            xScale: PropTypes.func,
            yScale: PropTypes.func,
            xBandwidth: PropTypes.number,
            yBandwidth: PropTypes.number,
            xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
            styles: PropTypes.object
        }
    }

    render() {
        let { data, events, xScale, xBandwidth, styles, yScale, xOffset } = this.props,
            { colors, bar, cap } = styles,
            barWidth = bar.width,
            increase = (begin, end) => end >= begin ? true : false

        xOffset = typeof xOffset === 'function' ? xOffset(xBandwidth, barWidth) : xOffset

        return (
            <g>
                {
                    data.map((item, index) => {
                        let _events = bindEvents(events, item, index)
                        return (
                            <rect key={`${item.name}-${index}-bar`}
                                className='bar'
                                width={barWidth}
                                x={xScale(item.name) + xOffset}
                                y={increase(item.begin, item.end) ? yScale(item.end) : yScale(item.begin)}
                                height={Math.abs(yScale(item.end) - yScale(item.begin))}
                                fill={increase(item.begin, item.end) ? colors[0] : colors[1]}
                                {..._events}
                            />
                        )
                    })
                }
                {
                    data.map((item, index) => {
                        return (
                            <rect key={`${item.name}-${index}-cap`}
                                className='cap'
                                width={barWidth}
                                height={cap.height}
                                x={xScale(item.name) + xOffset}
                                y={increase(item.begin, item.end) ? yScale(item.end) : yScale(item.end) - cap.height}
                                fill={increase(item.begin, item.end) ? colors[2] : colors[3]}
                            />
                        )
                    })
                }
            </g>
        )
    }
}