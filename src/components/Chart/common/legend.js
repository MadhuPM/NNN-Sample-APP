import React from 'react'
import PropTypes from 'prop-types'
import { bindEvents } from './events'
import classnames from 'classnames'

export class Legend extends React.Component {
    static propTypes = {
        selectable: PropTypes.bool,
        x: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        y: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        width: PropTypes.number,
        height: PropTypes.number,
        legendData: PropTypes.arrayOf(PropTypes.string),
        styles: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number,
            colors: PropTypes.arrayOf(PropTypes.string)
        }),
        events: PropTypes.object
    }

    render() {
        let { events, legendData, x, y, styles, selectable, width, height } = this.props
        let { width: decoratorWidth, colors, ...restStyle } = styles
        let lineSpacing = decoratorWidth * 1.2
        let textStyle = Object.assign({}, restStyle)

        x = typeof x === 'function' ? x(width, height) : x
        y = typeof y === 'function' ? y(width, height) : y


        return legendData ? legendData.map((name, index) =>
            <LegendElement
                events={events}
                index={index}
                key={name}
                name={name}
                x={x}
                y={y + (lineSpacing + styles.height) * index}
                decoratorWidth={styles.width}
                decoratorHeight={styles.height}
                decoratorStyle={{
                    fill: colors[index % colors.length]
                }}
                textStyle={textStyle}
                selectable={selectable}
            />
        ) : null
    }
}

export class LegendElement extends React.Component {
    static defaultProps = {
        events: {}
    }
    
    static propTypes = {
        decoratorWidth: PropTypes.number,
        decoratorHeight: PropTypes.number,
        events: PropTypes.object,
        index: PropTypes.number,
        name: PropTypes.string,
        selectable: PropTypes.bool,
        x: PropTypes.number,
        y: PropTypes.number,
        decoratorStyle: PropTypes.object,
        textStyle: PropTypes.object
    }

    constructor(props) {
        super(props)
        this.state = {
            inactive: false
        }
        this.onToggle = this.onToggle.bind(this)
    }

    onToggle(evt) {
        let { index, name, selectable, events } = this.props

        if (selectable) {
            this.setState({
                inactive: !this.state.inactive
            })
        }
        
        if (events && events.onClick) {
            events.onClick(evt, name, index, this.state.inactive)
        }
    }

    render() {
        let { events, index, name, x, y, decoratorWidth, decoratorHeight, decoratorStyle, selectable, textStyle, ...restProps } = this.props
        let fontSize = decoratorWidth * 1.2
        let className = classnames({
            inactive: this.state.inactive
        })

        let { onClick, ..._events } = events
        _events = bindEvents(_events, name, index)
        

        return [
            <rect className={`legend-decorator ${className}`}
                key={0}
                x={x}
                y={y}
                width={decoratorWidth}
                height={decoratorHeight}
                style={decoratorStyle}
                onClick={this.onToggle} 
                {..._events} 
                {...restProps}
            />,
            <text className={`legend-text ${className}`}
                key={1}
                x={x + decoratorWidth + 10}
                y={y + fontSize * 0.8}
                fontSize={fontSize}
                style={textStyle}
                onClick={this.onToggle} 
                {..._events} 
                {...restProps}
            >
                {name}
            </text>
        ]
        
    }
}