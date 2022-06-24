import { useEffect, useState } from "react";
import { DocumentChangeType, Unsubscribe } from "firebase/firestore";

type SnapshotFactoryCb<D extends any> = (changes: {
    doc: D,
    type: DocumentChangeType
}[]) => void

export type SnapshotFactoryReturn<D extends { id: string }> = (cb: SnapshotFactoryCb<D>) => Unsubscribe

export default function useFirestoreWatch<D extends { id: string }, P extends any[]>(queryFactory: (...params: P) => SnapshotFactoryReturn<D>, params: P) {
    const [docsList, updateList] = useState<D[]>();

    useEffect(() => {
        const unsub = queryFactory(...params)((changes) => {
            updateList((prevList = []) => {
                for (let docChange of changes) {
                    switch (docChange.type) {
                        case 'added':
                            if (!prevList.find((f) => f.id === docChange.doc.id)) {
                                prevList.unshift(docChange.doc)
                            }
                            break
                        case 'modified':
                            prevList = prevList!.map((item) => {
                                if (item.id === docChange.doc.id)
                                    for (let key in docChange.doc) {
                                        item[key] = docChange.doc[key];
                                    }
                                return item
                            })
                            break
                        case 'removed':
                            prevList = prevList!.filter(
                                (item) => item.id !== docChange.doc.id
                            )
                            break
                    }
                }

                return [...prevList]
            })

        })
        return unsub;
    }, params);

    return docsList;
}