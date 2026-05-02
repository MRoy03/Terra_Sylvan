import { doc, updateDoc, getDoc, increment } from 'firebase/firestore'
import { db } from './firebase'

export const SEED_GIFT_AMOUNT = 10
export const SEED_GIFT_COST   = 10  // seeds the sender spends

export async function getSeedBalance(uid: string): Promise<number> {
  const snap = await getDoc(doc(db, 'users', uid))
  return (snap.data()?.seeds as number) ?? 0
}

export async function giftSeeds(fromUid: string, toUid: string): Promise<void> {
  const snap = await getDoc(doc(db, 'users', fromUid))
  const balance = (snap.data()?.seeds as number) ?? 0

  if (balance < SEED_GIFT_COST) {
    throw new Error(`Not enough seeds. You have ${balance}, need ${SEED_GIFT_COST}.`)
  }

  await updateDoc(doc(db, 'users', fromUid), { seeds: increment(-SEED_GIFT_COST) })
  await updateDoc(doc(db, 'users', toUid),   { seeds: increment(SEED_GIFT_AMOUNT) })
}

// Award seeds passively (called on login or milestone)
export async function awardSeeds(uid: string, amount: number): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { seeds: increment(amount) })
}
