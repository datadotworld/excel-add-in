const migrateBindings = ({ dataset, bindings, pushToLocalStorage }) => {
  const datasetFiles = dataset.files.map((entry) => entry.name);
  bindings.forEach((binding) => {
    const fileName = binding.id.replace('dw::', '');
    if (datasetFiles.includes(fileName)) {
      pushToLocalStorage(
        `https://data.world/${dataset.owner}/${dataset.id}`,
        fileName,
        binding.rangeAddress
      );
    }
  });
};

export default [migrateBindings];
