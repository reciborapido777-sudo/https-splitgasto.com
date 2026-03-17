/**
 * SplitGasto 2026 - Master Navigation Router
 * Versión: 2.0 Gold - Protocolo de Resiliencia Total + Anti-Loop
 * Rutas completas: 30+ páginas incluyendo juegos 3D, gastos, grupos y más
 */
const SGRouter = {
    // Mapa de Nodos Operativos - v2.0 GOLD CERTIFICADO
    routes: {
        // Core Auth
        'landing': 'index.html',
        'auth': 'auth-login.html',
        'auth-login': 'auth-login.html',
        'register': 'auth-register.html',
        'auth-register': 'auth-register.html',
        // Main App
        'dashboard': 'dashboard.html',
        'groups': 'groups.html',
        'activity': 'activity.html',
        'split': 'split.html',
        'success': 'success.html',
        'profile': 'profile.html',
        'membership': 'membership.html',
        'security': 'security.html',
        'notifications': 'notifications.html',
        'receipt': 'receipt-view.html',
        'analytics': 'analytics.html',
        'manual': 'manual.html',
        'scanner': 'scanner.html',
        'vault': 'vault.html',
        // Legal & Investors
        'legal': 'legal.html',
        'investors': 'investors.html',
        // Games 3D
        'games': 'games.html',
        'game-roulette': 'game-roulette.html',
        'game-cards': 'game-cards.html',
        'game-coin': 'game-coin.html',
        'game-darts': 'game-darts.html',
        'add-expense': 'add-expense.html',
        'create-group': 'create-group.html',
        // Rankings & Settings
        'rankings': 'rankings.html',
        'settings': 'settings.html',
        // Onboarding & Support
        'onboarding': 'onboarding.html',
        'support': 'support.html',
        'liquidation': 'liquidation.html',
        // Error / Resilience
        'error': 'engine/resilience.html'
    },

    /**
     * Ejecuta una transición de alta fidelidad hacia un nuevo nodo
     */
    navigate(routeId, origin = null) {
        const target = this.routes[routeId] || this.routes['error'];
        
        // Protocolo de Seguridad: Si el origen es igual al destino, forzamos recarga limpia
        const currentPath = window.location.pathname.split('/').pop();
        if (target === currentPath && !origin) {
            window.location.reload();
            return;
        }

        // Persistencia de origen para el retorno táctico
        const finalTarget = origin ? `${target}?from=${origin}` : target;
        
        // Transición Visual Alpha
        document.body.style.transition = 'filter 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
        document.body.style.filter = 'blur(20px)';
        document.body.style.opacity = '0';

        setTimeout(() => { 
            window.location.href = finalTarget; 
        }, 200);
    },

    /**
     * Retorno Táctico Inteligente v2.0
     * Prioriza el parámetro 'from' sobre el historial para romper bucles.
     */
    back() {
        const urlParams = new URLSearchParams(window.location.search);
        const from = urlParams.get('from');

        document.body.style.opacity = '0';
        document.body.style.filter = 'blur(10px)';
        
        setTimeout(() => {
            if (from && this.routes[from]) {
                window.location.href = this.routes[from];
            } else {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = this.routes['dashboard'];
                }
            }
        }, 150);
    },

    /**
     * Interfaz de Alertas Sincronizada (v2.0 Gold)
     */
    showToast(message, type = 'success') {
        const colors = { 
            'success': '#13ecd6', 
            'error': '#ef4444',    
            'info': '#a855f7',
            'warning': '#FF9D42',
            'premium': '#D4AF37'
        };

        const oldToast = document.querySelector('.sg-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = `sg-toast fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-[1.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 transform translate-y-20 opacity-0`;
        toast.style.cssText += ';background:rgba(15,15,15,0.95);backdrop-filter:blur(20px);white-space:nowrap;';
        
        toast.innerHTML = `
            <div class="flex items-center gap-4">
                <div style="width:10px;height:10px;border-radius:50%;background:${colors[type] || colors.success};box-shadow:0 0 10px ${colors[type] || colors.success};animation:pulse 1.5s ease infinite"></div>
                <p style="font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.25em;color:white">${message}</p>
            </div>
        `;

        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => toast.remove(), 500);
        }, 3500);
    }
};

// Sincronización de entrada al nodo
window.addEventListener('pageshow', () => { 
    document.body.style.opacity = '1'; 
    document.body.style.filter = 'none';
    document.body.style.transition = '';
});

// Congelar objeto para evitar manipulaciones externas
Object.freeze(SGRouter);
