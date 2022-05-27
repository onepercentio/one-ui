import { doc, setDoc } from "firebase/firestore";

export async function createDoc(firestore: any, path: string, data: any) {
  return await setDoc(doc(firestore, path), data);
}
