/**
 * Unit tests for Colony AI tools.
 *
 * Each test verifies the tool definition (description, schema) and that
 * the execute function calls the correct ColonyClient method with the
 * right arguments.
 */

import { describe, expect, it, vi } from "vitest";
import {
  colonyTools,
  colonyReadOnlyTools,
  colonySearch,
  colonyGetPosts,
  colonyGetPost,
  colonyGetComments,
  colonyCreatePost,
  colonyCreateComment,
  colonySendMessage,
  colonyGetUser,
  colonyDirectory,
  colonyGetMe,
  colonyGetNotifications,
  colonyVotePost,
  colonyVoteComment,
  colonyReactPost,
  colonyGetPoll,
  colonyVotePoll,
  colonyListConversations,
  colonyGetConversation,
  colonyFollow,
  colonyUnfollow,
  colonyListColonies,
  colonyIterPosts,
  colonyUpdatePost,
  colonyDeletePost,
  colonyReactComment,
  colonyMarkNotificationsRead,
  colonyJoinColony,
  colonyLeaveColony,
  colonyGetNotificationCount,
  colonyGetUnreadCount,
  colonySystemPrompt,
} from "../src/tools.js";
import type { ColonyClient } from "@thecolony/sdk";
import { ColonyRateLimitError } from "@thecolony/sdk";

function mockClient(overrides: Partial<ColonyClient> = {}): ColonyClient {
  return {
    search: vi.fn().mockResolvedValue({ items: [], total: 0, users: [] }),
    getPosts: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getPost: vi.fn().mockResolvedValue({
      id: "p1",
      title: "Test",
      body: "body",
      author: { username: "alice", display_name: "Alice", user_type: "agent", karma: 10 },
      post_type: "discussion",
      colony_id: "col1",
      score: 5,
      comment_count: 2,
      language: "en",
      tags: null,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    }),
    iterComments: vi.fn().mockImplementation(async function* () {
      yield {
        id: "c1",
        author: { username: "bob" },
        body: "a comment",
        parent_id: null,
        score: 1,
        created_at: "2026-01-01",
      };
    }),
    createPost: vi.fn().mockResolvedValue({
      id: "p2",
      title: "New Post",
      created_at: "2026-01-01",
    }),
    createComment: vi.fn().mockResolvedValue({
      id: "c2",
      post_id: "p1",
      body: "my comment",
      created_at: "2026-01-01",
    }),
    sendMessage: vi.fn().mockResolvedValue({
      id: "m1",
      body: "hello",
      created_at: "2026-01-01",
    }),
    getUser: vi.fn().mockResolvedValue({
      id: "u1",
      username: "alice",
      display_name: "Alice",
      user_type: "agent",
      bio: "An agent",
      karma: 42,
      capabilities: { skills: ["ts"] },
      created_at: "2026-01-01",
    }),
    directory: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getMe: vi.fn().mockResolvedValue({
      id: "me1",
      username: "mybot",
      display_name: "My Bot",
      user_type: "agent",
      bio: "I'm a bot",
      karma: 10,
      capabilities: {},
      created_at: "2026-01-01",
    }),
    getNotifications: vi.fn().mockResolvedValue([]),
    votePost: vi.fn().mockResolvedValue({}),
    voteComment: vi.fn().mockResolvedValue({}),
    reactPost: vi.fn().mockResolvedValue({}),
    getPoll: vi.fn().mockResolvedValue({
      options: [],
      total_votes: 0,
      is_closed: false,
      closes_at: null,
      user_has_voted: false,
    }),
    votePoll: vi.fn().mockResolvedValue({}),
    listConversations: vi.fn().mockResolvedValue([]),
    getConversation: vi.fn().mockResolvedValue({
      other_user: { username: "bob" },
      messages: [
        {
          id: "m1",
          sender: { username: "alice" },
          body: "hi",
          is_read: true,
          created_at: "2026-01-01",
        },
      ],
    }),
    follow: vi.fn().mockResolvedValue({}),
    unfollow: vi.fn().mockResolvedValue({}),
    getColonies: vi
      .fn()
      .mockResolvedValue([
        { name: "general", display_name: "General", description: "Main colony", member_count: 100 },
      ]),
    updatePost: vi.fn().mockResolvedValue({ id: "p1", title: "Updated", updated_at: "2026-01-02" }),
    deletePost: vi.fn().mockResolvedValue({}),
    reactComment: vi.fn().mockResolvedValue({}),
    markNotificationsRead: vi.fn().mockResolvedValue({}),
    joinColony: vi.fn().mockResolvedValue({ success: true }),
    leaveColony: vi.fn().mockResolvedValue({ success: true }),
    getNotificationCount: vi.fn().mockResolvedValue({ count: 5 }),
    getUnreadCount: vi.fn().mockResolvedValue({ count: 3 }),
    iterPosts: vi.fn().mockImplementation(async function* () {
      yield {
        id: "p1",
        title: "Test",
        body: "body",
        author: { username: "alice" },
        post_type: "discussion",
        colony_id: "general",
        score: 5,
        comment_count: 2,
        created_at: "2026-01-01",
      };
    }),
    ...overrides,
  } as unknown as ColonyClient;
}

const opts = { toolCallId: "tc1", messages: [] as never[] };

describe("colonyTools bundle", () => {
  it("returns all 30 tools", () => {
    const client = mockClient();
    const tools = colonyTools(client);
    const names = Object.keys(tools);
    expect(names).toHaveLength(30);
    expect(names).toContain("colonySearch");
    expect(names).toContain("colonyGetPosts");
    expect(names).toContain("colonyGetPost");
    expect(names).toContain("colonyGetComments");
    expect(names).toContain("colonyCreatePost");
    expect(names).toContain("colonyCreateComment");
    expect(names).toContain("colonySendMessage");
    expect(names).toContain("colonyGetUser");
    expect(names).toContain("colonyDirectory");
    expect(names).toContain("colonyGetMe");
    expect(names).toContain("colonyGetNotifications");
    expect(names).toContain("colonyVotePost");
    expect(names).toContain("colonyVoteComment");
    expect(names).toContain("colonyReactPost");
    expect(names).toContain("colonyGetPoll");
    expect(names).toContain("colonyVotePoll");
    expect(names).toContain("colonyListConversations");
    expect(names).toContain("colonyGetConversation");
    expect(names).toContain("colonyFollow");
    expect(names).toContain("colonyListColonies");
  });

  it("every tool has a description", () => {
    const client = mockClient();
    const tools = colonyTools(client);
    for (const [name, t] of Object.entries(tools)) {
      expect((t as any).description, `${name} missing description`).toBeTruthy();
    }
  });
});

describe("colonyReadOnlyTools bundle", () => {
  it("returns 15 tools", () => {
    const client = mockClient();
    const tools = colonyReadOnlyTools(client);
    const names = Object.keys(tools);
    expect(names).toHaveLength(15);
  });

  it("excludes write tools", () => {
    const client = mockClient();
    const tools = colonyReadOnlyTools(client);
    const names = Object.keys(tools);
    expect(names).not.toContain("colonyCreatePost");
    expect(names).not.toContain("colonyCreateComment");
    expect(names).not.toContain("colonySendMessage");
    expect(names).not.toContain("colonyVotePost");
    expect(names).not.toContain("colonyVoteComment");
    expect(names).not.toContain("colonyReactPost");
    expect(names).not.toContain("colonyVotePoll");
    expect(names).not.toContain("colonyFollow");
    expect(names).toContain("colonySearch");
    expect(names).toContain("colonyGetPosts");
    expect(names).toContain("colonyGetPost");
  });
});

describe("colonySearch", () => {
  it("calls client.search with the right params", async () => {
    const client = mockClient();
    const t = colonySearch(client);
    await t.execute({ query: "ai agents", limit: 5 }, opts);
    expect(client.search).toHaveBeenCalledWith("ai agents", {
      limit: 5,
      postType: undefined,
      sort: undefined,
    });
  });
});

describe("colonyGetPosts", () => {
  it("calls client.getPosts", async () => {
    const client = mockClient();
    const t = colonyGetPosts(client);
    await t.execute({ colony: "general", sort: "top", limit: 5 }, opts);
    expect(client.getPosts).toHaveBeenCalledWith({
      colony: "general",
      sort: "top",
      limit: 5,
      postType: undefined,
    });
  });
});

describe("colonyGetPost", () => {
  it("returns full post details", async () => {
    const client = mockClient();
    const t = colonyGetPost(client);
    const result = await t.execute({ postId: "p1" }, opts);
    expect(client.getPost).toHaveBeenCalledWith("p1");
    expect((result as any).id).toBe("p1");
    expect((result as any).title).toBe("Test");
    expect((result as any).author.username).toBe("alice");
  });
});

describe("colonyGetComments", () => {
  it("iterates comments up to maxComments", async () => {
    const client = mockClient();
    const t = colonyGetComments(client);
    const result = await t.execute({ postId: "p1", maxComments: 20 }, opts);
    expect(client.iterComments).toHaveBeenCalledWith("p1", 20);
    expect((result as any).comments).toHaveLength(1);
    expect((result as any).comments[0]?.author).toBe("bob");
  });
});

describe("colonyCreatePost", () => {
  it("creates a post and returns its URL", async () => {
    const client = mockClient();
    const t = colonyCreatePost(client);
    const result = await t.execute(
      { title: "Hello", body: "World", colony: "general", postType: "discussion" },
      opts,
    );
    expect(client.createPost).toHaveBeenCalledWith("Hello", "World", {
      colony: "general",
      postType: "discussion",
    });
    expect((result as any).url).toContain("p2");
  });
});

describe("colonyCreateComment", () => {
  it("creates a comment with optional parentId", async () => {
    const client = mockClient();
    const t = colonyCreateComment(client);
    await t.execute({ postId: "p1", body: "nice post", parentId: "c0" }, opts);
    expect(client.createComment).toHaveBeenCalledWith("p1", "nice post", "c0");
  });
});

describe("colonySendMessage", () => {
  it("sends a DM", async () => {
    const client = mockClient();
    const t = colonySendMessage(client);
    const result = await t.execute({ username: "alice", body: "hello" }, opts);
    expect(client.sendMessage).toHaveBeenCalledWith("alice", "hello");
    expect((result as any).body).toBe("hello");
  });
});

describe("colonyGetUser", () => {
  it("looks up a user profile", async () => {
    const client = mockClient();
    const t = colonyGetUser(client);
    const result = await t.execute({ userId: "u1" }, opts);
    expect(client.getUser).toHaveBeenCalledWith("u1");
    expect((result as any).username).toBe("alice");
    expect((result as any).karma).toBe(42);
  });
});

describe("colonyDirectory", () => {
  it("calls client.directory with filters", async () => {
    const client = mockClient();
    const t = colonyDirectory(client);
    await t.execute({ query: "research", userType: "agent", sort: "karma", limit: 10 }, opts);
    expect(client.directory).toHaveBeenCalledWith({
      query: "research",
      userType: "agent",
      sort: "karma",
      limit: 10,
    });
  });
});

describe("colonyGetMe", () => {
  it("returns the agent's own profile", async () => {
    const client = mockClient();
    const t = colonyGetMe(client);
    const result = await t.execute({}, opts);
    expect(client.getMe).toHaveBeenCalled();
    expect((result as any).username).toBe("mybot");
  });
});

describe("colonyGetNotifications", () => {
  it("calls getNotifications with filters", async () => {
    const client = mockClient();
    const t = colonyGetNotifications(client);
    await t.execute({ unreadOnly: true, limit: 5 }, opts);
    expect(client.getNotifications).toHaveBeenCalledWith({
      unreadOnly: true,
      limit: 5,
    });
  });
});

describe("colonyVotePost", () => {
  it("calls client.votePost with correct postId and parsed int value", async () => {
    const client = mockClient();
    const t = colonyVotePost(client);
    await t.execute({ postId: "p1", value: "1" }, opts);
    expect(client.votePost).toHaveBeenCalledWith("p1", 1);
  });
});

describe("colonyVoteComment", () => {
  it("calls client.voteComment", async () => {
    const client = mockClient();
    const t = colonyVoteComment(client);
    await t.execute({ commentId: "c1", value: "-1" }, opts);
    expect(client.voteComment).toHaveBeenCalledWith("c1", -1);
  });
});

describe("colonyReactPost", () => {
  it("calls client.reactPost with postId and emoji", async () => {
    const client = mockClient();
    const t = colonyReactPost(client);
    await t.execute({ postId: "p1", emoji: "fire" }, opts);
    expect(client.reactPost).toHaveBeenCalledWith("p1", "fire");
  });
});

describe("colonyGetPoll", () => {
  it("calls client.getPoll and returns options", async () => {
    const client = mockClient();
    const t = colonyGetPoll(client);
    const result = await t.execute({ postId: "p1" }, opts);
    expect(client.getPoll).toHaveBeenCalledWith("p1");
    expect((result as any).options).toBeDefined();
  });
});

describe("colonyVotePoll", () => {
  it("calls client.votePoll with optionIds array", async () => {
    const client = mockClient();
    const t = colonyVotePoll(client);
    await t.execute({ postId: "p1", optionIds: ["o1", "o2"] }, opts);
    expect(client.votePoll).toHaveBeenCalledWith("p1", ["o1", "o2"]);
  });
});

describe("colonyListConversations", () => {
  it("calls client.listConversations", async () => {
    const client = mockClient();
    const t = colonyListConversations(client);
    await t.execute({}, opts);
    expect(client.listConversations).toHaveBeenCalled();
  });
});

describe("colonyGetConversation", () => {
  it("calls client.getConversation and returns messages", async () => {
    const client = mockClient();
    const t = colonyGetConversation(client);
    const result = await t.execute({ username: "bob" }, opts);
    expect(client.getConversation).toHaveBeenCalledWith("bob");
    expect((result as any).messages).toBeDefined();
  });
});

describe("colonyFollow", () => {
  it("calls client.follow with userId", async () => {
    const client = mockClient();
    const t = colonyFollow(client);
    await t.execute({ userId: "u1" }, opts);
    expect(client.follow).toHaveBeenCalledWith("u1");
  });
});

describe("colonyListColonies", () => {
  it("calls client.getColonies and returns colony list", async () => {
    const client = mockClient();
    const t = colonyListColonies(client);
    const result = await t.execute({}, opts);
    expect(client.getColonies).toHaveBeenCalled();
    expect((result as any).colonies).toBeDefined();
  });
});

describe("colonyUnfollow", () => {
  it("calls client.unfollow", async () => {
    const client = mockClient();
    const t = colonyUnfollow(client);
    await t.execute({ userId: "u1" }, opts);
    expect(client.unfollow).toHaveBeenCalledWith("u1");
  });
});

describe("colonyUpdatePost", () => {
  it("calls client.updatePost", async () => {
    const client = mockClient();
    const t = colonyUpdatePost(client);
    const result = await t.execute({ postId: "p1", title: "Updated" }, opts);
    expect(client.updatePost).toHaveBeenCalledWith("p1", { title: "Updated", body: undefined });
    expect((result as any).title).toBe("Updated");
  });
});

describe("colonyDeletePost", () => {
  it("calls client.deletePost", async () => {
    const client = mockClient();
    const t = colonyDeletePost(client);
    const result = await t.execute({ postId: "p1" }, opts);
    expect(client.deletePost).toHaveBeenCalledWith("p1");
    expect((result as any).success).toBe(true);
  });
});

describe("colonyReactComment", () => {
  it("calls client.reactComment", async () => {
    const client = mockClient();
    const t = colonyReactComment(client);
    const result = await t.execute({ commentId: "c1", emoji: "heart" }, opts);
    expect(client.reactComment).toHaveBeenCalledWith("c1", "heart");
    expect((result as any).emoji).toBe("heart");
  });
});

describe("colonyMarkNotificationsRead", () => {
  it("calls client.markNotificationsRead", async () => {
    const client = mockClient();
    const t = colonyMarkNotificationsRead(client);
    const result = await t.execute({}, opts);
    expect(client.markNotificationsRead).toHaveBeenCalled();
    expect((result as any).success).toBe(true);
  });
});

describe("colonyJoinColony", () => {
  it("calls client.joinColony", async () => {
    const client = mockClient();
    const t = colonyJoinColony(client);
    await t.execute({ colony: "crypto" }, opts);
    expect(client.joinColony).toHaveBeenCalledWith("crypto");
  });
});

describe("colonyLeaveColony", () => {
  it("calls client.leaveColony", async () => {
    const client = mockClient();
    const t = colonyLeaveColony(client);
    await t.execute({ colony: "crypto" }, opts);
    expect(client.leaveColony).toHaveBeenCalledWith("crypto");
  });
});

describe("colonyGetNotificationCount", () => {
  it("calls client.getNotificationCount", async () => {
    const client = mockClient();
    const t = colonyGetNotificationCount(client);
    const result = await t.execute({}, opts);
    expect(client.getNotificationCount).toHaveBeenCalled();
    expect((result as any).count).toBe(5);
  });
});

describe("colonyGetUnreadCount", () => {
  it("calls client.getUnreadCount", async () => {
    const client = mockClient();
    const t = colonyGetUnreadCount(client);
    const result = await t.execute({}, opts);
    expect(client.getUnreadCount).toHaveBeenCalled();
    expect((result as any).count).toBe(3);
  });
});

describe("colonyIterPosts", () => {
  it("iterates posts", async () => {
    const client = mockClient();
    const t = colonyIterPosts(client);
    const result = await t.execute({ colony: "general", sort: "top", maxResults: 10 }, opts);
    expect(client.iterPosts).toHaveBeenCalled();
    expect((result as any).count).toBe(1);
    expect((result as any).posts[0]?.id).toBe("p1");
  });
});

describe("safeExecute error handling", () => {
  it("returns error object with retryAfter on ColonyRateLimitError", async () => {
    const err = new ColonyRateLimitError("rate limited", 429, {}, "RATE_LIMITED", 30);
    const client = mockClient({
      search: vi.fn().mockRejectedValue(err),
    } as any);
    const t = colonySearch(client);
    const result = await t.execute({ query: "test" }, opts);
    expect((result as any).error).toContain("Rate limited");
    expect((result as any).retryAfter).toBe(30);
  });
});

describe("colonySystemPrompt", () => {
  it("returns a string containing the agent username", async () => {
    const client = mockClient();
    const prompt = await colonySystemPrompt(client);
    expect(typeof prompt).toBe("string");
    expect(prompt).toContain("mybot");
  });
});
