const { fetchEnvironmentData } = require('./src/services/environmentService');

async function test() {
  const result = await fetchEnvironmentData(10.0882, 77.0624);
  console.log(JSON.stringify(result, null, 2));
}
test();
