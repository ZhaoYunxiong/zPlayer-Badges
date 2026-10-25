import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const document = JSON.parse(await fs.readFile(path.join(root, 'badges.json'), 'utf8'));
const sources = JSON.parse(await fs.readFile(path.join(root, 'sources.json'), 'utf8'));
const errors = [];

if (!Array.isArray(document.filters) || !Array.isArray(document.groups)) {
  errors.push('badges.json 必须包含 filters 和 groups 数组');
}

const groupIds = new Set();
for (const group of document.groups ?? []) {
  if (!group.id) errors.push('存在没有 id 的分组');
  if (groupIds.has(group.id)) errors.push(`重复分组: ${group.id}`);
  groupIds.add(group.id);
}

const filterIds = new Set();
for (const filter of document.filters ?? []) {
  if (!filter.id) errors.push('存在没有 id 的徽章');
  if (filterIds.has(filter.id)) errors.push(`重复徽章: ${filter.id}`);
  filterIds.add(filter.id);
  if (!groupIds.has(filter.groupId)) errors.push(`未知分组: ${filter.id} -> ${filter.groupId}`);
  if (!filter.imageURL) {
    errors.push(`缺少图片: ${filter.id}`);
  } else if (/^[a-z]+:/i.test(filter.imageURL)) {
    errors.push(`图片必须是相对路径: ${filter.id}`);
  } else {
    try {
      await fs.access(path.join(root, filter.imageURL));
    } catch {
      errors.push(`图片不存在: ${filter.id} -> ${filter.imageURL}`);
    }
  }
  try {
    // 徽章库使用 .NET 的 (?i) 前缀；JavaScript 校验时转换成对应 flag。
    const jsPattern = filter.pattern.replace(/^\(\?i\)/, '');
    new RegExp(jsPattern, 'i');
  } catch (error) {
    errors.push(`正则无法编译: ${filter.id}: ${error.message}`);
  }
}

if (sources.length !== document.filters.length) {
  errors.push(`sources.json 条数不匹配: ${sources.length} != ${document.filters.length}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`OK: ${document.filters.length} badges, ${document.groups.length} groups, ${sources.length} sources`);
