import { doc, setDoc, updateDoc as _updateDoc } from "firebase/firestore";

export async function createDoc(firestore: any, path: string, data: any) {
  return await setDoc(doc(firestore, path), data);
}

export async function updateDoc<T extends Object = any>(
  firestore: any,
  path: string,
  data: Partial<T>
) {
  return await _updateDoc(doc(firestore, path), data as any);
}
