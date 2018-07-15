import { Operator } from './Filter';
import { idfFilterDateSerializer, idfFilterDateTimeSerializer } from '../../redux/formatters.js';

function escape(str) {
  return str ? str.replace('/\//g', '.') : '';
}

function getStringCondition(config) {
  switch (config.operator) {
    case Operator.EQUAL_TO:
      return `${config.dataKey}='${config.value}'`;
    case Operator.NOT_EQUAL_TO:
      return `${config.dataKey}!='${config.value}'`;
    case Operator.STARTS_WITH:
      return `${config.dataKey}=/${escape(config.value)}.*/i`;
    case Operator.CONTAINS:
      return `${config.dataKey}=/.*${escape(config.value)}.*/i`;
    case Operator.ENDS_WITH:
      return `${config.dataKey}=/.*${escape(config.value)}/i`;
    case Operator.EQUAL_TO_NULL:
      return `${config.dataKey}=${config.value}`;
    default:
      return null;
  }
}

function getNumberCondition(config) {
  switch (config.operator) {
    case Operator.EQUAL_TO:
      return `${config.dataKey}=${config.value}`;
    case Operator.NOT_EQUAL_TO:
      return `${config.dataKey}!=${config.value}`;
    case Operator.GREATER_THAN:
      return `${config.dataKey}>${config.value}`;
    case Operator.GREATER_THAN_OR_EQUAL_TO:
      return `${config.dataKey}>=${config.value}`;
    case Operator.LESS_THAN:
      return `${config.dataKey}<${config.value}`;
    case Operator.LESS_THAN_OR_EQUAL_TO:
      return `${config.dataKey}<=${config.value}`;
    case Operator.BETWEEN:
      return `(${config.dataKey}>=${config.value}&&${config.dataKey}<=${config.betweenValue})`;
    default:
      return null;
  }
}

function getDateConditon(config, dataType) {
  let value = config.value;
  const hasTime = dataType === 'datetime';

  if (value && value instanceof Date) {
    value = hasTime ? idfFilterDateTimeSerializer(value) : idfFilterDateSerializer(value);
  }
  let betweenValue = config.betweenValue;
  if (betweenValue && betweenValue instanceof Date) {
    betweenValue = hasTime ?
      idfFilterDateTimeSerializer(betweenValue) : idfFilterDateSerializer(betweenValue);
  }
  switch (config.operator) {
    case Operator.EQUAL_TO:
      return `${config.dataKey}='${value}'`;
    case Operator.NOT_EQUAL_TO:
      return `${config.dataKey}!='${value}'`;
    case Operator.GREATER_THAN:
      return `${config.dataKey}>'${value}'`;
    case Operator.GREATER_THAN_OR_EQUAL_TO:
      return `${config.dataKey}>='${value}'`;
    case Operator.LESS_THAN:
      return `${config.dataKey}<'${value}'`;
    case Operator.LESS_THAN_OR_EQUAL_TO:
      return `${config.dataKey}<='${value}'`;
    case Operator.BETWEEN:
      return `(${config.dataKey}>='${value}'&&${config.dataKey}<='${betweenValue}')`;
    default:
      return null;
  }
}

export function serializeCloudFilter(filterConfigArray, columns, conjunction) {
  if (!filterConfigArray || filterConfigArray.length === 0) {
    return '-';
  }

  const typeMap = columns.reduce((acc, col) => {
    acc[col.dataKey] = col.dataType;
    return acc;
  }, {});

  const validFilters = filterConfigArray.filter(f => typeMap.hasOwnProperty(f.dataKey));
  const joinSign = conjunction === 'OR' ? '||' : '&&';

  return validFilters.map(filter => {
    const dataType = typeMap[filter.dataKey];
    switch (dataType) {
      case 'string':
        return getStringCondition(filter);
      case 'number':
        return getNumberCondition(filter);
      case 'date':
      case 'datetime':
        return getDateConditon(filter, dataType);
      default:
        break;
    }
  }).join(joinSign);
}

