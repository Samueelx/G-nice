import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/api/axiosBaseQuery";

export interface FollowResponse {
  success: boolean;
  data: {
    following: boolean;
    followers_count: number;
  };
}

export interface CheckFollowingResponse {
  success: boolean;
  data: boolean;
}

export interface PaginatedUsersResponse {
  success: boolean;
  data: {
    users: unknown[];
    total: number;
    page: number;
    page_size: number;
  };
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: axiosBaseQuery({
    baseUrl: "", 
  }),
  tagTypes: ["Follow", "Followers", "Following"],
  endpoints: (builder) => ({
    // Follow a user
    followUser: builder.mutation<FollowResponse, string>({
      query: (username) => ({
        url: `/users/${username}/follow`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, username) => [
        { type: "Follow", id: username },
        { type: "Followers", id: username },
        "Following",
      ],
    }),

    // Unfollow a user
    unfollowUser: builder.mutation<FollowResponse, string>({
      query: (username) => ({
        url: `/users/${username}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, username) => [
        { type: "Follow", id: username },
        { type: "Followers", id: username },
        "Following",
      ],
    }),

    // Check if following a user
    checkIsFollowing: builder.query<boolean, string>({
      query: (username) => ({
        url: `/users/${username}/follow`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (typeof response.data === 'boolean') {
          return response.data;
        }
        if (response.data && typeof response.data === 'object') {
          return response.data.following === true || response.data.is_following === true;
        }
        return false;
      },
      providesTags: (_result, _error, username) => [{ type: "Follow", id: username }],
    }),

    // List followers
    getFollowers: builder.query<PaginatedUsersResponse, { username: string; page?: number; page_size?: number }>({
      query: ({ username, page = 1, page_size = 20 }) => ({
        url: `/users/${username}/followers`,
        method: "GET",
        params: { page, page_size },
      }),
      providesTags: (_result, _error, { username }) => [{ type: "Followers", id: username }],
    }),

    // List following
    getFollowing: builder.query<PaginatedUsersResponse, { username: string; page?: number; page_size?: number }>({
      query: ({ username, page = 1, page_size = 20 }) => ({
        url: `/users/${username}/following`,
        method: "GET",
        params: { page, page_size },
      }),
      providesTags: (_result, _error, { username }) => [{ type: "Following", id: username }],
    }),
  }),
});

export const {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCheckIsFollowingQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
} = usersApi;
