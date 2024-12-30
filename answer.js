const fs = require('fs');

const readInputFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8'); 
    return JSON.parse(data); 
  } catch (error) {
    console.error(`Error reading or parsing the file: ${error.message}`);
    process.exit(1); 
  }
};

const decodeValue = (value, base) => {
  return parseInt(value, base); 
};


const createVandermondeMatrix = (x, k) => {
  const matrix = [];
  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = k - 1; j >= 0; j--) {
      row.push(Math.pow(x[i], j));
    }
    matrix.push(row);
  }
  return matrix;
};

const invertMatrix = (matrix) => {
  const size = matrix.length;
  const augmented = matrix.map((row, i) =>
    row.concat([...Array(size)].map((_, j) => (i === j ? 1 : 0)))
  );

  for (let i = 0; i < size; i++) {
    const factor = augmented[i][i];
    for (let j = 0; j < 2 * size; j++) {
      augmented[i][j] /= factor;
    }
    for (let k = 0; k < size; k++) {
      if (k !== i) {
        const multiplier = augmented[k][i];
        for (let j = 0; j < 2 * size; j++) {
          augmented[k][j] -= multiplier * augmented[i][j];
        }
      }
    }
  }

  return augmented.map(row => row.slice(size));
};

// Multiply a matrix with a vector
const multiplyMatrix = (matrix, vector) => {
  return matrix.map(row =>
    row.reduce((sum, value, index) => sum + value * vector[index], 0)
  );
};

const parseInput = (data) => {
  const points = [];
  const { keys, ...values } = data;

  const n = keys.n;
  const k = keys.k;

  Object.entries(values).forEach(([key, value]) => {
    const x = parseInt(key); // Key is the x-value
    const base = parseInt(value.base);
    const y = decodeValue(value.value, base);
    points.push([x, y]);
  });

  return { points, n, k };
};

const findSecretConstant = (data) => {
  const { points, k } = parseInput(data);

  if (points.length < k) {
    throw new Error("Insufficient points for interpolation");
  }

  const x = points.slice(0, k).map(([x]) => x);
  const y = points.slice(0, k).map(([_, y]) => y);

  const vandermonde = createVandermondeMatrix(x, k);
  const invertedMatrix = invertMatrix(vandermonde);
  const coefficients = multiplyMatrix(invertedMatrix, y);

  return Math.round(coefficients[k - 1]);
};

const testcaseFile1 = './testcase1.json';
const testcaseFile2 = './testcase2.json';

const testcase1 = readInputFromFile(testcaseFile1);
const testcase2 = readInputFromFile(testcaseFile2);

const secret1 = findSecretConstant(testcase1);
const secret2 = findSecretConstant(testcase2);

console.log(`Secret for testcase 1: ${secret1}`);
console.log(`Secret for testcase 2: ${secret2}`);
