import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, Bubble, Grids, XAxis, YAxis, Container, Legend, containerCommonPropTypes, containerCommonDefaultProps, extractContainerCommonProps, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'

const colors = [
    '#9F3AB7', '#F8984C', '#F56D00',
    '#D4A6DE', '#BB75CC', '#9F3AB7',
    '#B9E8F5', '#92DBEF', '#64CCE9',
    '#A39491', '#6F5953', '#000000'
]

const defaultStyles = {
    axis: {
        stroke: 'black'
    },
    legend: {
        width: 15,
        height: 15,
        colors: colors
    },
    grid: {
        stroke: '#CDCDCD'
    },
    bubble: {
        colors: colors
    }
}

const PLACE_HOLDER = ''


export default class BubbleChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            radius: PropTypes.number
        })),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        range: PropTypes.array,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object
    }

    static defaultProps = {
        width:500,
        height:500,
        padding: 30,
        data: [],
        dataMapper: item => item,
        legendX: (width, height) => width + 10,
        legendY: 0
    }

    constructor(props) {
        super(props)
        this.state = this.getInitState()
    }

    getVisiblebData() {
        let result = []
        let state = this.state
        let { originalData } = state
        
        originalData.forEach((d,i) => {
            if (!state[i] || state[i] !== 'hide') {
                result.push(d)
            }
            else {
                result.push(Object.assign({}, d, { value: 0 }))//set value to 0 to hide the bar
            }    
        })

        return result
    }

    getVisibleStyles() {
        let getColors = (color, i) => this.state[i] && this.state[i] === 'hide' ? 'transparent' : color
        let styles = assignStyle(defaultStyles, this.props.styles)

        //get visible colors
        styles.bubble.colors = styles.bubble.colors.map(getColors)

        return styles
    }

    getInitState() {
        let { data, dataMapper } = this.props
        data = data.map(dataMapper)
        
        return {
            originalData: data,
            enableTransition: false
        }
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data: _data, dataMapper, events, range, styles: _styles, legendData, legendX, legendY, ...restProps } = props

        let data = this.getVisiblebData()
        let styles = this.getVisibleStyles()
        
        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    xScale={scaleBand()}
                    xDomain={data => data.map(d => d.name).concat(PLACE_HOLDER)}
                    yScale={scaleLinear()}
                    yDomain={range || (data => autoRange(data.map(d => d.value)))}
                    {...restProps}
                >
                    <Grids 
                        xGrid
                        yGrid
                        styles={styles.grid}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x1','y1','x2','y2'],
                            onEnter: { 'y1': -100, 'y2': -100 },
                            duration: 300
                        }}
                    />
                    <XAxis tickSize={0} domainAlignment='end' styles={styles.axis}/>
                    <YAxis 
                        tickSize={0} 
                        styles={styles.axis}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x','y'],
                            onEnter: { 'y': -100 },
                            duration: 300
                        }}
                    />
                    <Bubble 
                        styles={styles.bubble} 
                        events={events}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['cx','cy','r','fill'],
                            duration: 300
                        }}
                    />
                    <Legend 
                        legendData={legendData} 
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
                    />
                </ShareProps>
            </Container>
        )
    }
}
