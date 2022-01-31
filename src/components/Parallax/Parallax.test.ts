import {
  calculateDistanceRelativeToBounds,
  givenTheRelativePositionHowMuchToRotate,
} from "./Parallax";

const ELEMENT_POSITION_SIZE = [130, 500];

it.each([
  [0, ...ELEMENT_POSITION_SIZE, 0],
  [130, ...ELEMENT_POSITION_SIZE, 0],
  [380, ...ELEMENT_POSITION_SIZE, 0.5],
  [630, ...ELEMENT_POSITION_SIZE, 1],
  [750, ...ELEMENT_POSITION_SIZE, 1],
] as [number, number, number, number][])(
  "Should calculate relative mouse position correctly",
  (mousePosition, elementPosition, elementSize, expectedResult) => {
    expect(
      calculateDistanceRelativeToBounds(
        mousePosition,
        elementPosition,
        elementSize
      )
    ).toEqual(expectedResult);
  }
);

const MAX_ROTATION = 50;

it.each([
  [0, MAX_ROTATION, -25],
  [0.5, MAX_ROTATION, 0],
  [1, MAX_ROTATION, 25],
])(
  "Should calculate rotation correctly",
  (relativePosition, maxRotation, expectedRotation) => {
    expect(
      givenTheRelativePositionHowMuchToRotate(relativePosition, maxRotation)
    ).toEqual(expectedRotation);
  }
);
