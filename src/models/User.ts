import mongoose, { Schema, Document } from 'mongoose';

export interface ISuggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books' | 'meditation' | 'self-care';
  duration?: string;
  completed: boolean;
  videoId?: string;
}

export interface ITaglines {
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

export interface IUser extends Document {
  username: string;
  chatHistory: { message: string; timestamp: number }[];
  suggestions: ISuggestion[];
  dashboardData: { [key: string]: any };
  taglines: ITaglines;
  completedItems: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['activities', 'music', 'videos', 'books', 'meditation', 'self-care']
  },
  duration: { type: String },
  completed: { type: Boolean, default: false },
  videoId: { type: String }
});

const TaglinesSchema = new Schema<ITaglines>({
  music: { type: String, default: '' },
  video: { type: String, default: '' },
  books: {
    booksnames: { type: [String], default: [] },
    bookdetails: { type: [String], default: [] }
  },
  selfcare: {
    selfcarenames: { type: [String], default: [] },
    selfcaredetails: { type: [String], default: [] }
  },
  meditationpractices: {
    meditationnames: { type: [String], default: [] },
    meditationdetails: { type: [String], default: [] }
  },
  mindfulactivities: {
    mindfulactivitiesnames: { type: [String], default: [] },
    mindfulactivitiesdetails: { type: [String], default: [] }
  },
  dailyAffirmation: { type: String, default: '' }
});

const UserSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  chatHistory: [{
    message: { type: String, required: true },
    timestamp: { type: Number, required: true }
  }],
  suggestions: [SuggestionSchema],
  dashboardData: { type: Schema.Types.Mixed, default: {} },
  taglines: { type: TaglinesSchema, default: () => ({}) },
  completedItems: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Only create the model if we're on the server side
let UserModel: mongoose.Model<IUser> | null = null;

if (typeof window === 'undefined') {
  // Server-side only
  if (mongoose.models.User) {
    UserModel = mongoose.models.User;
  } else {
    UserModel = mongoose.model<IUser>('User', UserSchema);
  }
}

export default UserModel; 