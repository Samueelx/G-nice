import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '@/store/store';
import { Topic, Post, TopicEvent } from '@/types/topic';

// State structure
interface TopicState {
  currentTopic: Topic | null;
  posts: Post[];
  events: TopicEvent[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  currentTopic: null,
  posts: [],
  events: [],
  isLoading: false,
  error: null,
};

const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {
    setCurrentTopic(state, action: PayloadAction<Topic>) {
      state.currentTopic = action.payload;
    },
    setTopicPosts(state, action: PayloadAction<Post[]>) {
      state.posts = action.payload;
    },
    setTopicEvents(state, action: PayloadAction<TopicEvent[]>) {
      state.events = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    handleTopicSocketMessage(state, action: PayloadAction<any>) {
      const { type, data } = action.payload;

      switch (type) {
        case 'TOPIC_DATA':
          state.currentTopic = data.topic;
          state.posts = data.posts;
          state.events = data.events;
          state.isLoading = false;
          state.error = null;
          break;
        case 'NEW_TOPIC_POST':
          state.posts.unshift(data);
          break;
        case 'TOPIC_UPDATED':
          if (state.currentTopic) {
            state.currentTopic = { ...state.currentTopic, ...data };
          }
          break;
        case 'NEW_TOPIC_EVENT':
          state.events.unshift(data);
          break;
        default:
          break;
      }
    },
  },
});

// Thunk to send WebSocket request
export const fetchTopicData = (handle: string) => (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch({
    type: 'ws/send',
    payload: {
      type: 'FETCH_TOPIC_DATA',
      payload: { handle },
    },
  });
};

// Selectors
export const selectCurrentTopic = (state: RootState) => state.topic.currentTopic;
export const selectTopicPosts = (state: RootState) => state.topic.posts;
export const selectTopicEvents = (state: RootState) => state.topic.events;
export const selectTopicLoading = (state: RootState) => state.topic.isLoading;
export const selectTopicError = (state: RootState) => state.topic.error;

// Actions & Reducer
export const {
  setCurrentTopic,
  setTopicPosts,
  setTopicEvents,
  setLoading,
  setError,
  handleTopicSocketMessage,
} = topicSlice.actions;

export default topicSlice.reducer;
