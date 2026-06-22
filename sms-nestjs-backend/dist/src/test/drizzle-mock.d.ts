export type DrizzleMockQueueKind = 'select' | 'insert' | 'update' | 'delete';
type QueryTable = {
    [method: string]: jest.Mock;
};
interface QueryShape {
    [table: string]: QueryTable;
}
interface DrizzleDbLike {
    query: QueryShape;
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    __queue: {
        push: (kind: DrizzleMockQueueKind, value: unknown) => void;
        pushMany: (kind: DrizzleMockQueueKind, values: unknown[]) => void;
        drain: (kind: DrizzleMockQueueKind) => unknown[];
    };
}
export declare function createDrizzleMock(overrides?: {
    query?: QueryShape;
}): DrizzleDbLike;
export {};
