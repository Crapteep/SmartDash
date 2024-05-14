const convertToNumber = (value) => {
  const floatValue = parseFloat(value);
  const intValue = parseInt(value, 10);

  if (!isNaN(floatValue) && floatValue.toString() === value) {
    return floatValue;
  } else if (!isNaN(intValue) && intValue.toString() === value) {
    return intValue;
  } else {
    return value;
  }
};

export default convertToNumber;
