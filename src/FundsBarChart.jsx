import React, { Component } from 'react';
import BarChart from './components/Chart/BarChart';
import LineChart from './components/Chart/LineChart';
import data from './data/barchart.json';


export default class FundsBarChart extends Component {
    constructor() {
        super();
    }

    render() {

        return (
            <div className="App">
                <h1 className="App-title">Funds BarChart</h1>
                <BarChart data={data} />
                <LineChart data={data} />
            </div>
        );
    }
}
