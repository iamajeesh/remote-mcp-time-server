import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "MCP Time Server",
		version: "1.0.0",
	});

	async init() {
		// Get current time tool
		this.server.tool(
			"get_current_time",
			{ 
				timezone: z.string().optional()
			},
			async ({ timezone }) => {
				try {
					// If no timezone is provided, use UTC
					const tz = timezone || "UTC";
					
					// Format options for the date
					const options: Intl.DateTimeFormatOptions = {
						timeZone: tz,
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						second: 'numeric',
						hour12: false, // 24-hour format
					};
					
					// Get current date and format it according to the timezone
					const currentDate = new Date();
					const formatter = new Intl.DateTimeFormat('en-US', options);
					const formattedDate = formatter.format(currentDate);
					
					// Get the timezone offset
					const tzOffset = formatter.resolvedOptions().timeZone;
					
					return {
						content: [{ 
							type: "text", 
							text: `${formattedDate} (${tzOffset})`
						}],
					};
				} catch (error) {
					return {
						content: [{ 
							type: "text", 
							text: `Error: ${error instanceof Error ? error.message : String(error)}`
						}],
					};
				}
			}
		);

		// Convert time between timezones
		this.server.tool(
			"convert_time",
			{
				source_timezone: z.string(),
				time: z.string(), // Format: HH:MM
				target_timezone: z.string()
			},
			async ({ source_timezone, time, target_timezone }) => {
				try {
					// Parse the time string (HH:MM)
					const [hours, minutes] = time.split(':').map(Number);
					if (isNaN(hours) || isNaN(minutes)) {
						throw new Error("Invalid time format. Please use HH:MM format.");
					}
					
					// Get today's date
					const today = new Date();
					
					// Set the hours and minutes from the input
					today.setHours(hours, minutes, 0, 0);
					
					// Create date formatters for both timezones
					const sourceFormatter = new Intl.DateTimeFormat('en-US', {
						timeZone: source_timezone,
						hour: 'numeric',
						minute: 'numeric',
						hour12: false,
					});
					
					const targetFormatter = new Intl.DateTimeFormat('en-US', {
						timeZone: target_timezone,
						hour: 'numeric',
						minute: 'numeric',
						hour12: false,
					});
					
					// Convert the time
					const convertedTime = targetFormatter.format(today);
					
					// Get the timezone offset information
					const sourceTzInfo = sourceFormatter.resolvedOptions().timeZone;
					const targetTzInfo = targetFormatter.resolvedOptions().timeZone;
					
					return {
						content: [{ 
							type: "text", 
							text: `${time} in ${sourceTzInfo} is ${convertedTime} in ${targetTzInfo}`
						}],
					};
				} catch (error) {
					return {
						content: [{ 
							type: "text", 
							text: `Error: ${error instanceof Error ? error.message : String(error)}`
						}],
					};
				}
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			// @ts-ignore
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			// @ts-ignore
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		// Direct endpoint for getting current time with URL parameters
		if (url.pathname === "/time") {
			try {
				const timezone = url.searchParams.get("timezone") || "UTC";
				
				// Format options for the date
				const options: Intl.DateTimeFormatOptions = {
					timeZone: timezone,
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					second: 'numeric',
					hour12: false, // 24-hour format
				};
				
				// Get current date and format it according to the timezone
				const currentDate = new Date();
				const formatter = new Intl.DateTimeFormat('en-US', options);
				const formattedDate = formatter.format(currentDate);
				
				// Get the timezone offset
				const tzOffset = formatter.resolvedOptions().timeZone;
				
				return new Response(JSON.stringify({
					currentTime: `${formattedDate} (${tzOffset})`
				}), {
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*"
					}
				});
			} catch (error) {
				return new Response(JSON.stringify({
					error: error instanceof Error ? error.message : String(error)
				}), {
					status: 400,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*"
					}
				});
			}
		}

		// Direct endpoint for converting time with URL parameters
		if (url.pathname === "/convert") {
			try {
				const sourceTimezone = url.searchParams.get("source_timezone");
				const time = url.searchParams.get("time");
				const targetTimezone = url.searchParams.get("target_timezone");
				
				if (!sourceTimezone || !time || !targetTimezone) {
					throw new Error("Missing required parameters: source_timezone, time, and target_timezone");
				}
				
				// Parse the time string (HH:MM)
				const [hours, minutes] = time.split(':').map(Number);
				if (isNaN(hours) || isNaN(minutes)) {
					throw new Error("Invalid time format. Please use HH:MM format.");
				}
				
				// Get today's date
				const today = new Date();
				
				// Set the hours and minutes from the input
				today.setHours(hours, minutes, 0, 0);
				
				// Create date formatters for both timezones
				const sourceFormatter = new Intl.DateTimeFormat('en-US', {
					timeZone: sourceTimezone,
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				});
				
				const targetFormatter = new Intl.DateTimeFormat('en-US', {
					timeZone: targetTimezone,
					hour: 'numeric',
					minute: 'numeric',
					hour12: false,
				});
				
				// Convert the time
				const convertedTime = targetFormatter.format(today);
				
				// Get the timezone offset information
				const sourceTzInfo = sourceFormatter.resolvedOptions().timeZone;
				const targetTzInfo = targetFormatter.resolvedOptions().timeZone;
				
				return new Response(JSON.stringify({
					result: `${time} in ${sourceTzInfo} is ${convertedTime} in ${targetTzInfo}`
				}), {
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*"
					}
				});
			} catch (error) {
				return new Response(JSON.stringify({
					error: error instanceof Error ? error.message : String(error)
				}), {
					status: 400,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*"
					}
				});
			}
		}

		return new Response("Not found", { status: 404 });
	},
};
