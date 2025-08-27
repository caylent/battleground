# Convex Functions Documentation

This directory contains all the Convex backend functions for the Battleground application.

## Available Functions

### Prompts (`prompts.ts`)

Complete CRUD operations for managing prompts in the system.

#### Queries (Read Operations)

- **`list()`** - Get all prompts ordered by creation date (newest first)
- **`getById(id)`** - Get a specific prompt by ID
- **`searchByName(searchTerm)`** - Search prompts by name (case-insensitive)
- **`count()`** - Get total number of prompts
- **`paginated(limit?, cursor?)`** - Get prompts with pagination support

#### Mutations (Write Operations)

- **`create(name, prompt)`** - Create a new prompt
- **`update(id, name?, prompt?)`** - Update an existing prompt (partial updates supported)
- **`remove(id)`** - Delete a single prompt
- **`bulkDelete(ids[])`** - Delete multiple prompts at once
- **`duplicate(id, newName?)`** - Create a copy of an existing prompt

### Schema

The prompt schema includes:
```typescript
{
  name: string,        // Display name for the prompt
  prompt: string,      // The actual prompt content
  updatedAt: number,   // Unix timestamp of last update
  _creationTime: number, // Built-in Convex creation timestamp
  _id: Id<"prompts">,    // Built-in Convex document ID
}
```

### Usage Examples

#### Client-side with React

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function PromptsComponent() {
  // Get all prompts
  const prompts = useQuery(api.prompts.list);
  
  // Create a new prompt
  const createPrompt = useMutation(api.prompts.create);
  
  // Update a prompt
  const updatePrompt = useMutation(api.prompts.update);
  
  // Delete a prompt
  const deletePrompt = useMutation(api.prompts.remove);

  const handleCreatePrompt = async () => {
    await createPrompt({
      name: "My New Prompt",
      prompt: "You are a helpful assistant..."
    });
  };

  const handleUpdatePrompt = async (id: string) => {
    await updatePrompt({
      id,
      name: "Updated Name"
    });
  };

  const handleDeletePrompt = async (id: string) => {
    await deletePrompt({ id });
  };

  return (
    <div>
      {prompts?.map(prompt => (
        <div key={prompt._id}>
          <h3>{prompt.name}</h3>
          <p>{prompt.prompt}</p>
          <button onClick={() => handleUpdatePrompt(prompt._id)}>Update</button>
          <button onClick={() => handleDeletePrompt(prompt._id)}>Delete</button>
        </div>
      ))}
      <button onClick={handleCreatePrompt}>Create New Prompt</button>
    </div>
  );
}
```

#### Server-side Actions

```typescript
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const myAction = action({
  args: {},
  handler: async (ctx) => {
    // Create a prompt
    const promptId = await ctx.runMutation(internal.prompts.create, {
      name: "Action Prompt",
      prompt: "This prompt was created from an action"
    });

    // Get the created prompt
    const prompt = await ctx.runQuery(internal.prompts.getById, {
      id: promptId
    });

    return prompt;
  }
});
```

### Testing

Use the test functions in `test-prompts.ts` to verify all CRUD operations:

- **`testPromptOperations()`** - Runs a comprehensive test of all CRUD operations
- **`createSamplePrompt()`** - Creates a sample prompt for manual testing
- **`listAllPrompts()`** - Lists all prompts for debugging

### Features

1. **Type Safety**: All functions use proper TypeScript types and Convex validation
2. **Timestamps**: Automatic tracking of creation and update times
3. **Partial Updates**: Update only the fields you need to change
4. **Bulk Operations**: Delete multiple prompts efficiently
5. **Search**: Find prompts by name with case-insensitive search
6. **Pagination**: Handle large datasets with cursor-based pagination
7. **Duplication**: Easily create copies of existing prompts
8. **Error Handling**: Proper error messages for invalid operations

### Best Practices

1. Always use the provided validation schemas
2. Handle potential null returns from `getById`
3. Use bulk operations for multiple deletions
4. Implement proper error handling in your UI
5. Use pagination for large lists
6. Keep prompt names descriptive and unique when possible

### Chats (`chats.ts`)

Complete CRUD operations for managing chats with advanced pagination and message handling.

#### Queries (Read Operations)

- **`list(limit?, cursor?)`** - Get chats with cursor-based pagination (default limit: 20, max: 100)
- **`listAll()`** - Get all chats without pagination (for simple use cases)
- **`getById(id)`** - Get a specific chat by ID
- **`searchByName(searchTerm, limit?)`** - Search chats by name (case-insensitive)
- **`getRecent(limit?)`** - Get most recently updated chats
- **`count()`** - Get total number of chats
- **`getStats()`** - Get comprehensive chat statistics
- **`getChatWithMessagePagination(id, messageOffset?, messageLimit?)`** - Get chat with paginated messages for large chats
- **`getBranchingPoints(id, messageType?)`** - Get potential branching points in a chat
- **`getBranches(id)`** - Get all branches created from a chat
- **`getParentChat(id)`** - Get parent chat info if this chat is a branch
- **`getBranchingTree(id)`** - Get complete branching tree (root + all branches)

#### Mutations (Write Operations)

- **`create(name, initialMessages?)`** - Create a new chat with optional initial messages
- **`updateMessages(id, messages, name?)`** - Replace all messages in a chat (single update operation)
- **`addMessage(id, message)`** - Add a single message to a chat
- **`updateName(id, name)`** - Update only the chat name
- **`remove(id)`** - Delete a single chat
- **`bulkDelete(ids[])`** - Delete multiple chats at once
- **`branch(id, branchFromIndex?, newName?)`** - Create a branch from a specific message point
- **`clearMessages(id)`** - Remove all messages but keep the chat
- **`archive(id)`** - Archive a chat (adds [ARCHIVED] prefix)

### Chat Schema

The chat schema includes:
```typescript
{
  name: string,           // Display name for the chat
  messages: any[],        // Array of chat messages (flexible schema using v.any())
  updatedAt: number,      // Unix timestamp of last update
  messageCount?: number,  // Cached message count for performance
  parentChatId?: Id<"chats">, // Reference to original chat if this is a branch
  branchFromIndex?: number,   // Index of message this branch started from
  _creationTime: number,  // Built-in Convex creation timestamp
  _id: Id<"chats">,       // Built-in Convex document ID
}
```

### Chat Usage Examples

#### Client-side with React

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function ChatsComponent() {
  // Get paginated chats
  const { data: chatsData } = useQuery(api.chats.list, { limit: 10 });
  
  // Get a specific chat
  const chatId = "some-chat-id";
  const chat = useQuery(api.chats.getById, { id: chatId });
  
  // Get recent chats
  const recentChats = useQuery(api.chats.getRecent, { limit: 5 });
  
  // Chat mutations
  const createChat = useMutation(api.chats.create);
  const updateMessages = useMutation(api.chats.updateMessages);
  const addMessage = useMutation(api.chats.addMessage);
  const deleteChat = useMutation(api.chats.remove);

  const handleCreateChat = async () => {
    await createChat({
      name: "New Conversation",
      initialMessages: [{
        role: "system",
        content: "You are a helpful assistant",
        timestamp: Date.now(),
      }] // Messages can be any structure you need
    });
  };

  const handleUpdateMessages = async (chatId: string, messages: any[]) => {
    await updateMessages({
      id: chatId,
      messages,
    });
  };

  const handleAddMessage = async (chatId: string, content: string) => {
    await addMessage({
      id: chatId,
      message: {
        role: "user",
        content,
        timestamp: Date.now(),
        // Any additional fields you need
      }
    });
  };

  return (
    <div>
      <h2>Chats ({chatsData?.chats.length || 0})</h2>
      
      {/* Pagination controls */}
      {chatsData?.hasMore && (
        <button onClick={() => {/* Load more with cursor */}}>
          Load More
        </button>
      )}
      
      {/* Chat list */}
      {chatsData?.chats.map(chat => (
        <div key={chat._id}>
          <h3>{chat.name}</h3>
          <p>{chat.messageCount} messages</p>
          <p>Created: {new Date(chat._creationTime).toLocaleString()}</p>
          <p>Updated: {new Date(chat.updatedAt).toLocaleString()}</p>
          <button onClick={() => handleAddMessage(chat._id, "Hello!")}>
            Add Message
          </button>
          <button onClick={() => deleteChat({ id: chat._id })}>
            Delete
          </button>
        </div>
      ))}
      
      <button onClick={handleCreateChat}>Create New Chat</button>
    </div>
  );
}
```

#### Server-side Actions

```typescript
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const processChat = action({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    // Get the chat
    const chat = await ctx.runQuery(internal.chats.getById, {
      id: args.chatId
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Add a new message (any structure allowed)
    await ctx.runMutation(internal.chats.addMessage, {
      id: args.chatId,
      message: {
        role: "assistant",
        content: "Response generated by action",
        timestamp: Date.now(),
        // Can include any additional fields as needed
      }
    });

    return { success: true };
  }
});
```

### Chat Pagination

The chat system supports multiple types of pagination:

1. **Chat List Pagination**: Uses cursor-based pagination for efficient loading of large chat lists
2. **Message Pagination**: For individual chats with many messages, use `getChatWithMessagePagination`

```typescript
// Paginated chat loading
const loadChats = async (cursor?: string) => {
  const result = await convex.query(api.chats.list, {
    limit: 20,
    cursor,
  });
  
  return {
    chats: result.chats,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
};

// Message pagination for large chats
const loadChatMessages = async (chatId: string, offset: number) => {
  const result = await convex.query(api.chats.getChatWithMessagePagination, {
    id: chatId,
    messageOffset: offset,
    messageLimit: 50,
  });
  
  return result;
};

// Chat branching examples
const branchChat = async (chatId: string, messageIndex: number) => {
  const branchId = await convex.mutation(api.chats.branch, {
    id: chatId,
    branchFromIndex: messageIndex,
    newName: "Alternative Discussion"
  });
  
  return branchId;
};

// Get branching tree
const getBranchingTree = async (chatId: string) => {
  const tree = await convex.query(api.chats.getBranchingTree, {
    id: chatId
  });
  
  return tree; // { root: {...}, branches: [...] }
};

// Find good branching points
const findBranchingPoints = async (chatId: string) => {
  const points = await convex.query(api.chats.getBranchingPoints, {
    id: chatId,
    messageType: "user" // Only show user messages as branching points
  });
  
  return points;
};
```

### Chat Features

1. **Advanced Pagination**: Cursor-based pagination for chats, offset-based for messages
2. **Bulk Operations**: Efficient bulk deletion and operations
3. **Message Management**: Single update function for all messages as requested
4. **Performance Optimized**: Cached message counts, limited query sizes
5. **Search & Filtering**: Name-based search with flexible limits
6. **Statistics**: Comprehensive chat analytics and statistics
7. **Archiving**: Soft delete functionality for chat management
8. **Chat Branching**: Create conversation branches from any message point
9. **Branching History**: Track parent-child relationships between chats
10. **Branching Tree Views**: Visualize entire conversation tree structures
11. **Flexible Schema**: Messages use `v.any()` for maximum flexibility in structure

## Development

To add new functions:
1. Follow the existing patterns in `prompts.ts`
2. Use proper Convex validation with `v.*` validators
3. Include both queries and mutations as needed
4. Add comprehensive error handling
5. Update this README with documentation