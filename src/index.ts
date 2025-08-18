import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

type Drand = {
	round: number;
	signature: string;
	previous_signature: string;
	randomness: string;
};

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator",
		version: "1.0.0",
	});

	async init() {
		// Simple addition tool
		this.server.tool(
			"add",
			{ a: z.number(), b: z.number() },
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) }],
			}),
		);

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]),
				a: z.number(),
				b: z.number(),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
					default:
						result = 0; // or throw an error
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			},
		);

		this.server.tool(
			"randomNumber",
			{ a: z.number(), b: z.number() },
			async ({ a, b }) => {
				try {
					const response = await fetch(
						"https://drand.cloudflare.com/public/latest",
					);

					const data = (await response.json()) as Drand;

					const randomHex = data.randomness;
					const startIndex = Math.floor(Math.random() * (randomHex.length - 8));
					const randomValue = parseInt(
						randomHex.slice(startIndex, startIndex + 8),
						16,
					);

					const scaledRandom = (Math.abs(randomValue) % (b - a + 1)) + a;

					return {
						content: [
							{
								type: "text",
								text: String(scaledRandom),
							},
						],
					};
				} catch (__) {
					return {
						content: [
							{
								type: "text",
								text: Math.floor(Math.random() * (b - a + 1) + a),
							},
						],
					};
				}
			},
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
