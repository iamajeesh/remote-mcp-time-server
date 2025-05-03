# MCP Time Server on Cloudflare (Without Auth)

This example deploys a remote MCP time server that doesn't require authentication on Cloudflare Workers. It provides tools for getting the current time in different timezones and converting time between timezones.

## Live Demo

You can try out a deployed version of this MCP Time Server at:
```
https://mcp-time-server.ajz.workers.dev/sse
```

## Get started: 

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/iamajeesh/remote-mcp-time-server)

This will deploy your MCP time server to a URL like: `mcp-time-server.<your-account>.workers.dev/sse`

Alternatively, you can use the command line below to get the remote MCP Server created on your local machine:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

## Available Tools

The MCP Time Server provides the following tools:

### 1. `get_current_time`
Get the current time for a specific timezone.

Parameters:
- `timezone` (optional): IANA timezone name (e.g., "America/New_York", "Europe/London"). Defaults to "UTC" if not provided.

Returns:
- The current date and time in the specified timezone in 24-hour format, along with the timezone information.

Example:
```
get_current_time(timezone: "America/New_York")
```

### 2. `convert_time`
Convert time between different timezones.

Parameters:
- `source_timezone`: IANA timezone name for the source time (e.g., "America/New_York")
- `time`: Time in HH:MM format (24-hour)
- `target_timezone`: IANA timezone name for the target time (e.g., "Europe/London")

Returns:
- The converted time from the source timezone to the target timezone.

Example:
```
convert_time(source_timezone: "America/New_York", time: "14:30", target_timezone: "Europe/London")
```

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`mcp-time-server.<your-account>.workers.dev/sse`)
3. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "time": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"  // or mcp-time-server.your-account.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the time tools become available.
