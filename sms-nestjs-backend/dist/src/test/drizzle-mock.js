"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDrizzleMock = createDrizzleMock;
const asRows = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (value === undefined) {
        return [];
    }
    return [value];
};
const createThenable = (value) => ({
    then: (resolve, reject = () => { }) => Promise.resolve(value).then(resolve, reject),
});
function createDrizzleMock(overrides = {}) {
    const queue = {
        select: [],
        insert: [],
        update: [],
        delete: [],
    };
    const pop = (kind) => {
        const value = queue[kind].length ? queue[kind].shift() : undefined;
        return asRows(value);
    };
    const createSelectChain = () => {
        const chain = {
            where: jest.fn(() => chain),
            orderBy: jest.fn(() => chain),
            limit: jest.fn(() => chain),
            then: async (resolve, reject = () => { }) => Promise.resolve(pop('select')).then(resolve, reject),
        };
        return chain;
    };
    const buildSelect = () => {
        const fromNode = createSelectChain();
        const selectNode = createSelectChain();
        return {
            ...selectNode,
            from: jest.fn(() => fromNode),
        };
    };
    const buildInsert = () => ({
        values: jest.fn(() => {
            const rows = pop('insert');
            return {
                returning: jest.fn(async () => rows),
            };
        }),
    });
    const buildUpdate = () => ({
        set: jest.fn(() => {
            const rows = pop('update');
            const chain = {
                where: jest.fn(() => {
                    const thenable = createThenable(rows);
                    return {
                        ...thenable,
                        returning: jest.fn(async () => rows),
                    };
                }),
            };
            return chain;
        }),
    });
    const buildDelete = () => {
        const rows = pop('delete');
        const chain = {
            where: jest.fn(() => {
                const thenable = createThenable(rows);
                return {
                    ...thenable,
                    returning: jest.fn(async () => rows),
                };
            }),
        };
        return chain;
    };
    const db = {
        query: {
            ...overrides.query,
        },
        select: jest.fn(buildSelect),
        insert: jest.fn(buildInsert),
        update: jest.fn(buildUpdate),
        delete: jest.fn(buildDelete),
        __queue: {
            push: (kind, value) => queue[kind].push(value),
            pushMany: (kind, values) => queue[kind].push(...values),
            drain: (kind) => queue[kind].splice(0),
        },
    };
    return db;
}
//# sourceMappingURL=drizzle-mock.js.map