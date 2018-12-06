const migrateBindings = async ({
  dataset,
  bindings,
  pushToLocalStorage,
  getSheetId
}) => {
  // Remove previous migrations if any
  localStorage.removeItem('history');

  // Run migrations
  const datasetFiles = dataset.files.map((entry) => entry.name);
  const worksheetIds = await Promise.all(
    bindings.map((binding) => getSheetId(binding.rangeAddress))
  );

  bindings.forEach(async (binding, index) => {
    const fileName = binding.id.replace('dw::', '');
    const worksheetId = worksheetIds[index];

    if (datasetFiles.includes(fileName)) {
      await pushToLocalStorage(
        { owner: dataset.owner, id: dataset.id },
        fileName,
        binding.rangeAddress,
        worksheetId,
        new Date()
      );
    }
  });
};

export default [migrateBindings];
