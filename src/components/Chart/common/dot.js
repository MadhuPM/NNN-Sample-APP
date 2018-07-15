import React from 'react'
import PropTypes from 'prop-types'
import uniq from 'lodash/uniq'
import { bindEvents } from './events'
import { TransitionCircle, transitionPropTypes } from './transition'

export class Dot extends React.Component {
    static propTypes = {
        index: PropTypes.number,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        events: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        xBandwidth: PropTypes.number,
        styles: PropTypes.object,
        transition: transitionPropTypes
    }

    static defaultProps = {
        transition: {}
    }

    render() {
        let { xScale, yScale, data, events, xBandwidth, index, styles, transition } = this.props,
            { colors } = styles,
            xOffset = xBandwidth / 2

        return data.map((d, i) => {
            let _events = bindEvents(events, d, i)
            return (
                <TransitionCircle key={`${d.name}-${i}`}
                    className='dot'
                    cx={xScale(d.name) + xOffset}
                    cy={yScale(d.value)}
                    r={styles.circle.r}
                    fill={colors[index % colors.length]}
                    {..._events}
                    transitionOn={transition.transitionOn}
                    enable={transition.enable}
                    duration={transition.duration}
                    onEnter={transition.onEnter}
                />
            )
        })
        
    }
}

export class GroupDot extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            group: PropTypes.string
        })),
        events: PropTypes.object,
        styles: PropTypes.shape({
            line: PropTypes.shape({
                strokeWidth: PropTypes.number
            }),
            circle: PropTypes.shape({
                r: PropTypes.number
            }),
            colors: PropTypes.arrayOf(PropTypes.string)
        }),
        transition: transitionPropTypes
    }

    render() {
        let { data, events, styles, transition, ...restProps } = this.props
        let groups = uniq(data.map(i => i.group))

        return groups.map((group, groupIndex) =>
            <Dot key={`${group}`}
                index={groupIndex}
                data={data.filter(i => i.group === group)}
                styles={styles}
                events={events}
                transition={transition}
                {...restProps}
            />
        )
    }
}