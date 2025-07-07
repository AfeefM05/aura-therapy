import { setUserData, userExists } from './mongoUserStorage';

export interface LocalStorageUserData {
  username: string;
  chatHistory: { message: string; timestamp: number }[];
  suggestions: any[];
  dashboardData: { [key: string]: any };
  taglines: {
    music: string;
    video: string;
    books: { booksnames: string[]; bookdetails: string[] };
    selfcare: { selfcarenames: string[]; selfcaredetails: string[] };
    meditationpractices: { meditationnames: string[]; meditationdetails: string[] };
    mindfulactivities: { mindfulactivitiesnames: string[]; mindfulactivitiesdetails: string[] };
    dailyAffirmation: string;
  };
  completedItems: Record<string, boolean>;
}

export const migrateLocalStorageToMongoDB = async (): Promise<{ success: boolean; migratedUsers: string[]; errors: string[] }> => {
  const migratedUsers: string[] = [];
  const errors: string[] = [];

  try {
    // Get all localStorage keys that start with 'user_'
    const userKeys = Object.keys(localStorage).filter(key => key.startsWith('user_'));
    
    for (const key of userKeys) {
      try {
        const username = key.replace('user_', '');
        const userDataString = localStorage.getItem(key);
        
        if (userDataString) {
          const userData: LocalStorageUserData = JSON.parse(userDataString);
          
          // Check if user already exists in MongoDB
          const exists = await userExists(username);
          
          if (!exists) {
            // Migrate user data to MongoDB
            const success = await setUserData(username, userData);
            
            if (success) {
              migratedUsers.push(username);
              console.log(`Successfully migrated user: ${username}`);
            } else {
              errors.push(`Failed to migrate user: ${username}`);
            }
          } else {
            console.log(`User ${username} already exists in MongoDB, skipping migration`);
          }
        }
      } catch (error) {
        console.error(`Error migrating user from key ${key}:`, error);
        errors.push(`Error migrating user from key ${key}: ${error}`);
      }
    }
    
    return {
      success: errors.length === 0,
      migratedUsers,
      errors
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      migratedUsers,
      errors: [`General migration error: ${error}`]
    };
  }
};

export const clearLocalStorageData = (): void => {
  try {
    // Remove all user-related localStorage items
    const userKeys = Object.keys(localStorage).filter(key => key.startsWith('user_'));
    userKeys.forEach(key => localStorage.removeItem(key));
    
    // Keep currentUser for session management
    console.log('LocalStorage user data cleared successfully');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}; 