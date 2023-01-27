import GenericContract, {
  ExtractMethodDefinition,
  TuplifyUnion,
} from "../../src/models/GenericContract";

/**
 * This file was created to test the support of GenericContract with multiple ABIs definitions
 */

const ComplexResultABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "currentValidBid",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "bidder",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "boleano",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "address",
                name: "bidder",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct SimpleNFTAuction.Bid",
            name: "nested",
            type: "tuple",
          },
        ],
        internalType: "struct SimpleNFTAuction.Bid",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const ComplexResultABIContractInstance: GenericContract<
  typeof ComplexResultABI
> = null as any;

/** This should return a string and require a string */
const ComplexABIResult = ComplexResultABIContractInstance.methods
  .currentValidBid("")
  .call();

const SimpleABI = [
  {
    inputs: [],
    name: "end",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const SimpleABIContractInstance: GenericContract<typeof SimpleABI> =
  null as any;
/** This should return a string */
const SimpleABIResult = SimpleABIContractInstance.methods.end().call();

const ArgumentABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

const ArgumentABIContractInstance: GenericContract<typeof ArgumentABI> =
  null as any;

/** This should return a string and require a string */
const ArgumentABIResult = ArgumentABIContractInstance.methods
  .balanceOf("")
  .call();

const TupleABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_cid",
        type: "string",
      },
      {
        internalType: "string",
        name: "_schema",
        type: "string",
      },
      {
        components: [
          {
            internalType: "string",
            name: "key",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        internalType: "struct IGenericMetadata.Trait[]",
        name: "_traits",
        type: "tuple[]",
      },
    ],
    name: "createTier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "balancesOf",
    outputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "tiers",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: 'tierList',
    outputs: [
      {
        internalType: 'string[]',
        name: '',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const TupleABIContractInstance: GenericContract<typeof TupleABI> = null as any;

const TupleABIResult = TupleABIContractInstance.methods
  .createTier("", "", [["", ""]])
  .send({
    from: "",
  });
/** This should return a string and require a string */
const TupleABIArrayResult = TupleABIContractInstance.methods
  .balancesOf("")
  .call()
  .then((a) => {
    const { tiers } = a;
  });

const TupleABIResult2 = TupleABIContractInstance.methods.tierList().call().then(a => {
  a
})
