import { ApiError, queryCollection, request, type Paginated, type QueryParams } from "./api";

export interface ResourceService<T extends { id: string }> {
  path: string;
  list(params?: QueryParams): Promise<Paginated<T>>;
  all(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(payload: Partial<T>): Promise<T>;
  update(id: string, payload: Partial<T>): Promise<T>;
  remove(id: string): Promise<{ id: string }>;
}

/**
 * Factory for REST-shaped resources. Each method maps 1:1 to an endpoint
 * (GET /path, GET /path/:id, POST /path, PATCH /path/:id, DELETE /path/:id).
 */
export function createResourceService<T extends { id: string } & Record<string, unknown>>(
  path: string,
  source: () => T[],
): ResourceService<T> {
  return {
    path,
    list: (params) => request(`${path}`, queryCollection(source(), params)),
    all: () => request(`${path}?all=true`, source()),
    get: async (id) => {
      const found = source().find((row) => row.id === id);
      if (!found) throw new ApiError(404, `${path}/${id} not found`);
      return request(`${path}/${id}`, found);
    },
    create: (payload) =>
      request(`${path}`, { id: `NEW-${Date.now()}`, ...payload } as T, 420),
    update: async (id, payload) => {
      const found = source().find((row) => row.id === id);
      if (!found) throw new ApiError(404, `${path}/${id} not found`);
      return request(`${path}/${id}`, { ...found, ...payload }, 420);
    },
    remove: (id) => request(`${path}/${id}`, { id }, 380),
  };
}