import React, { Component } from 'react';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

import FundsTable from './FundsTable';
import FundsBubbleChart from './FundsBubbleChart';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <FundsBubbleChart />
        <FundsTable />
      </div>
    );
  }
}

export default App;
