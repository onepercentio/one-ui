export type Matrix3D = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];
export type OperationData =
  | {
      type: "rotateX" | "rotateY" | "rotateZ";
      angle: number;
    }
  | {
      type: "translate";
      x: number;
      y: number;
      z: number;
    }
  | {
      type: "scale";
      factorX: number;
      factorY: number;
      factorZ: number;
    }
  | {
      type: "perspective";
      fieldOfViewInRadians: number;
      aspect: number;
      near: number;
      far: number;
    }
  | {
      type: "matrix";
      matrix: Matrix3D;
    };
export function IDENTITY_MATRIX() {
  return [
    [1, 0, 0, 0], // cos, -sin, ?
    [0, 1, 0, 0], // sin, cos, ?
    [0, 0, 1, 0], // TranslationX, TranslationY, ?
    [0, 0, 0, 1],
  ] as Matrix3D;
}
export function generateMatrixFromOperations(
  ...operations: OperationData[]
): Matrix3D {
  let resultingMatrix: Matrix3D | undefined = undefined;
  for (let operation of operations) {
    const matrix =
      operation.type === "matrix" ? operation.matrix : IDENTITY_MATRIX();
    switch (operation.type) {
      case "perspective":
        const f = Math.tan(
          Math.PI * 0.5 - 0.5 * operation.fieldOfViewInRadians
        );
        const rangeInv = 1.0 / (operation.near - operation.far);

        matrix[0][0] = f / operation.aspect;
        matrix[1][1] = f;
        matrix[2][2] = (operation.near + operation.far) * rangeInv;
        matrix[2][3] = -1;
        matrix[3][2] = operation.near * operation.far * rangeInv * 2;
        matrix[3][3] = 0;
        break;
      case "translate":
        matrix[3][0] = operation.x;
        matrix[3][1] = operation.y;
        matrix[3][2] = operation.z;
        break;
      case "rotateX":
      case "rotateY":
      case "rotateZ":
        const angleToRadians = (operation.angle * Math.PI) / 180;
        const sinAngle = Math.sin(angleToRadians);
        const cosAngle = Math.cos(angleToRadians);
        switch (operation.type) {
          case "rotateZ":
            matrix[0][0] = cosAngle;
            matrix[1][1] = cosAngle;
            matrix[1][0] = -sinAngle;
            matrix[0][1] = sinAngle;
            break;
          case "rotateY":
            matrix[0][0] = cosAngle;
            matrix[2][2] = cosAngle;
            matrix[0][2] = -sinAngle;
            matrix[2][0] = sinAngle;
            break;
          case "rotateX":
            matrix[1][1] = cosAngle;
            matrix[2][2] = cosAngle;
            matrix[2][1] = -sinAngle;
            matrix[1][2] = sinAngle;
            break;
        }
        break;
      case "scale":
        matrix[0][0] = operation.factorX;
        matrix[1][1] = operation.factorY;
        matrix[2][2] = operation.factorZ;
        break;
    }
    if (resultingMatrix) {
      resultingMatrix = multiplyMatrixes(resultingMatrix, matrix) as Matrix3D;
    } else {
      resultingMatrix = matrix;
    }
  }

  return resultingMatrix || IDENTITY_MATRIX();
}

type NumberMatrix = readonly (readonly number[])[];
export function multiplyMatrixes<X extends NumberMatrix>(
  matrix1: X,
  matrix2: NumberMatrix & { length: X[number]["length"] }
) {
  const resultingMatrix: number[][] = [];
  if (
    process.env.NODE_ENV === "development" &&
    matrix2.length !== matrix1[0].length
  ) {
    throw new Error(`For the multiplication of matrixes to work you need to provide the matrix1 containing the amount of columns as the same amount of rows from matrix 2.
You provided ${matrix1[0].length} columns and ${matrix2.length} rows`);
  }
  for (let i0 in matrix1) {
    for (let i in matrix2[0]) {
      let dimensionResult = 0;
      for (let i2 in matrix1[0]) {
        dimensionResult += matrix1[i0][i2] * matrix2[i2][i];
      }
      if (!resultingMatrix[i0]) resultingMatrix[i0] = [];
      resultingMatrix[i0][i] = dimensionResult;
    }
  }
  return resultingMatrix;
}

export function invertMatrix(matrix: Matrix3D) {
  const m = flattenMatrix(matrix);
  let det: number = 0;
  const inv = [];

  inv[0] =
    m[5] * m[10] * m[15] -
    m[5] * m[11] * m[14] -
    m[9] * m[6] * m[15] +
    m[9] * m[7] * m[14] +
    m[13] * m[6] * m[11] -
    m[13] * m[7] * m[10];

  inv[4] =
    -m[4] * m[10] * m[15] +
    m[4] * m[11] * m[14] +
    m[8] * m[6] * m[15] -
    m[8] * m[7] * m[14] -
    m[12] * m[6] * m[11] +
    m[12] * m[7] * m[10];

  inv[8] =
    m[4] * m[9] * m[15] -
    m[4] * m[11] * m[13] -
    m[8] * m[5] * m[15] +
    m[8] * m[7] * m[13] +
    m[12] * m[5] * m[11] -
    m[12] * m[7] * m[9];

  inv[12] =
    -m[4] * m[9] * m[14] +
    m[4] * m[10] * m[13] +
    m[8] * m[5] * m[14] -
    m[8] * m[6] * m[13] -
    m[12] * m[5] * m[10] +
    m[12] * m[6] * m[9];

  inv[1] =
    -m[1] * m[10] * m[15] +
    m[1] * m[11] * m[14] +
    m[9] * m[2] * m[15] -
    m[9] * m[3] * m[14] -
    m[13] * m[2] * m[11] +
    m[13] * m[3] * m[10];

  inv[5] =
    m[0] * m[10] * m[15] -
    m[0] * m[11] * m[14] -
    m[8] * m[2] * m[15] +
    m[8] * m[3] * m[14] +
    m[12] * m[2] * m[11] -
    m[12] * m[3] * m[10];

  inv[9] =
    -m[0] * m[9] * m[15] +
    m[0] * m[11] * m[13] +
    m[8] * m[1] * m[15] -
    m[8] * m[3] * m[13] -
    m[12] * m[1] * m[11] +
    m[12] * m[3] * m[9];

  inv[13] =
    m[0] * m[9] * m[14] -
    m[0] * m[10] * m[13] -
    m[8] * m[1] * m[14] +
    m[8] * m[2] * m[13] +
    m[12] * m[1] * m[10] -
    m[12] * m[2] * m[9];

  inv[2] =
    m[1] * m[6] * m[15] -
    m[1] * m[7] * m[14] -
    m[5] * m[2] * m[15] +
    m[5] * m[3] * m[14] +
    m[13] * m[2] * m[7] -
    m[13] * m[3] * m[6];

  inv[6] =
    -m[0] * m[6] * m[15] +
    m[0] * m[7] * m[14] +
    m[4] * m[2] * m[15] -
    m[4] * m[3] * m[14] -
    m[12] * m[2] * m[7] +
    m[12] * m[3] * m[6];

  inv[10] =
    m[0] * m[5] * m[15] -
    m[0] * m[7] * m[13] -
    m[4] * m[1] * m[15] +
    m[4] * m[3] * m[13] +
    m[12] * m[1] * m[7] -
    m[12] * m[3] * m[5];

  inv[14] =
    -m[0] * m[5] * m[14] +
    m[0] * m[6] * m[13] +
    m[4] * m[1] * m[14] -
    m[4] * m[2] * m[13] -
    m[12] * m[1] * m[6] +
    m[12] * m[2] * m[5];

  inv[3] =
    -m[1] * m[6] * m[11] +
    m[1] * m[7] * m[10] +
    m[5] * m[2] * m[11] -
    m[5] * m[3] * m[10] -
    m[9] * m[2] * m[7] +
    m[9] * m[3] * m[6];

  inv[7] =
    m[0] * m[6] * m[11] -
    m[0] * m[7] * m[10] -
    m[4] * m[2] * m[11] +
    m[4] * m[3] * m[10] +
    m[8] * m[2] * m[7] -
    m[8] * m[3] * m[6];

  inv[11] =
    -m[0] * m[5] * m[11] +
    m[0] * m[7] * m[9] +
    m[4] * m[1] * m[11] -
    m[4] * m[3] * m[9] -
    m[8] * m[1] * m[7] +
    m[8] * m[3] * m[5];

  inv[15] =
    m[0] * m[5] * m[10] -
    m[0] * m[6] * m[9] -
    m[4] * m[1] * m[10] +
    m[4] * m[2] * m[9] +
    m[8] * m[1] * m[6] -
    m[8] * m[2] * m[5];

  det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

  if (det === 0)
    throw new Error(
      "Determinator is equal to 0. This matrix cannot be inverted"
    );

  det = 1.0 / det;

  return inv.reduce((r, val, i) => {
    const row = Math.floor(i / 4);
    if (!r[row]) r[row] = [];
    r[row][i % 4] = val * det;
    return r;
  }, [] as number[][]) as Matrix3D;
}
export function flattenMatrix(matrix: number[][]) {
  return matrix.reduce((f, dimension) => [...f, ...dimension], [] as number[]);
}
