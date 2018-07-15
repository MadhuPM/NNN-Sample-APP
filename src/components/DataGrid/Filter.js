import moment from 'moment';

function round(value, decimals) {
  return Number(Math.round(value + 'e'+ decimals) + 'e-' + decimals);
}

function countDecimals(value) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
}

export const Operator = {
  EQUAL_TO: 'EQUAL_TO',
  NOT_EQUAL_TO: 'NOT_EQUAL_TO',
  STARTS_WITH: 'STARTS_WITH',
  CONTAINS: 'CONTAINS',
  ENDS_WITH: 'ENDS_WITH',
  GREATER_THAN: 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL_TO: 'GREATER_THAN_OR_EQUAL_TO',
  LESS_THAN: 'LESS_THAN',
  LESS_THAN_OR_EQUAL_TO: 'LESS_THAN_OR_EQUAL_TO',
  BETWEEN: 'BETWEEN',
  EQUAL_TO_NULL: 'EQUAL_TO_NULL',
  NOT_EQUAL_TO_NULL: 'NOT_EQUAL_TO_NULL'
};

export const Conjunction = {
  AND: 'AND',
  OR: 'OR'
};

export default class Filter {
  constructor({dataKey, operator, value, betweenValue,
    dataType, considerAsList, matchCase = false}) {
    this.dataKey = dataKey;
    this.operator = operator;
    this.dataType = dataType;
    this.isDate = dataType === 'date' || dataType === 'datetime';
    this.datePrecision = dataType === 'datetime' ? 'minute' : 'day';
    this.values = considerAsList ? value.split(',').map(v => v.trim()) : null;
    this.value = considerAsList ? null : value;
    this.hasValue = value !== null && typeof value !== 'undefined';
    this.hasBetweenValue = this.betweenValue !== null && typeof this.betweenValue !== 'undefined';
    this.caseInsensitive = !matchCase;
    this.betweenValue = betweenValue;
    if (this.dataType === 'number') {
      this.value = Number(this.value);
      this.decimalPlaces = countDecimals(this.value);
      if (this.hasBetweenValue) {
        this.betweenValue = Number(this.betweenValue);
    }
    }
    if (this.isDate && this.hasValue) {
      this.value = moment(this.value);
      if (this.hasBetweenValue) {
        this.betweenValue = moment(this.betweenValue);
      }
    }
    this.upperCaseValues();
  }

  getFilterFunction() {
    switch (this.operator) {
      case Operator.EQUAL_TO:
        return this.isDate ? this.dateEqualTo : this.equalTo;
      case Operator.NOT_EQUAL_TO:
        return this.isDate ? this.dateNotEqualTo : this.notEqualTo;
      case Operator.STARTS_WITH:
        return this.startsWith;
      case Operator.CONTAINS:
        return this.contains;
      case Operator.ENDS_WITH:
        return this.endsWith;
      case Operator.GREATER_THAN:
        return this.isDate ? this.dateGreaterThan : this.greaterThan;
      case Operator.GREATER_THAN_OR_EQUAL_TO:
        return this.isDate ? this.dateGreaterThanOrEqualTo : this.greaterThanOrEqualTo;
      case Operator.LESS_THAN:
        return this.isDate ? this.dateLessThan : this.lessThan;
      case Operator.LESS_THAN_OR_EQUAL_TO:
        return this.isDate ? this.dateLessThanOrEqualTo : this.lessThanOrEqualTo;
      case Operator.BETWEEN:
        return this.isDate ? this.dateBetween : this.between;
      case Operator.EQUAL_TO_NULL:
        return this.equalToNull;
      case Operator.NOT_EQUAL_TO_NULL:
        return this.notEqualToNull;
      default:
        return null;
    }
  }

  upperCaseValues() {
    if (this.caseInsensitive && this.dataType === 'string') {
      if (this.hasValue) {
        this.value = (this.value + '').toUpperCase();
      }
      if (this.values) {
        this.values = this.values.map((val) => {
          return (val + '').toUpperCase();
        });
      }
    }
  }

  dateEqualTo = (obj) => {
    const val = obj[this.dataKey];
    if (val && val instanceof Date) {
      return this.value.isSame(val, this.datePrecision);
    }
    return false;
  }

  dateNotEqualTo = (obj) => {
    return !this.dateEqualTo(obj);
  }

  dateGreaterThan = (obj) => {
    const val = obj[this.dataKey];
    if (val && val instanceof Date) {
      return this.value.isBefore(val, this.datePrecision);
    }

    return false;
  }

  dateGreaterThanOrEqualTo = (obj) => {
    const val = obj[this.dataKey];
    if (val && val instanceof Date) {
      return this.value.isSameOrBefore(val, this.datePrecision);
    }

    return false;
  }

  dateLessThan = (obj) => {
    const val = obj[this.dataKey];
    if (val && val instanceof Date) {
      return this.value.isAfter(val, this.datePrecision);
    }
    return false;
  }

  dateLessThanOrEqualTo = (obj) => {
    const val = obj[this.dataKey];
    if (val && val instanceof Date) {
      return this.value.isSameOrAfter(val, this.datePrecision);
    }

    return false;
  }

  dateBetween = (obj) => {
    const val = obj[this.dataKey];
    if (val && val instanceof Date) {
      return moment(val).isBetween(this.value, this.betweenValue, this.datePrecision, '[]');
    }
    return false;
  }

  equalTo = (obj) => {
    let val = this.dataType === 'string' ? this.getCaseValue(obj) : obj[this.dataKey];
    if (this.decimalPlaces > 0) {
      val = round(val, this.decimalPlaces);
    }

    if (this.hasValue) {
      return val === this.value;
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val === this.values[i]) {
        return true;
      }
    }
    return false;
  }

  notEqualTo = (obj) => {
    return !this.equalTo(obj);
  }

  equalToNull = (obj) => {
    const val = obj[this.dataKey];
    if (typeof val === undefined || val === null) {
      return true;
    }

    return false;
  }

  notEqualToNull = (obj) => {
    return !this.equalToNull(obj);
  }

  getCaseValue = (obj) => {
    let val = obj[this.dataKey] || '';
    if (this.caseInsensitive) {
      val = (val + '').toUpperCase();
    }
    return val;
  }

  startsWith = (obj) => {
    const val = this.getCaseValue(obj);
    if (this.hasValue) {
      return val.startsWith(this.value);
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val.startsWith(this.values[i])) {
        return true;
      }
    }
    return false;
  }

  contains = (obj) => {
    const val = this.getCaseValue(obj);

    if (this.hasValue) {
      return val.includes(this.value);
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val.includes(this.values[i])) {
        return true;
      }
    }
    return false;
  }

  endsWith = (obj) => {
    const val = this.getCaseValue(obj);

    if (this.hasValue) {
      return val.endsWith(this.value);
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val.endsWith(this.values[i])) {
        return true;
      }
    }
    return false;
  }

  greaterThan = (obj) => {
    const val = obj[this.dataKey];

    if (this.hasValue) {
      return val > this.value;
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val > this.values[i]) {
        return true;
      }
    }
    return false;
  }

  greaterThanOrEqualTo = (obj) => {
    const val = obj[this.dataKey];

    if (this.hasValue) {
      return val >= this.value;
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val >= this.values[i]) {
        return true;
      }
    }
    return false;
  }

  lessThan = (obj) => {
    const val = obj[this.dataKey];

    if (this.hasValue) {
      return val < this.value;
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val < this.values[i]) {
        return true;
      }
    }
    return false;
  }

  lessThanOrEqualTo = (obj) => {
    const val = obj[this.dataKey];

    if (this.hasValue) {
      return val <= this.value;
    }

    for (let i = 0; i < this.values.length; i++) {
      if (val <= this.values[i]) {
        return true;
      }
    }
    return false;
  }

  between = (obj) => {
    const val = obj[this.dataKey];
    return this.value <= val && val <= this.betweenValue;
  }
}
