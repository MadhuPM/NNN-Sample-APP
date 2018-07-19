import React, { Component } from 'react';
import * as d3 from "d3";
import './barchart.css'
/* import data from './data/barchart.json'; */


export default class FundsBarChart extends Component {
    constructor() {
        super();
    }

    componentDidMount() {
        let svg = d3.select("svg"),
            margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom;

        let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
            y = d3.scaleLinear().rangeRound([height, 0]);

        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json("barchart.json", function (error, data) {

            data.forEach(function (d) {
                d.x = d.x;
                d.y = d.y;
            });

            x.domain(data.map(function (d) { return d.x; }));
            y.domain([0, d3.max(data, function (d) { return d.y; })]);

            g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            g.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y).ticks(10, ""))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("text-anchor", "end")
                .text("Frequency");

            g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) { return x(d.x); })
                .attr("y", function (d) { return y(d.y); })
                .attr("width", x.bandwidth())
                .attr("height", function (d) { return height - y(d.y); });
        });
    }

    render() {

        return (
            <div className="App">
                <svg width="960" height="500"></svg>
            </div>
        );
    }
}
