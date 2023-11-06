export default {
  binding: {
    steps: [
      {
        description: 'Import the "useHero" hook',
        introduceCode: `import useHero from '@onepercentio/one-ui/dist/hooks/useHero'`,
      },
      {
        description: "Add a call to useHero, with a unique id",
        introduceCode: `const { heroRef } = useHero('UNIQUE_ID')`,
      },
      {
        description: "Add the heroRef to some target element",
        introduceCode: `<div ref={heroRef}></div>`,
      },
    ],
  },
};
