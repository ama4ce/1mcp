# 1MCP (Custom Fork)

This repository is a custom fork of 1MCP with project-specific changes.

- Fork: https://github.com/ama4ce/1mcp
- Upstream: https://github.com/1mcp-app/agent

## What Is Changed In This Fork

- Added fine-grained capability filtering with `enabledTools` (whitelist mode) and explicit precedence over blocklists.
- Extended `mcp status` output to show capability-filtering config and enabled-tools summary.
- Updated streamable HTTP/request-handling paths required for the filtering flow.
- Updated related tests and error-handling paths for the new behavior.

## Note

This fork can intentionally diverge from upstream behavior. Check commit history in this repository for exact implementation details.
