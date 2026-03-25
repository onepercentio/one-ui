import { PromiEvent } from 'web3-core'

/** Check if a transaction has been completed */
export async function isTransactionMined(transactionHash: string, provider: any) {
    const transaction = await provider.eth.getTransactionReceipt(transactionHash)

    if (
        !transaction ||
        !transaction.blockHash ||
        transaction.status === undefined
    )
        return undefined // I still don't know if it's loaded
    else return !!transaction.status === true
}

/** Wait for a transaction to be confirmed */
export async function waitForConfirmation(tHash: string, provider: any) {
    return new Promise<void>(async (r, rej) => {
        while (true) {
            const bought = await isTransactionMined(tHash, provider)
            if (bought === undefined)
                await new Promise<void>((r) => setTimeout(() => r(), 2000))
            else {
                if (bought) r()
                else rej('TRANSACTION_FAILED')
                break
            }
        }
    })
}

/** Get the transaction ID when a function is executed */
export function dispatchAndWait(func: any) {
    const _func = func as PromiEvent<any>
    return new Promise<string>((r, rej) => {
        _func.on('transactionHash', (tX) => {
            r(tX)
        })
        _func.catch(rej)
    })
}

/** Send a transaction and wait for it to be confirmed */
export async function sendAndWaitForConfirmation(func: Promise<void>, provider: any) {
    const tHash = await dispatchAndWait(func)
    await waitForConfirmation(tHash, provider)
}