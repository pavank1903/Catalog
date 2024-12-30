const fs = require('fs');

// Function to read input from a JSON file
const readInputFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8'); // Read file synchronously
    return JSON.parse(data); // Parse JSON content
  } catch (error) {
    console.error(`Error reading or parsing the file: ${error.message}`);
    process.exit(1); // Exit the program with an error code
  }
};

// Decode the y-value from the given base
const decodeValue = (value, base) => {
  return parseInt(value, base); // Convert the value from the given base to an integer
};

// Create the Vandermonde matrix
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

// Invert a matrix using Gaussian elimination
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

// Parse the input to extract points
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

// Main function to find the constant term
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

  return Math.round(coefficients[k - 1]); // The constant term is the last coefficient
};

// Read test cases from JSON files
const testcaseFile1 = './testcase1.json';
const testcaseFile2 = './testcase2.json';

const testcase1 = readInputFromFile(testcaseFile1);
const testcase2 = readInputFromFile(testcaseFile2);

const secret1 = findSecretConstant(testcase1);
const secret2 = findSecretConstant(testcase2);

console.log(`Secret for testcase 1: ${secret1}`);
console.log(`Secret for testcase 2: ${secret2}`);
