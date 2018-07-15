import moment from 'moment';
import Big from 'big.js';

export function idfDateSerializer(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function idfDateTimeSerializer(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export function idfFilterDateSerializer(date) {
  return moment(date).format('YYYYMMDD');
}

export function idfFilterDateTimeSerializer(date) {
  return moment(date).format('YYYYMMDD HH:mm:ss');
}


const hasValue = (val) => {
  return !(typeof val === 'undefined');
};

export function parseIDFDate(strDate) {
  if (hasValue(strDate) && strDate.length === 8) {
    const month = strDate.substring(4, 6) - 1;
    return new Date(strDate.substring(0, 4), month, strDate.substring(6));
  }
  return null;
}

export function parseIDFDateTime(strDate) {
  if (hasValue(strDate) && strDate.length === 17) {
    const month = strDate.substring(4, 6) - 1;
    return new Date(strDate.substring(0, 4), month,
      strDate.substring(6, 8), strDate.substring(9, 11),
      strDate.substring(12, 14), strDate.substring(15));
  }
  return null;
}

export function parseIDFBigDecimal(strBigDecimal) {
	if (hasValue(strBigDecimal)) {
		return Big(strBigDecimal);
	}
	
	return null;
}

export function parseIDFData(data = [], dateFields = [], dateTimeFields = [], bigDecimalFields = []) {
  if (dateFields.length === 0 && dateTimeFields.length === 0 && bigDecimalFields.length === 0) {
    return data;
  }

  let row;
  let fieldName;

  for (let i = 0; i < data.length; i++) {
    row = data[i];
    for (let j = 0; j < dateFields.length; j++) {
      fieldName = dateFields[j];
      row[fieldName] = parseIDFDate(row[fieldName]);
    }

    for (let k = 0; k < dateTimeFields.length; k++) {
      fieldName = dateTimeFields[k];
      row[fieldName] = parseIDFDateTime(row[fieldName]);
    }
    
    for (let m = 0; m < bigDecimalFields.length; m++) {
    	fieldName = bigDecimalFields[m];
    	row[fieldName] = parseIDFBigDecimal(row[fieldName]);
    }
  }
  return data;
}

export function getFormUrlencodedParams(params = {}, dateFields = [], dateTimeFields = []) {
  const paramStr = Object.keys(params).reduce((arr, key) => {
    if (key === '__id__' || key === '__state__' || key === '__errorMsg') {
      return arr;
    }
    const strKey = encodeURIComponent(key);
    let val = params[key];
    if (dateFields.indexOf(key) !== -1 && val instanceof Date) {
      val = idfDateSerializer(val);
    } else if (dateTimeFields.indexOf(key) !== -1 && val instanceof Date) {
      val = idfDateTimeSerializer(val);
    }
    if (val === null || typeof(val) === 'undefined') {
      val = '';
    }
    val = encodeURIComponent(val);
    return arr.concat(`${strKey}=${val}`);
  }, []).join('&');
  return paramStr;
}
