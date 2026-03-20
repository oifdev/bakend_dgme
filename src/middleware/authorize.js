/**
 * Authorization middleware factory — checks permission codes with scope awareness.
 *
 * Usage:
 *   authorize('users.create')             // requires global or any scope
 *   authorize('users.read', 'scoped')     // enforces scope (unit/subdirection)
 *
 * Scope logic:
 *   - 'global' scope_type → always allowed
 *   - 'subdirection' scope_type → user can only act within their subdirection
 *   - 'unit' scope_type → user can only act within their unit
 */
const authorize = (permissionCode, scopeMode = 'any') => {
    return (req, res, next) => {
        const { permissions, profile } = req.user;

        if (!permissions || permissions.length === 0) {
            return res.status(403).json({ error: 'No tiene permisos asignados' });
        }

        // Find matching permissions
        const matchingPerms = permissions.filter((p) => p.code === permissionCode);

        if (matchingPerms.length === 0) {
            return res.status(403).json({
                error: `Permiso requerido: ${permissionCode}`,
            });
        }

        // If any matching permission has global scope, allow immediately
        const hasGlobal = matchingPerms.some((p) => p.scope_type === 'global');
        if (hasGlobal) {
            req.permissionScope = { type: 'global' };
            return next();
        }

        // For scoped mode, attach the scope info so downstream can filter
        if (scopeMode === 'scoped' && profile) {
            const scopes = matchingPerms.map((p) => p.scope_type);

            req.permissionScope = {
                type: scopes.includes('subdirection') ? 'subdirection' : 'unit',
                subdirection_id: profile.subdirection_id,
                unit_id: profile.unit_id,
            };
            return next();
        }

        // Default: has the permission code, allow
        req.permissionScope = { type: 'limited' };
        next();
    };
};

module.exports = authorize;
