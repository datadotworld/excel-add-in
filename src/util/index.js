import { MAX_ROWS, MAX_COLUMNS } from '../constants';

export function isSheetBinding(binding) {
  if (binding.rowCount === MAX_ROWS && binding.columnCount === MAX_COLUMNS) {
    return true;
  } else {
    return false;
  }
}

export function getSheetName(binding) {
  const rangeAddress = binding.rangeAddress
  return rangeAddress.substring(0, rangeAddress.indexOf('!'));
}
