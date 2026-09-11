import { useLiveQuery } from 'dexie-react-hooks';
import { db, ProgressPhoto } from '../lib/db';

export function useProgressPhotos() {
  const photos = useLiveQuery(
    () => db.progressPhotos.orderBy('date').reverse().toArray(),
    []
  );

  const addPhoto = async (entry: Omit<ProgressPhoto, 'id' | 'createdAt'>) => {
    await db.progressPhotos.add({
      ...entry,
      createdAt: Date.now(),
    } as ProgressPhoto);
  };

  const deletePhoto = async (id: number) => {
    await db.progressPhotos.delete(id);
  };

  return {
    photos: photos || [],
    addPhoto,
    deletePhoto,
    isLoading: photos === undefined
  };
}
