import { useChatStore } from "@/stores/chat-store";
import { ResponseMetrics } from "@/types/response-metrics.type";
import { Plus, RefreshCcw, Sheet } from "lucide-react";
import { CSVLink } from "react-csv";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "./ui/menubar";

export function ChatToolbar() {
  const chats = useChatStore((state) => state.chats);
  const addChat = useChatStore((state) => state.addChat);
  const resetChats = useChatStore((state) => state.resetChats);

  const csvData = chats.flatMap((chat) => {
    const assistantMessages = chat.messages?.filter((m) => m.role === "assistant") ?? [];

    return assistantMessages.map((m) => {
      const metrics = m.data as ResponseMetrics;

      const params = {
        systemPrompt: chat.model.config?.systemPrompt ?? "",
        maxTokens: chat.model.config?.maxTokens?.value ?? "",
        temperature: chat.model.config?.temperature?.value ?? "",
        topP: chat.model.config?.topP?.value ?? "",
      };

      return {
        messageId: m.id,
        modelId: chat.model.id,
        modelParams: JSON.stringify(params).replace(/"/g, '""'),
        region: chat.model.region ?? "n/a",
        ...metrics,
      };
    });
  });

  return (
    <>
      <Menubar className="bg-muted dark:bg-background">
        <MenubarMenu>
          <MenubarTrigger className="text-xs">Models</MenubarTrigger>
          <MenubarContent className="*:!text-xs">
            <MenubarItem onClick={() => addChat()}>
              <Plus className="mr-2 size-4" />
              Add Model
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => resetChats()}>
              <RefreshCcw className="mr-2 size-4" />
              Clear Chats
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-xs">Compare</MenubarTrigger>
          <MenubarContent className="*:!text-xs">
            <MenubarItem>
              <CSVLink data={csvData} filename="results.csv" className="flex items-center">
                <Sheet className="mr-2 h-4 w-4" />
                Export Results
              </CSVLink>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  );
}
