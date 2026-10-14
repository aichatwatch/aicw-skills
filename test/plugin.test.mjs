import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';

const json = async file => JSON.parse(await readFile(file, 'utf8'));

test('Claude Code and Agent Plugins manifests describe the same plugin', async () => {
  const pkg = await json('package.json');
  const claude = await json('.claude-plugin/plugin.json');
  const portable = await json('plugin.json');
  assert.equal(claude.name, 'aicw-skills');
  assert.equal(portable.name, claude.name);
  assert.equal(claude.version, pkg.version);
  assert.equal(portable.version, pkg.version);
  assert.equal(portable.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(portable.description, claude.description);

  const claudeMarket = await json('.claude-plugin/marketplace.json');
  assert.deepEqual(claudeMarket.plugins.map(p => [p.name, p.source]), [['aicw-skills', './']]);
  const agentsMarket = await json('.agents/plugins/marketplace.json');
  assert.deepEqual(agentsMarket.plugins.map(p => [p.name, p.source]), [['aicw-skills', { source: 'local', path: './' }]]);
  assert.equal(agentsMarket.name, claudeMarket.name);
});

test('both plugin formats start the same aicw-ai-mentions MCP server', async () => {
  const claude = (await json('.mcp.json')).mcpServers;
  const portable = await json('mcp.json');
  assert.equal(portable.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
  assert.deepEqual(Object.keys(claude), ['aicw-ai-mentions']);
  const { type, ...server } = portable.mcpServers['aicw-ai-mentions'];
  assert.equal(type, 'stdio');
  assert.deepEqual(server, claude['aicw-ai-mentions']);
  assert.deepEqual(server, { command: 'npx', args: ['-y', 'aicw-ai-mentions@latest', 'mcp'] });
});

test('the plugin skills folder holds every installable skill', async () => {
  const skills = (await readdir('skills')).filter(x => x.startsWith('aicw-'));
  assert.ok(skills.includes('aicw-mentions'));
  for (const name of skills) assert.ok((await stat(`skills/${name}/SKILL.md`)).size > 0);
});
