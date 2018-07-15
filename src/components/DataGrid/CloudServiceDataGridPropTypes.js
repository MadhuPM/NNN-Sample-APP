import DataGridPropTypes from './DataGridPropTypes';
import PropTypes from 'prop-types'

export const CloudServiceDataGridPropTypes = {
  ...DataGridPropTypes,
  onSortFilter: PropTypes.func,
  showPage: PropTypes.func,
  startIndex: PropTypes.number,
  totalCount: PropTypes.number,
  limit: PropTypes.number,
  columns: PropTypes.array,
  data: PropTypes.object,
  actions: PropTypes.object.isRequired,
  excelExport: PropTypes.bool,
  csvExport: PropTypes.bool,
  pdfExport: PropTypes.bool
};
