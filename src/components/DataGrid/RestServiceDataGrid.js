import React, {PropTypes, Component} from 'react';
import BasicDataGrid from './BasicDataGrid';

export default class RestServiceDataGrid extends Component {

  constructor(props) {
    super(props);
    this.firstPageSortFilter = undefined;
  }

  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
    const {params = []} = data;

    // if(params[0]) {
    //   if(params[0].start === 0 || this.firstPageSortFilter) this.firstPageSortFilter = false;
    // }
  }


  getDataGrid = () => {
    if (this.DataGrid) {
      return this.DataGrid.getWrappedComponent();
    }
    return null;
  }

  render() {
    const {actions = {}, data = {}, onClientRefresh, onSortFilter, scrollLimit} = this.props;
    const {params = [], loading = false} = data;
    let sortFilterFunc = undefined;
    let refresh = undefined;

    if (!onClientRefresh) {
      refresh = (refreshParams = []) => {
        actions.refresh(refreshParams);
      };
    }

    if(scrollLimit && onSortFilter) {
      sortFilterFunc = (sortConfigArray = [], filterConfigArray = [], conjunction, sortType) => {
        // if (sortType === "headerSort") {
        //   this.firstPageSort = true;
        // }
        this.firstPageSort = scrollLimit ? true : false;
        return onSortFilter(sortConfigArray, filterConfigArray, conjunction, this.firstPageSort);
      }
    }

    return (
      <BasicDataGrid {...this.props} ref={(c) => { this.DataGrid = c; }}
        params={params}
        data={data.data}
        refresh={refresh}
        isLoading={loading}
        onSortFilter={sortFilterFunc}
      />
    );
  }
}

