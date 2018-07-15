import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { XAxis, YAxis, Container, Legend, StackedBar, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'
import uniq from 'lodash/uniq'
import groupBy from 'lodash/groupBy'

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

export default class ColumnPercentageChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object,
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string
    }

    static defaultProps = {
        width: 500,
        height: 500,
        dataMapper: item => item,
        legendX: (width, height) => width + 10,
        legendY: 0
    }

    constructor(props) {
        super(props)
        this.state = this.getInitState()
    }

    getInitState() {
        let { data, dataMapper } = this.props
        data = data.map(dataMapper)
        data = flatTwoDimensionArray(data)
        data = data.map(addOrderProperty)
        data = toPercentageArray(data)
        
        return {
            originalData: data,
            enableTransition: false
        }
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
                    yDomain={[0, 100]}
                    {...restProps}
                >
                    <XAxis tickSize={0} domainAlignment='middle' styles={styles.axis} />
                    <YAxis tickSize={0} styles={styles.axis} />
                    <StackedBar
                        styles={styles.stackedBar}
                        events={events}
                        transition={{
                            enable: this.state.enableTransition,
                            transitionOn: ['x', 'y', 'width', 'height'],
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

function toPercentageArray(data) {
    let names = uniq(data.map(d => d.name)),
        reducer = (accumulator, current) => accumulator + current.value,
        result = [],
        sumMap = {}

    names.forEach(name=>{
        let sum = data.filter(d => d.name === name).reduce(reducer,0)
        sumMap[name] = sum
    })

    result = data.map(d=>{
        return { name: d.name, value: d.value / sumMap[d.name] * 100, order: d.order }
    })

    return result
}