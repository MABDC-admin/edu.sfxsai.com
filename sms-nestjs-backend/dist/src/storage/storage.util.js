"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeStorageToken = normalizeStorageToken;
exports.isAllowedStorageMimeType = isAllowedStorageMimeType;
exports.buildStoredFileName = buildStoredFileName;
exports.toPublicStorageUrl = toPublicStorageUrl;
const path_1 = require("path");
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
]);
function normalizeStorageToken(value) {
    const normalized = (value || 'uncategorized')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return normalized || 'uncategorized';
}
function isAllowedStorageMimeType(mimeType) {
    return ALLOWED_MIME_TYPES.has(mimeType);
}
function buildStoredFileName(originalName, id) {
    const extension = (0, path_1.extname)(originalName).toLowerCase();
    const baseName = originalName
        .slice(0, extension ? -extension.length : undefined)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'upload';
    return `${id}-${baseName}${extension}`;
}
function toPublicStorageUrl(apiOrigin, relativePath) {
    void apiOrigin;
    return `/storage/${relativePath.replace(/^\/+/, '')}`;
}
//# sourceMappingURL=storage.util.js.map