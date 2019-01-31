import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

class Radial extends React.Component {
    static propTypes = {
        width: React.PropTypes.number,
        height: React.PropTypes.number,
        innerRadius: React.PropTypes.number,
        outerRadius: React.PropTypes.number,
        startAngle: React.PropTypes.number,
        endAngle: React.PropTypes.number,
        transform: React.PropTypes.string
    };

    render() {

        const arc = d3.arc()
            .innerRadius(this.props.innerRadius)
            .outerRadius(this.props.outerRadius)
            .startAngle(this.props.startAngle)
            .endAngle(this.props.endAngle);

        return (
            <g transform={this.props.transform}>
                <path d={arc()} {...this.props}/>
            </g>
        );
    }
}