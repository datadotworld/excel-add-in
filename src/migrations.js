const migrateBindings = ({
  dataset,
  bindings,
  getSheetName,
  pushToLocalStorage
}) => {
  const datasetFiles = dataset.files.map(entry => entry.name);
  bindings.forEach((binding) => {
    const sheetId = getSheetName(binding);
    const fileName = binding.id.replace("dw::", "");
    if (datasetFiles.includes(fileName)) {
      pushToLocalStorage(
        binding.id,
        `https://data.world/${dataset.owner}/${dataset.id}`,
        fileName,
        binding.rangeAddress,
        sheetId,
        dataset.updated
      );
    }
  });
};

export default [migrateBindings];
