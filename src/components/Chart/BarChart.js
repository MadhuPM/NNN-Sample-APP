import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, Bar, XAxis, YAxis, Container, containerCommonPropTypes, extractContainerCommonProps, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'
import { Text } from './common/text'
import { Label } from './common/label'

const defaultStyles = {
    bar: {
        width: 45,
        fill: '#F56D00'
    },
    axis: {
        stroke: 'black'
    },
    text: {
        textAnchor: 'middle'
    }
}

export default class BarChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        range: PropTypes.array,
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object,
        showValue: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string
    }

    static defaultProps = {
        width: 500,
        height: 500,
        data: [],
        dataMapper: item => item,
        showValue: false
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data, dataMapper, events, range, showValue, styles, ...restProps} = props 
        styles = assignStyle(defaultStyles, styles)

        return (
            <Container {...containerProps}>
                <ShareProps
                    data={data}
                    dataMapper={dataMapper}
                    xScale={scaleBand()}
                    xDomain={data => data.map(d => d.name)}
                    yScale={scaleLinear()}
                    yDomain={range || (data => autoRange(data.map(d => d.value)))}
                    {...restProps}
                >
                    <XAxis orientation='bottom' domainAlignment={'middle'} tickSize={0} styles={styles.axis}/>
                    <YAxis orientation='left' tickSize={0} styles={styles.axis}/>
                    <Bar xOffset={(bandwidth, barWidth) => (bandwidth - barWidth) / 2} styles={styles.bar} events={events} />
                    <Text xOffset={bandwidth => bandwidth / 2} yOffset={-10} styles={styles.text} showValue={showValue}/>
                </ShareProps>
            </Container>
        )
    }
}
