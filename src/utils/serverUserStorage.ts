import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books' | 'meditation' | 'self-care';
  duration?: string;
  completed: boolean;
  videoId?: string;
}

export interface Taglines {
  music: string;
  video: string;
  books: {
    booksnames: string[];
    bookdetails: string[];
  };
  selfcare: {
    selfcarenames: string[];
    selfcaredetails: string[];
  };
  meditationpractices: {
    meditationnames: string[];
    meditationdetails: string[];
  };
  mindfulactivities: {
    mindfulactivitiesnames: string[];
    mindfulactivitiesdetails: string[];
  };
  dailyAffirmation: string;
}

export interface UserData {
  username: string;
  chatHistory: { message: string; timestamp: number }[];
  suggestions: Suggestion[];
  dashboardData: { [key: string]: any };
  taglines: Taglines;
  completedItems: Record<string, boolean>;
}

const connectWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await connectDB();
      return true;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const getUserData = async (username: string): Promise<UserData | null> => {
  try {
    await connectWithRetry();
    
    if (!User) {
      console.error('User model not available');
      return null;
    }
    
    const user = await User.findOne({ username });
    
    if (!user) {
      return null;
    }

    return {
      username: user.username,
      chatHistory: user.chatHistory,
      suggestions: user.suggestions,
      dashboardData: user.dashboardData,
      taglines: user.taglines,
      completedItems: user.completedItems,
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

const setUserData = async (username: string, data: UserData): Promise<boolean> => {
  try {
    await connectWithRetry();
    
    if (!User) {
      console.error('User model not available');
      return false;
    }
    
    const userData = {
      username: data.username,
      chatHistory: data.chatHistory,
      suggestions: data.suggestions,
      dashboardData: data.dashboardData,
      taglines: data.taglines,
      completedItems: data.completedItems,
    };

    await User.findOneAndUpdate(
      { username },
      userData,
      { upsert: true, new: true }
    );

    return true;
  } catch (error) {
    console.error('Error setting user data:', error);
    return false;
  }
};

const updateUserData = async (username: string, updates: Partial<UserData>): Promise<boolean> => {
  try {
    await connectWithRetry();
    
    if (!User) {
      console.error('User model not available');
      return false;
    }
    
    const updateData: any = {};
    
    if (updates.chatHistory !== undefined) updateData.chatHistory = updates.chatHistory;
    if (updates.suggestions !== undefined) updateData.suggestions = updates.suggestions;
    if (updates.dashboardData !== undefined) updateData.dashboardData = updates.dashboardData;
    if (updates.taglines !== undefined) updateData.taglines = updates.taglines;
    if (updates.completedItems !== undefined) updateData.completedItems = updates.completedItems;

    await User.findOneAndUpdate(
      { username },
      updateData,
      { new: true }
    );

    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

const createUser = async (username: string): Promise<boolean> => {
  try {
    await connectWithRetry();
    
    if (!User) {
      console.error('User model not available');
      return false;
    }
    
    const defaultUserData: UserData = {
      username,
      chatHistory: [],
      suggestions: [],
      dashboardData: {},
      taglines: {
        music: '',
        video: '',
        books: { booksnames: [], bookdetails: [] },
        selfcare: { selfcarenames: [], selfcaredetails: [] },
        meditationpractices: { meditationnames: [], meditationdetails: [] },
        mindfulactivities: { mindfulactivitiesnames: [], mindfulactivitiesdetails: [] },
        dailyAffirmation: '',
      },
      completedItems: {},
    };

    return await setUserData(username, defaultUserData);
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
};

const userExists = async (username: string): Promise<boolean> => {
  try {
    await connectWithRetry();
    
    if (!User) {
      console.error('User model not available');
      return false;
    }
    
    const user = await User.findOne({ username });
    return !!user;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

export { getUserData, setUserData, updateUserData, createUser, userExists }; 