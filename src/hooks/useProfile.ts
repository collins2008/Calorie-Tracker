import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserProfile } from '../lib/db';

export function useProfile() {
  const profileData = useLiveQuery(async () => {
    const data = await db.profile.get('default');
    return data || null; // Return null if not found to distinguish from undefined (loading)
  });
  
  const isLoading = profileData === undefined;
  const profile = profileData === null ? undefined : profileData;
  const isOnboarded = !!profile;

  const saveProfile = async (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    await db.profile.put({
      id: 'default',
      ...data,
      createdAt: profile?.createdAt || now,
      updatedAt: now,
    } as UserProfile);
  };

  const updateWeight = async (weight: number) => {
    if (!profile) return;
    await db.profile.update('default', {
      weight,
      updatedAt: Date.now(),
    });
  };

  return { profile, isLoading, isOnboarded, saveProfile, updateWeight };
}
