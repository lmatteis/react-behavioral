export function generateThreads(fnGenerator, fn) {
  let threads = [];
  for (let o of fnGenerator()) {
    threads.push(fn(o));
  }
  return threads;
}

export function* allLines() {
  // Horizontal lines
  yield [0, 1, 2];
  yield [3, 4, 5];
  yield [6, 7, 8];

  // Vertical lines
  yield [0, 3, 6];
  yield [1, 4, 7];
  yield [2, 5, 8];

  // Diagonal
  yield [0, 4, 8];
  yield [2, 4, 6];
}

export const matchAny = (
  inputEvent,
  [x1, x2, x3]
) => event => {
  const cellNumber = event.payload;
  return (
    event.type === inputEvent &&
    (cellNumber === x1 ||
      cellNumber === x2 ||
      cellNumber === x3)
  );
};

export function* allCells() {
  yield 0;
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  yield 6;
  yield 7;
  yield 8;
}
