import GenericContract, { ExtractMethodDefinition, TuplifyUnion } from "../../src/models/GenericContract";

/**
 * This file was created to test the support of GenericContract with multiple ABIs definitions
 */

const ComplexResultABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_tokenId",
                "type": "uint256"
            }
        ],
        "name": "currentValidBid",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "bidder",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "boleano",
                        "type": "bool"
                    },
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "bidder",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct SimpleNFTAuction.Bid",
                        "name": "nested",
                        "type": "tuple"
                    }
                ],
                "internalType": "struct SimpleNFTAuction.Bid",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
] as const

const ComplexResultABIContractInstance: GenericContract<typeof ComplexResultABI> = null as any;

/** This should return a string and require a string */
const ComplexABIResult = ComplexResultABIContractInstance.methods.currentValidBid("").call();

const SimpleABI = [
    {
        "inputs": [],
        "name": "end",
        "outputs": [
            {
                "internalType": "uint128",
                "name": "",
                "type": "uint128"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
] as const

const SimpleABIContractInstance: GenericContract<typeof SimpleABI> = null as any;
/** This should return a string */
const SimpleABIResult = SimpleABIContractInstance.methods.end().call();

const ArgumentABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address",
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
] as const

const ArgumentABIContractInstance: GenericContract<typeof ArgumentABI> = null as any;

/** This should return a string and require a string */
const ArgumentABIResult = ArgumentABIContractInstance.methods.balanceOf("").call();

