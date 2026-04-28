// ✅ CORRECTION - Utilisation des méthodes natives JavaScript
exports.formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const annee = d.getFullYear();
    return `${jour}/${mois}/${annee}`;
};

exports.formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const annee = d.getFullYear();
    const heures = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${jour}/${mois}/${annee} ${heures}:${minutes}`;
};

exports.getRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
    if (diffHour > 0) return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
    if (diffMin > 0) return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    return `À l'instant`;
};