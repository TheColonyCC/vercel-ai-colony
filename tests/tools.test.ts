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
} from "../src/tools.js";
import type { ColonyClient } from "@thecolony/sdk";

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
    ...overrides,
  } as unknown as ColonyClient;
}

describe("colonyTools bundle", () => {
  it("returns all 11 tools", () => {
    const client = mockClient();
    const tools = colonyTools(client);
    const names = Object.keys(tools);
    expect(names).toHaveLength(11);
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
  it("excludes write tools", () => {
    const client = mockClient();
    const tools = colonyReadOnlyTools(client);
    const names = Object.keys(tools);
    expect(names).not.toContain("colonyCreatePost");
    expect(names).not.toContain("colonyCreateComment");
    expect(names).not.toContain("colonySendMessage");
    expect(names).toContain("colonySearch");
    expect(names).toContain("colonyGetPosts");
    expect(names).toContain("colonyGetPost");
  });
});

describe("colonySearch", () => {
  it("calls client.search with the right params", async () => {
    const client = mockClient();
    const t = colonySearch(client);
    await t.execute({ query: "ai agents", limit: 5 }, { toolCallId: "tc1", messages: [] });
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
    await t.execute(
      { colony: "general", sort: "top", limit: 5 },
      { toolCallId: "tc1", messages: [] },
    );
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
    const result = await t.execute({ postId: "p1" }, { toolCallId: "tc1", messages: [] });
    expect(client.getPost).toHaveBeenCalledWith("p1");
    expect(result.id).toBe("p1");
    expect(result.title).toBe("Test");
    expect(result.author.username).toBe("alice");
  });
});

describe("colonyGetComments", () => {
  it("iterates comments up to maxComments", async () => {
    const client = mockClient();
    const t = colonyGetComments(client);
    const result = await t.execute(
      { postId: "p1", maxComments: 20 },
      { toolCallId: "tc1", messages: [] },
    );
    expect(client.iterComments).toHaveBeenCalledWith("p1", 20);
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0]?.author).toBe("bob");
  });
});

describe("colonyCreatePost", () => {
  it("creates a post and returns its URL", async () => {
    const client = mockClient();
    const t = colonyCreatePost(client);
    const result = await t.execute(
      { title: "Hello", body: "World", colony: "general", postType: "discussion" },
      { toolCallId: "tc1", messages: [] },
    );
    expect(client.createPost).toHaveBeenCalledWith("Hello", "World", {
      colony: "general",
      postType: "discussion",
    });
    expect(result.url).toContain("p2");
  });
});

describe("colonyCreateComment", () => {
  it("creates a comment with optional parentId", async () => {
    const client = mockClient();
    const t = colonyCreateComment(client);
    await t.execute(
      { postId: "p1", body: "nice post", parentId: "c0" },
      { toolCallId: "tc1", messages: [] },
    );
    expect(client.createComment).toHaveBeenCalledWith("p1", "nice post", "c0");
  });
});

describe("colonySendMessage", () => {
  it("sends a DM", async () => {
    const client = mockClient();
    const t = colonySendMessage(client);
    const result = await t.execute(
      { username: "alice", body: "hello" },
      { toolCallId: "tc1", messages: [] },
    );
    expect(client.sendMessage).toHaveBeenCalledWith("alice", "hello");
    expect(result.body).toBe("hello");
  });
});

describe("colonyGetUser", () => {
  it("looks up a user profile", async () => {
    const client = mockClient();
    const t = colonyGetUser(client);
    const result = await t.execute({ userId: "u1" }, { toolCallId: "tc1", messages: [] });
    expect(client.getUser).toHaveBeenCalledWith("u1");
    expect(result.username).toBe("alice");
    expect(result.karma).toBe(42);
  });
});

describe("colonyDirectory", () => {
  it("calls client.directory with filters", async () => {
    const client = mockClient();
    const t = colonyDirectory(client);
    await t.execute(
      { query: "research", userType: "agent", sort: "karma", limit: 10 },
      { toolCallId: "tc1", messages: [] },
    );
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
    const result = await t.execute({}, { toolCallId: "tc1", messages: [] });
    expect(client.getMe).toHaveBeenCalled();
    expect(result.username).toBe("mybot");
  });
});

describe("colonyGetNotifications", () => {
  it("calls getNotifications with filters", async () => {
    const client = mockClient();
    const t = colonyGetNotifications(client);
    await t.execute({ unreadOnly: true, limit: 5 }, { toolCallId: "tc1", messages: [] });
    expect(client.getNotifications).toHaveBeenCalledWith({
      unreadOnly: true,
      limit: 5,
    });
  });
});
