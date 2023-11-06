export default {
  alternating: {
    steps: [
      {
        description: 'Import the "useAlternating" hook',
        introduceCode: `import useAlternating from '@onepercentio/one-ui/dist/hooks/ui/useAlternating'`,
      },
      {
        description:
          "Add a call to useAlternating, passing the list of elements",
        introduceCode: `const element = useAlternating(element_list);`,
      },
    ],
  },
};
