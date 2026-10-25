import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const corePath = path.join(root, 'source', 'core-105.json');
const releaseGroupsPath = path.join(root, 'source', 'release-groups.json');
const assetsRoot = path.join(root, 'assets');

const core = JSON.parse(await fs.readFile(corePath, 'utf8'));
const releaseGroups = JSON.parse(await fs.readFile(releaseGroupsPath, 'utf8')).filters;

const groups = [
  ['resolution', 'Resolution 分辨率'],
  ['source', 'Source 片源'],
  ['container', 'Container 封装格式'],
  ['video-tech', 'Video Tech 视频技术'],
  ['video-codec', 'Video Codec 视频编码'],
  ['audio-tech', 'Audio Tech 音频技术'],
  ['audio-codec', 'Audio Codec 音频编码'],
  ['audio-channels', 'Audio Channels 声道'],
  ['dv-profile', 'Dolby Vision Profile'],
  ['bit-depth', 'Bit Depth 位深'],
  ['audio-bit-depth', 'Audio Bit Depth 音频位深'],
  ['sample-rate', 'Sample Rate 采样率'],
  ['frame-rate', 'Frame Rate 帧率'],
  ['subtitle', 'Subtitle 字幕'],
  ['subtitle-format', 'Subtitle Format 字幕格式'],
  ['subtitle-group', 'Subtitle Group 字幕组'],
  ['language', 'Audio Language 配音'],
  ['edition', 'Edition 版本'],
  ['misc', 'Misc 其他'],
  ['release-group', 'Release Group 制作组'],
].map(([id, name]) => ({ id, name, color: '#00000000', borderColor: '#00000000', isExpanded: true }));

const removeIds = new Set(['m-mkv', 'm-mp4', 'm-hfr', 'm-uncut', 'm-director']);
const filters = core.filters.filter((filter) => !removeIds.has(filter.id)).map((filter) => ({ ...filter }));

const sourceFilter = (id) => {
  const filter = releaseGroups.find((item) => item.id === id);
  if (!filter) throw new Error(`Source filter not found: ${id}`);
  return { ...filter };
};

const add = (filter) => filters.push(filter);
const entry = (id, groupId, name, pattern, extra = {}) => ({
  id,
  groupId,
  name,
  pattern,
  imageURL: null,
  tagColor: '#00000000',
  borderColor: '#00000000',
  textColor: '#00000000',
  tagStyle: 'filled and bordered',
  type: 'filter',
  isEnabled: true,
  ...extra,
});

// 分辨率补充
add(entry('r-1440p', 'resolution', '1440p QHD', String.raw`(?i)\b(1440[pi]?|qhd)\b`));
add(entry('r-2k', 'resolution', '2K', String.raw`(?i)\b2k\b`));
add(entry('r-576p', 'resolution', '576p', String.raw`(?i)\b576[pi]?\b`));
add(entry('r-360p', 'resolution', '360p', String.raw`(?i)\b360[pi]?\b`));

// 片源补充
add(entry('s-hdtvrip', 'source', 'HDTVRip', String.raw`(?i)\bhd[\s._-]*tv[\s._-]*rip\b`));
add(entry('s-tvrip', 'source', 'TVRip', String.raw`(?i)\b(tv[\s._-]*rip|tvrip)\b`));
add(entry('s-uhdtv', 'source', 'UHDTV', String.raw`(?i)\buhdtv\b`));

// 封装格式
for (const [id, name, pattern, label] of [
  ['ct-mkv', 'MKV', String.raw`(?i)\.mkv\b`, 'MKV'],
  ['ct-mp4', 'MP4', String.raw`(?i)\.mp4\b`, 'MP4'],
  ['ct-avi', 'AVI', String.raw`(?i)\.avi\b`, 'AVI'],
  ['ct-mov', 'MOV', String.raw`(?i)\.mov\b`, 'MOV'],
  ['ct-wmv', 'WMV', String.raw`(?i)\.wmv\b`, 'WMV'],
  ['ct-flv', 'FLV', String.raw`(?i)\.flv\b`, 'FLV'],
  ['ct-ts', 'TS', String.raw`(?i)\.ts\b`, 'TS'],
  ['ct-m2ts', 'M2TS', String.raw`(?i)\.m2ts\b`, 'M2TS'],
  ['ct-webm', 'WEBM', String.raw`(?i)\.webm\b`, 'WEBM'],
  ['ct-rmvb', 'RMVB', String.raw`(?i)\.rmvb\b`, 'RMVB'],
  ['ct-mpg', 'MPEG', String.raw`(?i)\.(mpg|mpeg)\b`, 'MPEG'],
  ['ct-vob', 'VOB', String.raw`(?i)\.vob\b`, 'VOB'],
  ['ct-m4v', 'M4V', String.raw`(?i)\.m4v\b`, 'M4V'],
]) add(entry(id, 'container', name, pattern, { generatedLabel: label }));

// 视频编码补充
for (const [id, name, pattern, label] of [
  ['vc-vp9', 'VP9', String.raw`(?i)\bvp9\b`, 'VP9'],
  ['vc-mpeg2', 'MPEG-2', String.raw`(?i)\b(mpeg[\s._-]?2|h[\s._-]?262)\b`, 'MPEG-2'],
  ['vc-vc1', 'VC-1', String.raw`(?i)\b(vc[\s._-]?1|wvc1)\b`, 'VC-1'],
  ['vc-xvid', 'XviD', String.raw`(?i)\bxvid\b`, 'XviD'],
  ['vc-divx', 'DivX', String.raw`(?i)\bdivx\b`, 'DivX'],
]) add(entry(id, 'video-codec', name, pattern, { generatedLabel: label }));

// 音频编码补充
for (const [id, name, pattern, label] of [
  ['ac-ape', 'APE', String.raw`(?i)\bape\b`, 'APE'],
  ['ac-wav', 'WAV', String.raw`(?i)\bwav\b`, 'WAV'],
  ['ac-mp2', 'MP2', String.raw`(?i)\bmp2\b`, 'MP2'],
]) add(entry(id, 'audio-codec', name, pattern, { generatedLabel: label }));

// 声道补充
add(entry('ch-916', 'audio-channels', '9.1.6 Audio', String.raw`(?i)\b9[.\-]1[.\-]6\b`, { generatedLabel: '9.1.6' }));
add(entry('ch-20', 'audio-channels', '2.0 Stereo', String.raw`(?i)\b(2\.0|2-0|stereo|2[\s._-]*ch(?:annel)?s?)\b`, { generatedLabel: '2.0' }));
add(entry('ch-10', 'audio-channels', '1.0 Mono', String.raw`(?i)\b(1\.0|mono|1[\s._-]*ch(?:annel)?)\b`, { generatedLabel: '1.0' }));

// 音频位深（与视频位深分开，避免 24bit 音乐被当成视频位深）
add(entry('abd-32f', 'audio-bit-depth', '32Bit Float', String.raw`(?i)\b(32[\s._-]*bit[\s._-]*float|float32|32[\s._-]*float)\b`, { generatedLabel: '32FLOAT' }));
add(entry('abd-32', 'audio-bit-depth', '32Bit', String.raw`(?i)\b32[\s._-]*(?:bit|b)\b`, { generatedLabel: '32BIT' }));
add(entry('abd-24', 'audio-bit-depth', '24Bit', String.raw`(?i)\b24[\s._-]*(?:bit|b)\b`, { generatedLabel: '24BIT' }));
add(entry('abd-16', 'audio-bit-depth', '16Bit', String.raw`(?i)\b16[\s._-]*(?:bit|b)\b`, { generatedLabel: '16BIT' }));

// 采样率
add(entry('sr-192', 'sample-rate', '192 kHz', String.raw`(?i)\b192(?:[\s._-]*k(?:hz)?|[\s._-]*hz)\b`, { generatedLabel: '192K' }));
add(entry('sr-1764', 'sample-rate', '176.4 kHz', String.raw`(?i)\b176[.,\s]?4(?:[\s._-]*k(?:hz)?|[\s._-]*hz)\b`, { generatedLabel: '176.4K' }));
add(entry('sr-96', 'sample-rate', '96 kHz', String.raw`(?i)\b96(?:[\s._-]*k(?:hz)?|[\s._-]*hz)\b`, { generatedLabel: '96K' }));
add(entry('sr-882', 'sample-rate', '88.2 kHz', String.raw`(?i)\b88[.,\s]?2(?:[\s._-]*k(?:hz)?|[\s._-]*hz)\b`, { generatedLabel: '88.2K' }));
add(entry('sr-48', 'sample-rate', '48 kHz', String.raw`(?i)\b48(?:[\s._-]*k(?:hz)?|[\s._-]*hz)\b`, { generatedLabel: '48K' }));
add(entry('sr-441', 'sample-rate', '44.1 kHz', String.raw`(?i)\b44[.,\s]?1(?:[\s._-]*k(?:hz)?|[\s._-]*hz)\b`, { generatedLabel: '44.1K' }));

// 帧率
for (const [id, name, pattern, label] of [
  ['fr-120', '120 fps', String.raw`(?i)\b120[\s._-]*fps\b`, '120'],
  ['fr-60', '60 fps', String.raw`(?i)\b(59\.94|60)[\s._-]*fps\b`, '60'],
  ['fr-50', '50 fps', String.raw`(?i)\b50[\s._-]*fps\b`, '50'],
  ['fr-30', '30 fps', String.raw`(?i)\b(29\.97|30)[\s._-]*fps\b`, '30'],
  ['fr-25', '25 fps', String.raw`(?i)\b25[\s._-]*fps\b`, '25'],
  ['fr-24', '24 fps', String.raw`(?i)\b(23\.976|23\.98|24)[\s._-]*(fps|p)\b`, '24'],
  ['fr-hfr', 'HFR 高帧率', String.raw`(?i)(\bhfr\b|高帧率)`, 'HFR'],
]) add(entry(id, 'frame-rate', name, pattern, { generatedLabel: label }));

// 字幕格式
for (const [id, name, pattern, label] of [
  ['sf-srt', 'SRT', String.raw`(?i)(\.srt\b|\bsrt字幕\b)`, 'SRT'],
  ['sf-ass', 'ASS', String.raw`(?i)(\.ass\b|\bass字幕\b)`, 'ASS'],
  ['sf-ssa', 'SSA', String.raw`(?i)(\.ssa\b|\bssa字幕\b)`, 'SSA'],
  ['sf-pgs', 'PGS / SUP', String.raw`(?i)(\.(pgs|sup)\b|\bpgs字幕\b)`, 'PGS'],
  ['sf-vtt', 'VTT', String.raw`(?i)(\.vtt\b|\bvtt字幕\b)`, 'VTT'],
  ['sf-sub', 'SUB', String.raw`(?i)(\.sub\b|\bsub字幕\b)`, 'SUB'],
  ['sf-idx', 'IDX', String.raw`(?i)(\.idx\b|\bidx字幕\b)`, 'IDX'],
  ['sf-forced', 'Forced 强制字幕', String.raw`(?i)(\bforced\b|强制字幕)`, 'FORCED'],
  ['sf-sdh', 'SDH 听障字幕', String.raw`(?i)(\bsdh\b|听障字幕)`, 'SDH'],
  ['sf-cc', 'CC 隐藏字幕', String.raw`(?i)(closed[\s._-]*caption|\.cc\b|cc字幕)`, 'CC'],
]) add(entry(id, 'subtitle-format', name, pattern, { generatedLabel: label }));

// 字幕组
for (const [id, name, label, pattern] of [
  ['sg-yyets', 'YYeTs 人人影视', 'YYeTs', String.raw`(?i)(yyets|人人影视|人人字幕)`],
  ['sg-yj', '远鉴字幕组', '远鉴', String.raw`(?i)(远鉴|yjsub)`],
  ['sg-shenying', '深影字幕组', '深影', String.raw`(?i)(深影|shenying|sysub)`],
  ['sg-ydy', '伊甸园字幕组', '伊甸园', String.raw`(?i)(伊甸园|ydy)`],
  ['sg-bingbing', '冰冰字幕组', '冰冰', String.raw`(?i)(冰冰字幕|bingbing)`],
  ['sg-fix', 'FIX字幕侠', 'FIX', String.raw`(?i)(fix字幕|fixsub|fix字幕侠)`],
  ['sg-cq', '擦枪字幕组', '擦枪', String.raw`(?i)(擦枪|cqsub)`],
  ['sg-lafeng', '拉风字幕组', '拉风', String.raw`(?i)(拉风|lafeng)`],
  ['sg-wanwan', '弯弯字幕组', '弯弯', String.raw`(?i)(弯弯|wanwan)`],
  ['sg-yuedu', '粤知缘字幕组', '粤知缘', String.raw`(?i)(粤知缘|yuedu)`],
  ['sg-zxf', '追新番字幕组', '追新番', String.raw`(?i)(追新番|zxf)`],
  ['sg-huanying', '幻樱字幕组', '幻樱', String.raw`(?i)(幻樱|huanying)`],
  ['sg-kamigami', '诸神字幕组', '诸神', String.raw`(?i)(诸神|kamigami|zssub)`],
  ['sg-caso', '华盟字幕社', '华盟', String.raw`(?i)(华盟|caso)`],
  ['sg-lksub', '轻之国度', '轻之国', String.raw`(?i)(轻之国度|lksub)`],
  ['sg-dmg', '动漫国字幕组', '动漫国', String.raw`(?i)(动漫国|dmg)`],
  ['sg-jyfansub', '极影字幕社', '极影', String.raw`(?i)(极影|jyfansub)`],
  ['sg-sumisora', '澄空学园', '澄空', String.raw`(?i)(澄空|sumisora)`],
  ['sg-popgo', '漫游字幕组', '漫游', String.raw`(?i)(漫游|popgo)`],
  ['sg-nekomoe', '喵萌奶茶屋', '喵萌', String.raw`(?i)(喵萌|nekomoe|奶茶屋)`],
  ['sg-xksub', '星空字幕组', '星空', String.raw`(?i)(星空字幕|xksub)`],
  ['sg-airota', '千夏字幕组', '千夏', String.raw`(?i)(千夏|airota)`],
  ['sg-tsdm', '天使动漫字幕组', '天使', String.raw`(?i)(天使动漫|tsdm)`],
]) add(entry(id, 'subtitle-group', name, pattern, { generatedLabel: label }));

const subtitleGroupFromSource = (id, name, label, sourceId) => {
  const source = sourceFilter(sourceId);
  return entry(id, 'subtitle-group', name, source.pattern, { generatedLabel: label, imageURL: source.imageURL });
};

add(subtitleGroupFromSource('sg-sakurato', '桜都字幕组', '桜都', 'rg-sakurato'));
add(subtitleGroupFromSource('sg-lvcha', '绿茶字幕组', '绿茶', 'rg-lvcha'));
add(subtitleGroupFromSource('sg-lolihouse', 'LoliHouse 字幕组', 'LoliHouse', 'rg-loli'));
add(subtitleGroupFromSource('sg-kirara', 'Kirara Fantasia', 'Kirara', 'rg-kirara'));
add(entry('sg-ani', 'subtitle-group', 'ANi 字幕组', String.raw`(?i)(?:^|[^a-z0-9])ani(?![a-z0-9])`, { generatedLabel: 'ANi', imageURL: sourceFilter('rg-ani').imageURL }));
add(entry('sg-raw', 'subtitle-group', '生肉 / 不明字幕', String.raw`(?i)(生肉|(?:^|[^a-z0-9])raw(?![a-z0-9])|不明字幕|未知字幕|unknown[\s._-]*sub)`, { generatedLabel: '生肉' }));

// 配音补充
add(entry('lang-original', 'language', '原声', String.raw`(?i)(原声|原音|original[\s._-]*audio)`, { generatedLabel: '原声' }));
add(entry('lang-multi', 'language', '多音轨', String.raw`(?i)(多音轨|multi[\s._-]*audio|multiple[\s._-]*audio)`, { generatedLabel: '多音轨' }));

// 版本
for (const [id, name, pattern, label] of [
  ['ed-director', "Director's Cut", String.raw`(?i)(导演剪辑|director'?s?[\s._-]*cut)`, 'DC'],
  ['ed-extended', 'Extended 加长版', String.raw`(?i)(加长版|extended(?:[\s._-]*cut)?)`, 'EXTENDED'],
  ['ed-theatrical', 'Theatrical 公映版', String.raw`(?i)\btheatrical(?:[\s._-]*cut)?\b`, 'THEATRICAL'],
  ['ed-unrated', 'Unrated 未删减', String.raw`(?i)(未删减|无删减|完整版|\bunrated\b)`, 'UNRATED'],
  ['ed-remastered', 'Remastered 修复版', String.raw`(?i)(修复版|重制版|\bremaster(?:ed)?\b)`, 'REMASTER'],
  ['ed-criterion', 'Criterion 标准收藏', String.raw`(?i)\bcriterion\b`, 'CRITERION'],
  ['ed-openmatte', 'Open Matte 开放画面', String.raw`(?i)\bopen[\s._-]*matte\b`, 'OPEN MATTE'],
  ['ed-hybrid', 'Hybrid 混合版', String.raw`(?i)\bhybrid\b`, 'HYBRID'],
  ['ed-special', 'Special Edition 特别版', String.raw`(?i)(特别版|特别收藏版|\bspecial[\s._-]*edition\b)`, 'SPECIAL'],
]) add(entry(id, 'edition', name, pattern, { generatedLabel: label }));

// 制作组补充
for (const id of [
  'rg-hdtime', 'rg-hdcity', 'rg-hdctv', 'rg-leaguehd', 'rg-tccf', 'rg-tigole', 'rg-qxr', 'rg-ntg', 'rg-sigma', 'rg-tepes',
  'rg-vcb', 'rg-beatrice', 'rg-sweetsub', 'rg-prejudice', 'rg-moozzi2', 'rg-subsplease',
]) {
  add(sourceFilter(id));
}

const groupOrder = groups.map((group) => group.id);
const preferredOrder = {
  resolution: ['r-8k', 'r-4k', 'r-1440p', 'r-2k', 'r-1080p', 'r-720p', 'r-576p', 'r-480p', 'r-360p'],
  source: ['s-remux', 's-uhdbd', 's-bluray', 's-bdrip', 's-webdl', 's-webrip', 's-hdtvrip', 's-hdtv', 's-tvrip', 's-uhdtv', 's-hdrip', 's-dvdrip', 's-iso', 's-highbit'],
  'video-codec': ['c-hevc', 'c-avc', 'c-av1', 'c-vvc', 'vc-vp9', 'vc-mpeg2', 'vc-vc1', 'vc-xvid', 'vc-divx'],
  'audio-codec': ['ac-aac', 'ac-ac3', 'ac-eac3', 'ac-flac', 'ac-alac', 'ac-opus', 'ac-pcm', 'ac-mp3', 'ac-vorbis', 'ac-wma', 'ac-ape', 'ac-wav', 'ac-mp2'],
  'audio-channels': ['ch-916', 'ch-714', 'ch-514', 'ch-512', 'ch-71', 'ch-51', 'ch-20', 'ch-10'],
  'frame-rate': ['fr-120', 'fr-60', 'fr-50', 'fr-30', 'fr-25', 'fr-24', 'fr-hfr'],
  subtitle: ['sub-fx', 'sub-zh', 'sub-cn', 'sub-tw', 'sub-en', 'sub-in', 'sub-emb', 'sub-ext', 'sub-eng', 'sub-no'],
  'subtitle-format': ['sf-ass', 'sf-ssa', 'sf-srt', 'sf-pgs', 'sf-vtt', 'sf-sub', 'sf-idx', 'sf-cc', 'sf-sdh', 'sf-forced'],
  'subtitle-group': [
    'sg-yyets', 'sg-yj', 'sg-shenying', 'sg-ydy', 'sg-bingbing', 'sg-fix', 'sg-cq', 'sg-lafeng',
    'sg-wanwan', 'sg-yuedu', 'sg-zxf', 'sg-huanying', 'sg-kamigami', 'sg-caso', 'sg-lksub', 'sg-dmg',
    'sg-jyfansub', 'sg-sumisora', 'sg-popgo', 'sg-sakurato', 'sg-nekomoe', 'sg-xksub', 'sg-airota', 'sg-tsdm',
    'sg-lvcha', 'sg-lolihouse', 'sg-kirara', 'sg-ani', 'sg-raw'
  ],
  'audio-bit-depth': ['abd-32f', 'abd-32', 'abd-24', 'abd-16'],
  'sample-rate': ['sr-192', 'sr-1764', 'sr-96', 'sr-882', 'sr-48', 'sr-441'],
  language: ['lang-original', 'lang-cn', 'lang-tw', 'lang-yue', 'lang-jp', 'lang-kr', 'lang-en', 'lang-dual', 'lang-multi'],
  edition: ['ed-director', 'ed-extended', 'ed-theatrical', 'ed-unrated', 'ed-remastered', 'ed-criterion', 'ed-openmatte', 'ed-hybrid', 'ed-special'],
  misc: ['m-3d', 'm-zhencai', 'm-complete', 'm-hot'],
};
const ordered = [];
for (const groupId of groupOrder) {
  const groupFilters = filters.filter((filter) => filter.groupId === groupId);
  const order = preferredOrder[groupId];
  if (!order) {
    ordered.push(...groupFilters);
    continue;
  }

  const position = new Map(order.map((id, index) => [id, index]));
  groupFilters.sort((a, b) => (position.get(a.id) ?? 9999) - (position.get(b.id) ?? 9999));
  ordered.push(...groupFilters);
}

const accentByGroup = {
  resolution: '#4F8EF7', source: '#4FB6C8', container: '#5B8DEF',
  'video-codec': '#8A6FE8', 'audio-codec': '#E08A3C', 'audio-channels': '#3BB2A6',
  'audio-bit-depth': '#C27A3A', 'sample-rate': '#4E9E8A',
  'frame-rate': '#4FB3D9', subtitle: '#4CAF7A', 'subtitle-format': '#5CB85C',
  'subtitle-group': '#D46A8C', edition: '#C9A227', language: '#E6A23C',
  misc: '#7A869A', 'release-group': '#6B7C93',
};

const esc = (value) => value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));

function makeSvg(label, groupId) {
  const accent = accentByGroup[groupId] ?? '#5B8DEF';
  const isCjk = /[\u3400-\u9fff]/.test(label);
  const width = Math.max(72, Math.min(260, Math.round(label.length * (isCjk ? 21 : 11.5) + 38)));
  const fontSize = label.length > 11 ? 16 : 19;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="48" viewBox="0 0 ${width} 48">
  <rect x="1" y="1" width="${width - 2}" height="46" rx="8" fill="#171B20" stroke="#46515C" stroke-width="2"/>
  <rect x="1" y="1" width="6" height="46" rx="3" fill="${accent}"/>
  <text x="${(width + 5) / 2}" y="31" text-anchor="middle" font-family="Segoe UI, Microsoft YaHei, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#F5F8FB">${esc(label)}</text>
</svg>\n`;
}

await fs.mkdir(path.join(assetsRoot, 'original'), { recursive: true });
await fs.mkdir(path.join(assetsRoot, 'generated'), { recursive: true });

const provenance = [];
for (const filter of ordered) {
  const generatedLabel = filter.generatedLabel || filter.name;
  if (!filter.imageURL) {
    const relative = `assets/generated/${filter.id}.svg`;
    await fs.writeFile(path.join(root, relative), makeSvg(generatedLabel, filter.groupId), 'utf8');
    filter.imageURL = relative;
    provenance.push({ id: filter.id, originalUrl: null, localPath: relative, kind: 'generated' });
    continue;
  }

  const originalUrl = filter.imageURL;
  const extension = (() => {
    try { return path.extname(new URL(originalUrl).pathname) || '.svg'; } catch { return '.svg'; }
  })();
  const relative = `assets/original/${filter.id}${extension.toLowerCase()}`;
  const target = path.join(root, relative);
  let downloaded = false;
  try {
    await fs.access(target);
    downloaded = true;
  } catch {
    try {
      const response = await fetch(originalUrl, { headers: { 'User-Agent': 'zPlayer-badge-builder/1.0' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const probe = buffer.subarray(0, 512).toString('utf8').trimStart();
      if (!probe.startsWith('<svg') && !probe.startsWith('<?xml') && !probe.startsWith('<!DOCTYPE svg')) {
        throw new Error('response is not SVG');
      }
      await fs.writeFile(target, buffer);
      downloaded = true;
    } catch (error) {
      console.warn(`download failed: ${filter.id}: ${error.message}`);
    }
  }

  if (downloaded) {
    filter.imageURL = relative;
    provenance.push({ id: filter.id, originalUrl, localPath: relative, kind: 'downloaded' });
  } else {
    const fallbackRelative = `assets/generated/${filter.id}.svg`;
    await fs.writeFile(path.join(root, fallbackRelative), makeSvg(generatedLabel, filter.groupId), 'utf8');
    filter.imageURL = fallbackRelative;
    provenance.push({ id: filter.id, originalUrl, localPath: fallbackRelative, kind: 'generated-fallback' });
  }
  delete filter.generatedLabel;
}

for (const filter of ordered) delete filter.generatedLabel;

const document = { filters: ordered, groups };
await fs.writeFile(path.join(root, 'badges.json'), JSON.stringify(document, null, 2) + '\n', 'utf8');
await fs.writeFile(path.join(root, 'sources.json'), JSON.stringify(provenance, null, 2) + '\n', 'utf8');

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const csv = ['groupId,id,name,pattern,imageURL']
  .concat(ordered.map((f) => [f.groupId, f.id, f.name, f.pattern, f.imageURL].map(csvEscape).join(',')))
  .join('\n') + '\n';
await fs.writeFile(path.join(root, 'badges.csv'), '\ufeff' + csv, 'utf8');

console.log(`built ${ordered.length} badges, ${groups.length} groups`);
for (const group of groups) console.log(`${group.id}: ${ordered.filter((f) => f.groupId === group.id).length}`);
