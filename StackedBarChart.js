
import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, XAxis, YAxis, Container, Legend, StackedBar, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import groupBy from 'lodash/groupBy'
import uniq from 'lodash/uniq'
import max from 'lodash/max'
import sum from 'lodash/sum'
import { ShareProps } from './common/propsHelper'

const colors = ['#F56D00', '#9F3AB7', '#64CCE9']

const defaultStyles = {
    stackedBar: {
        width:45,
        colors: colors
    },
    axis: {
        stroke: 'black'
    },
    legend: {
        width: 15,
        height: 15,
        colors: colors
    }
}

export default class StackedBarChart extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        events: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
        dataMapper: PropTypes.func,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        range: PropTypes.array,
        styles: PropTypes.object,
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string
    }

    static defaultProps = {
        dataMapper: item => item,
        legendX: (width, height) => width + 10,
        legendY: 0,
        width: 500,
        height: 500
    }

    constructor(props) {
        super(props)
        this.state = this.getInitState()
    }

    getVisibleData() {
        let result = []
        let state = this.state
        let { originalData } = state
        let groupData = groupBy(originalData, 'name')

        Object.keys(groupData).forEach(groupName => {
            groupData[groupName].forEach((d,i) => {
                if (state[i] && state[i] === 'hide') {
                    //set value to zero to re calculate value range
                    result.push(Object.assign({}, d, { value: 0 }))
                }
                else {
                    result.push(d)
                }
            })
        })
        return result
    }

    getVisibleStyles() {
        return assignStyle(defaultStyles, this.props.styles)
    }

    getInitState() {
        let { data, dataMapper } = this.props
        data = data.map(dataMapper)
        data = flatTwoDimensionArray(data)
        data = data.map(addOrderProperty)
        
        return {
            originalData: data,
            enableTransition: false
        }
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data: _data, dataMapper, events, range, styles: _styles, legendData, legendX, legendY, ...restProps } = props
        let data = this.getVisibleData()
        let styles = this.getVisibleStyles()

        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    xScale={scaleBand()}
                    xDomain={data => uniq(data.map(d => d.name))}
                    yScale={scaleLinear()}
                    yDomain={range || calculateValueRange}
                    {...restProps}
                >
                    <XAxis tickSize={0} domainAlignment='middle' styles={styles.axis} />
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
                    <StackedBar 
                        styles={styles.stackedBar} 
                        events={events}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x','y','width','height'],
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

function flatTwoDimensionArray(data) {
    let result = []
    data.forEach(i => {
        if (Array.isArray(i)) {
            result = result.concat(i)
        }
        else {
            result.push(i)
        }
    })
    return result
}

function addOrderProperty(d, i) {
    return Number.isInteger(d.order) ? d : Object.assign(d, { order: i })
}

function calculateValueRange(data) {
    let values = [],
        maxValue = 0,
        names = uniq(data.map(d => d.name))

    names.forEach(name => {
        let arr = data.filter(i => i.name == name).map(i => i.value)
        values.push(sum(arr))
    })

    maxValue = max(values)

    return [0, Math.ceil(maxValue * 1.2)]
}