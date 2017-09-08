import papa from 'papaparse';

const testData = [
  [1, 2, 3], // normal data
  [1, '2, 3, 4', 5], // data with commas
  ['10/12/2012', '17%', 0.123], // mixed data
  ['this is a test\nof a newline', '', ''], //newline and empty data
  ['this is a "quotation mark" test', '', ''] // quotation test
];

it('correctly encodes data into a CSV', () => {
  expect(papa.unparse(testData)).toMatchSnapshot();
});