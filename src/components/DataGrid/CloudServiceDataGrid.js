import React, {PropTypes, Component} from 'react';
import {CloudServiceDataGridPropTypes} from './CloudServiceDataGridPropTypes';
import BasicDataGrid from './BasicDataGrid';
import {serializeCloudFilter} from './serializeCloudFilter';
import {cloudExportExcel, cloudExportPdf, cloudExportCsv} from './CloudServiceExport';
import {getFormUrlencodedParams} from '../util/formatters.js';

export default class CloudServiceDataGrid extends Component {
  constructor(props) {
    super(props);
    this.cloudSort = false;
    this.firstPageSort = undefined;
  }

  getDataGrid = () => {
    if (this.DataGrid) {
      return this.DataGrid.getWrappedComponent();
    }
    return null;
  }

  excelExport = (params, columns) => {
	  if(this.sortFilterParams){
		  let dateFields = [];
		  let dateTimeFields = [];
		  let bigDecimalFields = [];

		  if (columns && columns.length > 0) {
			  dateFields = columns.filter(col => col.dataType === 'date').map(col => col.dataKey);
			  dateTimeFields = columns.filter(col => col.dataType === 'datetime').map(col => col.dataKey);
			  bigDecimalFields = columns.filter(col => col.dataType === 'bigdecimal').map(col => col.dataKey);
		  }
		  const urlEncodedParams = this.sortFilterParams.map(
				    paramObj => getFormUrlencodedParams(paramObj, dateFields, dateTimeFields, bigDecimalFields)).join('&');

		  fetch('./json',
				  {method: 'post',
				    headers: {
				      'Accept': 'application/json',
				      'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
				    body: urlEncodedParams,
				    credentials: 'include',
				    mode: 'cors'
				    }
		  ).then(response => {
			  const paramArray = (Array.isArray(params) ? params : [params]).slice();
			  const params0 = {...paramArray[0]}
			  params0.__rid = this.sortFilterParams[0].__rid
			  paramArray[0] = params0
			  cloudExportExcel(paramArray, columns)
		  })
	  }else{
		  cloudExportExcel(params, columns)
	  }
  }


  render() {
    const {actions = {}, data = {},
      columns, excelExport, csvExport, pdfExport, scrollLimit} = this.props;
    const {params = [], metadata = {}, loading = false} = data;
    let {limit, start_index: startIndex, total_count: totalCount} = metadata;
    let paramArray = (Array.isArray(params) ? params : [params]).slice();
    let {onSortFilter, showPage, refresh} = this.props;

    const {cdtGridFavoritesData, cdtGridFavoritesDataActions} = this.props;

    const getSortFilterParams = (sortConfigArray = [], filterConfigArray = [], conjunction) => {
      const params = paramArray.slice();
      const strSort = sortConfigArray.map((config) => {
        return config.asc ? config.sort : `-${config.sort}`;
      }).join(',');

      const strFilter = serializeCloudFilter(filterConfigArray, columns, conjunction);
      const {__filter_config: origFilter, start} = params[0];
      const begin = strFilter === origFilter ? start : 0;

      params[0] = {
        ...params[0],
        __sort_config: strSort,
        __filter_config: strFilter,
        start: begin
      };
      return params;
    };

    if (limit) {
      onSortFilter = (sortConfigArray = [], filterConfigArray = [], conjunction) => {
        paramArray = getSortFilterParams(sortConfigArray, filterConfigArray, conjunction);
        this.cloudSort = true;
        actions.loadList(paramArray).then(() => {this.cloudSort = false});
      };

      showPage = (pageNo) => {
        paramArray[0] = {...paramArray[0], start: (pageNo - 1) * limit};
        console.log("cloudshowpage")
        console.log(paramArray[0]);
        actions.loadList(paramArray);
      };
    } else {
      if (!onSortFilter) {
    	  onSortFilter = (sortConfigArray = [], filterConfigArray = [], conjunction) => {
    		  const params = getSortFilterParams(sortConfigArray, filterConfigArray, conjunction)
    		  const params0 = {...params[0]}
    		  params0.__rid = new Date().getTime()
    		  this.sortFilterParams = params.slice()
    		  this.sortFilterParams[0] = params0
    	  };
      }
      limit = this.props.limit;
      startIndex = this.props.startIndex;
      totalCount = this.props.totalCount;
    }

    let sortFilterFunc = undefined;
    if(scrollLimit && onSortFilter) {
      sortFilterFunc = (sortConfigArray = [], filterConfigArray = [], conjunction) => {
        return onSortFilter(sortConfigArray, filterConfigArray, conjunction, true);
      }
    }

    if (!refresh) {
      refresh = (refreshParams = []) => {
        actions.refresh(refreshParams);
      };
    }

    return (
      <BasicDataGrid {...this.props} ref={(c) => { this.DataGrid = c; }}
        params={params}
        data={data.data}
        pageSize={limit}
        refresh={refresh}
        isLoading={loading}
        totalCount={totalCount}
        startRow={startIndex}
        onSortFilter={sortFilterFunc ? sortFilterFunc : onSortFilter}
        onExportExcel={excelExport ? this.excelExport : undefined}
        onExportPdf={pdfExport ? cloudExportPdf : undefined}
        onExportCsv={csvExport ? cloudExportCsv : undefined}
        showPage={showPage}
      	gridFavoriteActions={cdtGridFavoritesDataActions}
        gridFavorite={cdtGridFavoritesData}
        cloudSort={this.cloudSort}
      />
    );
  }
}

CloudServiceDataGrid.propTypes = CloudServiceDataGridPropTypes;
