import React, {Component} from 'react';
import BasicDataGrid from './BasicDataGrid';
import CloudServiceDataGrid from './CloudServiceDataGrid';
import RestServiceDataGrid from './RestServiceDataGrid';


export default class DataGrid extends Component {

  getDataGrid = () => {
    if (this.cloudDataGrid) {
      return this.cloudDataGrid.getDataGrid();
    }

    if (this.restDataGrid) {
      return this.restDataGrid.getDataGrid();
    }

    if (this.basicDataGrid) {
      return this.basicDataGrid.getWrappedComponent();
    }
    return null;
  }

  render(){
    const {actions, data} = this.props;
    if(actions && data.params[0]['__request']) {
      return <CloudServiceDataGrid ref={c => { this.cloudDataGrid = c; }} {...this.props} dataGridType="cloud" />
    } else if(actions && data.params) {
      return <RestServiceDataGrid ref={c => { this.restDataGrid = c; }} {...this.props} dataGridType="rest" />
    }

    return <BasicDataGrid ref={c => { this.basicDataGrid = c; }} {...this.props} />

  }

}