export default {
  slide: {
    steps: [
      {
        description: 'Import the "UncontrolledTransition" component',
        introduceCode: `import UncontrolledTransition from '@onepercentio/one-ui/dist/components/UncontrolledTransition'`,
      },
      {
        description: 'Wrap the component in "UncontrolledTransition"',
        introduceCode: `<UncontrolledTransition><Fragment /></UncontrolledTransition>`,
      },
      {
        description:
          'Add a "key" prop that uniquely identifies the target component',
        introduceCode: `<Fragment key="UNIQUE_KEY"/>`,
      },
    ],
  },
  flipping: {
    steps: [
      {
        description: 'Follow the "slide" method steps',
        introduceCode: `<UncontrolledTransition> <Fragment key="UNIQUE_KEY"/> </UncontrolledTransition>`,
      },
      {
        description: 'Import the "TransitionAnimationTypes" enum',
        introduceCode: `import { TransitionAnimationTypes } from '@onepercentio/one-ui/dist/components/Transition/Transition'`,
      },
      {
        description: "Set the animation to COIN_FLIP",
        introduceCode: `<UncontrolledTransition transitionType={TransitionAnimationTypes.COIN_FLIP}><Fragment key="UNIQUE_KEY"/></UncontrolledTransition>`,
      },
    ],
  },
};
