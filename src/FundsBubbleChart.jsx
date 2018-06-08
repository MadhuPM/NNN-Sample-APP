import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from "d3";
import funds_data from './data/funds.json';
import RealTimeMultiChart from './d3_util/RealTimeMultiChart';
import './d3_util/d3_chart.css';

const funds = _.sortBy(funds_data, ["Predicted_Time"])

class FundsBubbleChart extends Component {
    constructor() {
        super();
        this.state = {
            chart: []
        };
        this.colors = ["green", "yellow", "red"];
        this.i=-1;
    }

    componentWillMount() {
        const chart = RealTimeMultiChart()
            .title("Chart Title")
            .yTitle("Categories")
            .xTitle("Time")
            .yDomain(["Predicted_Time", "AlertTime", "Max_PredictedTime"]) // initial y domain (note array)
            .border(true)
            .width(900)
            .height(350);

        this.setState({ chart });

        console.log('this.state.chart', chart.version);

        // mean and deviation for generation of time intervals
        const tX = 5; // time constant, multiple of one second
        const meanMs = 1000 * tX, // milliseconds
            dev = 200 * tX; // std dev
        // define time scale
        this.timeScale = d3.scaleLinear()
            .domain([300 * tX, 1700 * tX])
            .range([300 * tX, 1700 * tX])
            .clamp(true);
        // define function that returns normally distributed random numbers
        this.normal = d3.randomNormal(meanMs, dev);
        // define color scale
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        // in a normal use case, real time data would arrive through the network or some other mechanism
        this.timeout = 0;
    }

    componentDidMount() {
        // invoke the chart
        const chartDiv = d3.select("#viewDiv").append("div")
            .attr("id", "chartDiv")
            .call(this.state.chart);

        // configure the data generator  
        this.dataGenerator();
    }

    dataGenerator = () => {
        if (this.state.chart == null || this.state.chart == 'undefined') return;
        
        const shapes = ["rect", "circle"];
        setTimeout(() => {
            // add categories dynamically
            this.i++;
            /*switch (d) {
                case 5:
                    this.state.chart.yDomain(["Category1", "Category2"]);
                    break;
                case 10:
                    this.state.chart.yDomain(["Category1", "Category2", "Category3"]);
                    break;
                default:
            } */
            // output a sample for each category, each interval (five seconds)
            if (this.state.chart != null && this.state.chart != undefined && this.state.chart != '') {
                this.state.chart.yDomain().forEach((cat, i) => {
                    //console.log('cat, i', cat, i)
                    // create randomized timestamp for this category data item
                    const d = new Date();
                    const now = new Date(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${funds[this.i][cat]}`);
                    console.log('now', now);
                    //const now = new Date(new Date().getTime() + (+funds[d][cat]));
                    // create new data item
                    let obj;
                    const doSimple = false;
                        obj = {
                            // complex data item; four attributes (type, color, opacity and size) are changing dynamically with each iteration (as an example)
                            time: now,
                            color: this.colors[i],
                            opacity: Math.max(Math.random(), 0.3),
                            category: cat,
                            //type: shapes[Math.round(Math.random() * (shapes.length - 1))], // the module currently doesn't support dynamically changed svg types (need to add key function to data, or method to dynamically replace svg object – tbd)
                            type: "circle",
                            size: Math.max(Math.round(Math.random() * 12), 4),
                        };
                    // send the datum to the chart
                    this.state.chart.datum(obj);
                });
            }
            // drive data into the chart at average interval of five seconds
            // here, set the timeout to roughly five seconds
            //this.timeout = Math.round(this.timeScale(this.normal()));
            this.timeout=500*this.i;
            // do forever
            this.dataGenerator();
        }, this.timeout);
    }

    render() {
        return (
            <div className="App">
                <h1 className="App-title">Funds Bubble Chart</h1>
                <div id="viewDiv">

                </div>
            </div>
        );
    }
}

export default FundsBubbleChart;
