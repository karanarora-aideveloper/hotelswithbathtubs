// A small, read-only stand-in for the Mongoose models, backed by the JSON data snapshot.
// The cloud build (Cloudflare Pages) has no database access, so when DATA_SNAPSHOT=1 the
// Hotel and Blog models are replaced by this. It supports only the query shapes the public
// pages use: find / findOne (+ sort, select, limit, lean), countDocuments, distinct and a
// basic aggregate ($match, $group with $sum/$first/$push/$avg, $sort, $limit, $count).
import fs from 'node:fs';
import path from 'node:path';
import { isDuplicateDropSlug } from '@/data/duplicateHotels';
import { sanitizePlaceholderText } from '@/lib/location';
import { sanitizeHotelData } from '@/lib/evidence';
import { dropClaimSentences, dropClaimSentencesFromHtml } from '@/lib/claims';

type Doc = Record<string, any>;
type Filter = Record<string, any>;

const DATE_FIELDS = new Set(['createdAt', 'updatedAt', 'crossVerifiedAt', 'publishedAt']);

const cache = new Map<string, Doc[]>();
function load(file: string): Doc[] {
  if (!cache.has(file)) {
    let raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.cache', file), 'utf8')) as Doc[];
    if (file === 'all-hotels.json') {
      raw = raw.filter((d) => !isDuplicateDropSlug(d.slug));
      for (const d of raw) sanitizeHotelData(d);
    }
    if (file === 'all-blogs.json') {
      for (const d of raw) {
        if (d.content && typeof d.content === 'string') d.content = dropClaimSentencesFromHtml(sanitizePlaceholderText(d.content));
        if (d.excerpt && typeof d.excerpt === 'string') d.excerpt = dropClaimSentences(sanitizePlaceholderText(d.excerpt));
        if (d.title && typeof d.title === 'string') d.title = sanitizePlaceholderText(d.title);
      }
    }
    for (const d of raw) for (const k of DATE_FIELDS) if (typeof d[k] === 'string') d[k] = new Date(d[k]);
    cache.set(file, raw);
  }
  return cache.get(file)!;
}

const get = (doc: Doc, key: string) => key.split('.').reduce((v: any, k) => (v == null ? undefined : v[k]), doc);
const cmp = (a: any, b: any) => (a instanceof Date ? a.getTime() : a) - (b instanceof Date ? b.getTime() : b);

function matchValue(value: any, cond: any): boolean {
  if (cond instanceof RegExp) return Array.isArray(value) ? value.some((v) => cond.test(String(v))) : value != null && cond.test(String(value));
  if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof Date) && Object.keys(cond).some((k) => k.startsWith('$'))) {
    return Object.entries(cond).every(([op, arg]) => {
      switch (op) {
        case '$ne': return arg instanceof RegExp ? !matchValue(value, arg) : Array.isArray(value) ? !value.includes(arg) : value !== arg;
        case '$in': return (arg as any[]).some((a) => matchValue(value, a));
        case '$nin': return !(arg as any[]).some((a) => matchValue(value, a));
        case '$not': return !matchValue(value, arg);
        case '$exists': return (value !== undefined) === !!arg;
        case '$gte': return value != null && cmp(value, arg) >= 0;
        case '$gt': return value != null && cmp(value, arg) > 0;
        case '$lte': return value != null && cmp(value, arg) <= 0;
        case '$lt': return value != null && cmp(value, arg) < 0;
        case '$regex': return matchValue(value, arg instanceof RegExp ? arg : new RegExp(String(arg), (cond as any).$options || ''));
        case '$options': return true;
        case '$size': return Array.isArray(value) && value.length === arg;
        default: throw new Error(`snapshotModel: unsupported operator ${op}`);
      }
    });
  }
  if (Array.isArray(value) && !Array.isArray(cond)) return value.includes(cond);
  return value === cond;
}

export function matches(doc: Doc, filter: Filter = {}): boolean {
  return Object.entries(filter).every(([key, cond]) => {
    if (key === '$or') return (cond as Filter[]).some((f) => matches(doc, f));
    if (key === '$and') return (cond as Filter[]).every((f) => matches(doc, f));
    if (key === '$nor') return !(cond as Filter[]).some((f) => matches(doc, f));
    return matchValue(get(doc, key), cond);
  });
}

function sortDocs(docs: Doc[], spec: Record<string, 1 | -1> | string) {
  const entries = typeof spec === 'string'
    ? spec.split(/\s+/).filter(Boolean).map((k) => (k.startsWith('-') ? [k.slice(1), -1] : [k, 1]) as [string, number])
    : Object.entries(spec);
  return [...docs].sort((a, b) => {
    for (const [k, dir] of entries) {
      const x = get(a, k), y = get(b, k);
      if (x === y) continue;
      if (x == null) return 1;
      if (y == null) return -1;
      const r = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y) : cmp(x, y);
      if (r !== 0) return r * (dir as number);
    }
    return 0;
  });
}

function project(doc: Doc, fields?: string | Record<string, number>) {
  if (!fields) return doc;
  const spec = typeof fields === 'string'
    ? Object.fromEntries(fields.split(/\s+/).filter(Boolean).map((f) => (f.startsWith('-') ? [f.slice(1), 0] : [f, 1])))
    : fields;
  const include = Object.entries(spec).filter(([, v]) => v).map(([k]) => k);
  const exclude = new Set(Object.entries(spec).filter(([, v]) => !v).map(([k]) => k));
  if (include.length) {
    const out: Doc = {};
    if (!exclude.has('_id')) out._id = doc._id;
    for (const k of include) if (doc[k] !== undefined) out[k] = doc[k];
    return out;
  }
  const out = { ...doc };
  for (const k of exclude) delete out[k];
  return out;
}

class Query<T> implements PromiseLike<T> {
  private _sort?: any; private _select?: any; private _limit?: number; private _skip = 0;
  private docs: () => Doc[]; private single: boolean;
  constructor(docs: () => Doc[], single: boolean) { this.docs = docs; this.single = single; }
  sort(s: any) { this._sort = s; return this; }
  select(s: any) { this._select = s; return this; }
  limit(n: number) { this._limit = n; return this; }
  skip(n: number) { this._skip = n; return this; }
  lean() { return this; }
  exec(): Promise<T> { return Promise.resolve(this.run()); }
  then<A = T, B = never>(ok?: ((v: T) => A | PromiseLike<A>) | null, err?: ((e: any) => B | PromiseLike<B>) | null) {
    return this.exec().then(ok, err);
  }
  private run(): T {
    let docs = this.docs();
    if (this._sort) docs = sortDocs(docs, this._sort);
    docs = docs.slice(this._skip, this._limit != null ? this._skip + this._limit : undefined);
    const out = docs.map((d) => project(structuredClone(d), this._select));
    return (this.single ? out[0] ?? null : out) as T;
  }
}

function evalExpr(doc: Doc, expr: any): any {
  if (typeof expr === 'string' && expr.startsWith('$')) return get(doc, expr.slice(1));
  if (Array.isArray(expr)) return expr.map((e) => evalExpr(doc, e));
  if (expr && typeof expr === 'object' && !(expr instanceof Date) && !(expr instanceof RegExp)) {
    const keys = Object.keys(expr);
    if (keys.length === 1 && keys[0].startsWith('$')) {
      const op = keys[0];
      const args = evalExpr(doc, expr[op]);
      switch (op) {
        case '$cond': {
          const [c, a, b] = Array.isArray(expr[op]) ? expr[op] : [expr[op].if, expr[op].then, expr[op].else];
          return evalExpr(doc, c) ? evalExpr(doc, a) : evalExpr(doc, b);
        }
        case '$and': return (args as any[]).every(Boolean);
        case '$or': return (args as any[]).some(Boolean);
        case '$not': return !(Array.isArray(args) ? args[0] : args);
        case '$eq': return args[0] === args[1];
        case '$ne': return (args[0] ?? null) !== (args[1] ?? null);
        case '$gt': return cmp(args[0], args[1]) > 0;
        case '$gte': return cmp(args[0], args[1]) >= 0;
        case '$lt': return cmp(args[0], args[1]) < 0;
        case '$lte': return cmp(args[0], args[1]) <= 0;
        case '$ifNull': return args[0] ?? args[1];
        case '$size': return Array.isArray(args) ? (Array.isArray(args[0]) && expr[op].length === undefined ? args[0].length : args.length) : 0;
        default: throw new Error(`snapshotModel: unsupported expression ${op}`);
      }
    }
    return Object.fromEntries(Object.entries(expr).map(([k, v]) => [k, evalExpr(doc, v)]));
  }
  return expr;
}

function group(docs: Doc[], spec: Doc) {
  const { _id, ...acc } = spec;
  const groups = new Map<string, { id: any; items: Doc[] }>();
  for (const d of docs) {
    const id = evalExpr(d, _id);
    const key = JSON.stringify(id);
    if (!groups.has(key)) groups.set(key, { id, items: [] });
    groups.get(key)!.items.push(d);
  }
  return [...groups.values()].map(({ id, items }) => {
    const out: Doc = { _id: id };
    for (const [field, op] of Object.entries(acc)) {
      const [name, arg] = Object.entries(op as Doc)[0];
      const vals = items.map((d) => evalExpr(d, arg));
      switch (name) {
        case '$sum': out[field] = vals.reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0); break;
        case '$avg': { const nums = vals.filter((v) => typeof v === 'number'); out[field] = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : null; break; }
        case '$first': out[field] = vals[0]; break;
        case '$last': out[field] = vals[vals.length - 1]; break;
        case '$push': out[field] = vals; break;
        case '$count': out[field] = items.length; break;
        case '$addToSet': out[field] = [...new Set(vals.map((v) => JSON.stringify(v)))].map((v) => JSON.parse(v)); break;
        case '$max': out[field] = vals.reduce((m, v) => (m == null || cmp(v, m) > 0 ? v : m), null); break;
        case '$min': out[field] = vals.reduce((m, v) => (m == null || cmp(v, m) < 0 ? v : m), null); break;
        default: throw new Error(`snapshotModel: unsupported accumulator ${name}`);
      }
    }
    return out;
  });
}

export function createSnapshotModel(file: string) {
  const all = () => load(file);
  return {
    find: (filter: Filter = {}, projection?: any) => {
      const q = new Query<Doc[]>(() => all().filter((d) => matches(d, filter)), false);
      return projection ? q.select(projection) : q;
    },
    findOne: (filter: Filter = {}, projection?: any) => {
      const q = new Query<Doc | null>(() => all().filter((d) => matches(d, filter)), true);
      return projection ? q.select(projection) : q;
    },
    countDocuments: (filter: Filter = {}) => Promise.resolve(all().filter((d) => matches(d, filter)).length),
    distinct: (field: string, filter: Filter = {}) =>
      Promise.resolve([...new Set(all().filter((d) => matches(d, filter)).flatMap((d) => { const v = get(d, field); return Array.isArray(v) ? v : v == null ? [] : [v]; }))]),
    aggregate: (pipeline: Doc[]) => {
      let docs: Doc[] = all();
      for (const stage of pipeline) {
        const [op, arg] = Object.entries(stage)[0];
        if (op === '$match') docs = docs.filter((d) => matches(d, arg));
        else if (op === '$group') docs = group(docs, arg);
        else if (op === '$sort') docs = sortDocs(docs, arg);
        else if (op === '$limit') docs = docs.slice(0, arg);
        else if (op === '$skip') docs = docs.slice(arg);
        else if (op === '$count') docs = [{ [arg]: docs.length }];
        else if (op === '$project') docs = docs.map((d) => Object.fromEntries(Object.entries(arg).map(([k, v]) => [k, v === 1 || v === true ? get(d, k) : evalExpr(d, v)])).valueOf() as Doc).map((d, i) => (arg._id === 0 ? d : { _id: docs[i]._id, ...d }));
        else if (op === '$addFields') docs = docs.map((d) => ({ ...d, ...evalExpr(d, arg) }));
        else throw new Error(`snapshotModel: unsupported stage ${op}`);
      }
      return Promise.resolve(docs);
    },
  };
}

export const isSnapshotMode = () => process.env.DATA_SNAPSHOT === '1';
export const useSnapshot = isSnapshotMode;
