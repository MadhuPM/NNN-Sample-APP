import {idfDateSerializer, idfDateTimeSerializer} from '../../redux/formatters';

function addHiddenInput(name, value) {
  const downloadForm = document.getElementById('cdtDownloadForm');
  const input = document.createElement('input');
  input.setAttribute('type', 'hidden');
  input.setAttribute('name', name);
  input.setAttribute('value', value);
  downloadForm.appendChild(input);
}

function getStrValue(column, key, value) {
  if (!column) {
    return value;
  }
  if (value === null || typeof value === 'undefined') {
    return '';
  }
  let strVal = '';

  switch (column.dataType) {
    case 'date':
      strVal = value instanceof Date ? idfDateSerializer(value) : value + '';
      break;
    case 'datetime':
      strVal = value instanceof Date ? idfDateTimeSerializer(value) : value + '';
      break;
    default:
      strVal = value + '';
      break;
  }
  return strVal;
}

function getFormat(column) {
  let fmt = null;
  switch (column.dataType) {
    case 'date':
      fmt = 'MM/dd/yyyy';
      break;
    case 'datetime':
      fmt = 'MM/dd/yyyy HH:mm:ss';
      break;
    case 'number':
      fmt = '#,###.00';
      switch (column.numberFormat) {
        case 'percentage':
          fmt = '%#,###.00';
          break;
        case 'currency':
          fmt = '#,###.00';
          break;
        case 'rate':
          fmt = '#,###.0000';
          break;
        case 'integer':
          fmt = '#,###';
          break;
        case 'id':
          fmt = '####';
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
  return fmt ? `Format:${fmt};` : '';
}

function getType(col) {
  let type = 'String';
  switch (col.dataType) {
    case 'date':
    case 'datetime':
      type = 'Date';
      break;
    case 'number':
      type = 'Decimal';
      break;
    default:
      break;
  }

  return type;
}

function getFormatString(columns) {
  const visible = columns.filter(col => !col.hidden);
  return visible.map(col => {
    if (col.hideForExport) {
      return '';
    }
    const format = getFormat(col);
    const type = getType(col);
    return `~NAME=Header:${col.dataKey};ColHdr:${col.label};Type:${type};${format}Hidden:false`;
  }).join('');
}

function cloudExport(params, columns, exportType) {
  let downloadForm = document.getElementById('cdtDownloadForm');
  if (!downloadForm) {
    downloadForm = document.createElement('form');
    downloadForm.setAttribute('id', 'cdtDownloadForm');
    document.body.appendChild(downloadForm);
  }
  // clear any previous elements
  while (downloadForm.firstChild) {
    downloadForm.removeChild(downloadForm.firstChild);
  }
  const exportUrl = exportType === 6 ? './exportpdf' : `${window.context}/export`;
  downloadForm.setAttribute('action', exportUrl);
  downloadForm.setAttribute('method', 'POST');

  addHiddenInput('__exportType', exportType);

  const columnsMap = columns.reduce((obj, col) => {
    obj[col.dataKey] = col;
    return obj;
  }, {});
  const param = Array.isArray(params) ? params[0] : params;
  Object.keys(param).forEach(key => {
    addHiddenInput(key, getStrValue(columnsMap[key], key, param[key]));
  });

  addHiddenInput('__fmtStr', getFormatString(columns));

  downloadForm.submit();
}

export function cloudExportExcel(params, columns) {
  cloudExport(params, columns, 1);
}

export function cloudExportCsv(params, columns) {
  cloudExport(params, columns, 2);
}

export function cloudExportPdf(params, columns) {
  cloudExport(params, columns, 6);
}
