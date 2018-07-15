import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, FloatingBar, Grids, XAxis, YAxis, Container, containerCommonPropTypes, containerCommonDefaultProps, extractContainerCommonProps, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'

const defaultStyles = {
    floatingBar: {
        bar: {
            width:45,
            fill:'#F56D00'
        },
        cap: {
            height: 2
        },
        colors: ['#DFE9E3','#F5DCDD','#277239','#BE0820']
    },
    axis: {
        stroke: 'black'
    },
    grid: {
        stroke: '#CDCDCD'
    }
}

export default class FloatingChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            begin: PropTypes.number,
            end: PropTypes.number
        })),
        events: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
        dataMapper: PropTypes.func,
        range: PropTypes.array,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object
    }

    static defaultProps = {
        width: 800,
        height: 600,
        dataMapper: item => item
    }

    render() {
        let { containerProps, ...props } = extractContainerCommonProps(this.props)
        let { data, dataMapper, range, styles, ...restProps } = props

        styles = assignStyle(defaultStyles, styles)

        return (<Container {...containerProps}>
                    <ShareProps
                        data={data}
                        dataMapper={dataMapper}
                        xScale={scaleBand()}
                        xDomain={data => data.map(d => d.name)}
                        yScale={scaleLinear()}
                        yDomain={range || (data => autoRange(data.map(d => Math.max(d.begin, d.end))))}
                        {...restProps}
                    >
                        <Grids yGrid styles={styles.grid}/>
                        <XAxis tickSize={10} domainAlignment='middle' tickAlignment='middle' styles={styles.axis}/>
                        <YAxis tickSize={0} styles={styles.axis}/>
                        <FloatingBar xOffset={(xBandwidth, barWidth) => (xBandwidth - barWidth) / 2} styles={styles.floatingBar}/>
                    </ShareProps>
                </Container>)
    }
}