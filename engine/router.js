/**
 * SplitGasto 2026 - Master Navigation Router
 * Versión: 4.0 PLATINUM - Rutas Relativas + Anti-Loop + Resiliencia Total
 * Fix: Relative paths, correct auth/register/membership routes
 */
const SGRouter = {
    // ─── Mapa de Nodos con rutas RELATIVAS ──────────────────────────────
    routes: {
        // Core Auth
        'landing':       'index.html',
        'auth':          'auth.html',
        'auth-login':    'auth.html',
        'register':      'register.html',
        'auth-register': 'register.html',
        // Main App
        'dashboard':     'dashboard.html',
        'groups':        'groups.html',
        'activity':      'activity.html',
        'split':         'split.html',
        'success':       'success.html',
        'profile':       'profile.html',
        'membership':    'membership.html',
        'security':      'security.html',
        'notifications': 'notifications.html',
        'receipt':       'receipt-view.html',
        'analytics':     'analytics.html',
        'manual':        'manual.html',
        'scanner':       'scanner.html',
        'vault':         'vault.html',
        'settings':      'settings.html',
        // Legal & Investors
        'legal':         'legal.html',
        'investors':     'investors.html',
        // Games 3D
        'games':         'games.html',
        'game-roulette': 'game-roulette.html',
        'game-cards':    'game-cards.html',
        'game-coin':     'game-coin.html',
        'game-darts':    'game-darts.html',
        // Expense & Group Management
        'add-expense':   'add-expense.html',
        'create-group':  'create-group.html',
        'liquidation':   'liquidation.html',
        // Rankings & Settings
        'rankings':      'rankings.html',
        // Onboarding & Support
        'onboarding':    'onboarding.html',
        'support':       'support.html',
        // Social
        'friends':       'friends.html',
        'invite':        'invite.html',
        // Error / Resilience
        'error':         'engine/resilience.html'
    },

    /**
     * Navega a una página por su ID de ruta
     * Usa rutas relativas compatibles con cualquier despliegue
     */
    navigate(routeId, origin = null) {
        const target = this.routes[routeId] || this.routes['error'];

        // Anti-loop: compara el nombre del archivo actual con el target
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        if (target === currentFile || target === currentFile.split('?')[0]) {
            // Misma página
            if (window.location.search) {
                window.location.href = target;
            } else {
                window.location.reload();
            }
            return;
        }

        // Construir URL final: añadir ?from= solo si hay origen
        const finalTarget = origin ? `${target}?from=${encodeURIComponent(origin)}` : target;

        // Transición Visual Alpha (blur + fade)
        document.body.style.transition = 'filter 0.2s ease, opacity 0.2s ease';
        document.body.style.filter = 'blur(16px)';
        document.body.style.opacity = '0';

        setTimeout(() => {
            window.location.href = finalTarget;
        }, 180);
    },

    /**
     * Retorno Táctico v4.0
     * Prioridad: ?from= param → historial del navegador → dashboard
     */
    back() {
        const urlParams = new URLSearchParams(window.location.search);
        const from = urlParams.get('from');

        document.body.style.transition = 'filter 0.15s ease, opacity 0.15s ease';
        document.body.style.opacity = '0';
        document.body.style.filter = 'blur(10px)';

        setTimeout(() => {
            if (from && this.routes[from]) {
                window.location.href = this.routes[from];
            } else if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = this.routes['dashboard'];
            }
        }, 150);
    },

    /**
     * Navega a premium si la funcionalidad está bloqueada
     */
    requirePremium(feature = '') {
        this.showToast(feature ? `${feature} es Premium 👑` : '¡Función Premium! Desbloquea todo por 2,99€/mes', 'premium');
        setTimeout(() => {
            this.navigate('membership', 'dashboard');
        }, 1200);
    },

    /**
     * Toast de Notificación (v4.0 Gold)
     */
    showToast(message, type = 'success') {
        const colors = {
            'success': '#13ecd6',
            'error':   '#ef4444',
            'info':    '#a855f7',
            'warning': '#FF9D42',
            'premium': '#D4AF37'
        };
        const color = colors[type] || colors.success;

        const old = document.querySelector('.sg-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.className = 'sg-toast';
        toast.style.cssText = `
            position:fixed; bottom:100px; left:50%; transform:translate(-50%,20px);
            z-index:9999; padding:14px 28px; border-radius:999px;
            background:rgba(10,10,10,0.97); border:1px solid rgba(255,255,255,0.1);
            box-shadow:0 20px 50px rgba(0,0,0,0.6); backdrop-filter:blur(24px);
            transition:opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
            opacity:0; white-space:nowrap; pointer-events:none; max-width:90vw;
        `;
        toast.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px">
                <span style="width:8px;height:8px;border-radius:50%;background:${color};
                    box-shadow:0 0 8px ${color};flex-shrink:0"></span>
                <span style="font-size:11px;font-weight:800;text-transform:uppercase;
                    letter-spacing:0.2em;color:#fff">${message}</span>
            </div>`;

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translate(-50%, 0)';
            });
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 10px)';
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }
};

// ─── Restaurar página al entrar / volver ───────────────────────────────────
window.addEventListener('pageshow', () => {
    document.body.style.opacity   = '1';
    document.body.style.filter    = 'none';
    document.body.style.transition = '';
});

// ─── Congelar objeto ───────────────────────────────────────────────────────
Object.freeze(SGRouter);
