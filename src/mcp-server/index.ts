import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { registerKnowledgeTools } from "./tools/knowledge.js";

async function main() {
  const server = new McpServer({
    name: "productivity-knowledge",
    version: "1.0.0",
  });

  registerKnowledgeTools(server);

  const isStdio = process.argv.includes("--stdio");

  if (isStdio) {
    // stdio transport — Claude Desktop / Claude Code 연동
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[MCP] productivity-knowledge started (stdio)");
  } else {
    // Streamable HTTP transport — 개발/원격 연동
    const PORT = Number(process.env.MCP_PORT) || 8123;

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    await server.connect(transport);

    const httpServer = createServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

      if (url.pathname === "/mcp") {
        await transport.handleRequest(req, res);
        return;
      }

      // Health check
      if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", server: "productivity-knowledge" }));
        return;
      }

      res.writeHead(404);
      res.end("Not Found");
    });

    httpServer.listen(PORT, () => {
      console.error(`[MCP] productivity-knowledge started on http://localhost:${PORT}/mcp`);
    });
  }
}

main().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
