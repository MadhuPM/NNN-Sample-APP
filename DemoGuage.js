import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import SupportGuage from 'SupportGuage';

class Application extends React.Component {
    render() {
      const sectionsProps = [
              { fill: '#FA9F30', stroke: '#FA9F30' },
              { fill: '#F46806', stroke: '#F46806' },
              { fill: '#DB312D', stroke: '#DB312D' }
          ];
      return   <div>
                  <svg width={this.props.width} height={this.props.height} >
                      <SupportGuage width={500} height={400} sections={sectionsProps}/>
                  </svg>
              </div>
    }
  }
  
/*
 * Render the above component into the div#app
 */
//React.render(<Application />, document.getElementById('app'));