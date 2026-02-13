import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  searchKnowledge,
  getKnowledgeById,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from "../../db/queries/knowledge.js";

export function registerKnowledgeTools(server: McpServer) {
  // search_knowledge
  server.tool(
    "search_knowledge",
    "지식베이스 검색. 키워드(title/content) 및 태그 필터 지원. 인자 없이 호출하면 전체 목록 반환.",
    {
      query: z.string().max(200).optional().describe("검색 키워드 (제목/내용에서 LIKE 검색)"),
      tags: z
        .array(z.string().max(30))
        .max(10)
        .optional()
        .describe("필터링할 태그 목록 (OR 조건)"),
    },
    async ({ query, tags }) => {
      const results = searchKnowledge(query, tags);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
  );

  // get_knowledge
  server.tool(
    "get_knowledge",
    "지식 노트 단건 조회. ID로 특정 노트의 전체 내용을 가져옴.",
    {
      id: z.string().describe("지식 노트 ID"),
    },
    async ({ id }) => {
      const entry = getKnowledgeById(id);
      if (!entry) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `ID "${id}"에 해당하는 지식 노트를 찾을 수 없습니다.`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(entry, null, 2),
          },
        ],
      };
    }
  );

  // create_knowledge
  server.tool(
    "create_knowledge",
    "새 지식 노트 생성. 제목과 내용은 필수, 태그와 출처는 선택.",
    {
      title: z.string().min(1).max(200).describe("노트 제목 (1~200자)"),
      content: z.string().min(1).max(10000).describe("노트 내용 (1~10000자)"),
      tags: z
        .array(z.string().max(30))
        .max(10)
        .optional()
        .describe("태그 목록 (최대 10개, 각 30자)"),
      source: z
        .enum(["manual", "ai-chat", "import"])
        .default("ai-chat")
        .describe("출처 (기본값: ai-chat)"),
    },
    async ({ title, content, tags, source }) => {
      const entry = createKnowledge({
        title,
        content,
        tags: tags ?? [],
        source,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(entry, null, 2),
          },
        ],
      };
    }
  );

  // update_knowledge
  server.tool(
    "update_knowledge",
    "기존 지식 노트 수정. ID 필수, 나머지 필드 중 최소 1개 이상 변경.",
    {
      id: z.string().describe("수정할 노트 ID"),
      title: z.string().min(1).max(200).optional().describe("새 제목"),
      content: z.string().min(1).max(10000).optional().describe("새 내용"),
      tags: z
        .array(z.string().max(30))
        .max(10)
        .optional()
        .describe("새 태그 목록"),
    },
    async ({ id, title, content, tags }) => {
      // 최소 1개 필드 변경 필수
      if (title === undefined && content === undefined && tags === undefined) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: "title, content, tags 중 최소 1개 필드를 지정해야 합니다.",
            },
          ],
        };
      }

      // 존재 확인
      const existing = getKnowledgeById(id);
      if (!existing) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `ID "${id}"에 해당하는 지식 노트를 찾을 수 없습니다.`,
            },
          ],
        };
      }

      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (tags !== undefined) updateData.tags = tags;

      const entry = updateKnowledge(id, updateData as Parameters<typeof updateKnowledge>[1]);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(entry, null, 2),
          },
        ],
      };
    }
  );

  // delete_knowledge
  server.tool(
    "delete_knowledge",
    "지식 노트 삭제. ID 필수.",
    {
      id: z.string().describe("삭제할 노트 ID"),
    },
    async ({ id }) => {
      // 존재 확인
      const existing = getKnowledgeById(id);
      if (!existing) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `ID "${id}"에 해당하는 지식 노트를 찾을 수 없습니다.`,
            },
          ],
        };
      }

      deleteKnowledge(id);
      return {
        content: [
          {
            type: "text" as const,
            text: `노트 "${existing.title}" (ID: ${id})가 삭제되었습니다.`,
          },
        ],
      };
    }
  );
}
