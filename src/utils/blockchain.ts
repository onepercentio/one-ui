import { PromiEvent } from 'web3-core'

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

export function dispatchAndWait(func: any) {
    const _func = func as PromiEvent<any>
    return new Promise<string>((r, rej) => {
        _func.on('transactionHash', (tX) => {
            r(tX)
        })
        _func.catch(rej)
    })
}

export async function sendAndWaitForConfirmation(func: Promise<void>, provider: any) {
    const tHash = await dispatchAndWait(func)
    await waitForConfirmation(tHash, provider)
}