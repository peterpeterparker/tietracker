function loadClients() {
  return new Promise(async (resolve) => {
    const values = await idbKeyval.get('clients');

    if (!values || values.length <= 0) {
      resolve(undefined);
      return;
    }

    let result = {};
    values.forEach((value) => {
      result[value.id] = {
        name: value.data.name,
        color: value.data.color,
      };
    });

    resolve(result);
  });
}

function loadProjects() {
  return new Promise(async (resolve) => {
    const values = await idbKeyval.get('projects');

    if (!values || values.length <= 0) {
      resolve(undefined);
      return;
    }

    let result = {};
    values.forEach((value) => {
      result[value.id] = {
        name: value.data.name,
        rate: value.data.rate ? value.data.rate : {hourly: 0, vat: false},
        budget: value.data.budget ? value.data.budget : undefined,
      };
    });

    resolve(result);
  });
}
