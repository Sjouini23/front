export const openWhatsAppInvoice = (service, staffMembers = {}) => {
  const phone = service.phone || service.phoneNumber || service.client_phone;
  if (!phone) return;

  // Clean and format phone number for Tunisia
  const cleanPhone = phone.toString().replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  const fullPhone = cleanPhone.startsWith('+')
    ? cleanPhone.replace('+', '')
    : cleanPhone.startsWith('216')
      ? cleanPhone
      : cleanPhone.startsWith('0')
        ? `216${cleanPhone.slice(1)}`
        : `216${cleanPhone}`;

  // Staff names
  const staffNames = Array.isArray(service.staff)
    ? service.staff.map(k => staffMembers[k]?.name || k).join(', ')
    : staffMembers[service.staff]?.name || service.staff || 'N/A';

  // Service name
  const serviceNames = {
    'lavage-ville': 'Lavage Ville',
    'interieur': 'Intérieur',
    'exterieur': 'Extérieur',
    'complet-premium': 'Complet Premium',
    'complet': 'Complet',
    'rapide': 'Lavage Rapide'
  };
  const serviceName = serviceNames[service.serviceType] || service.serviceType || 'Service';

  // Format date
  const date = service.date
    ? new Date(service.date).toLocaleDateString('fr-FR')
    : new Date().toLocaleDateString('fr-FR');

  // Build message
  const message =
`Bonjour 👋

Merci pour votre visite chez *Jouini Services - Lavage* 🚗✨

🧾 *Reçu de service:*
- Véhicule: ${service.licensePlate || service.immatriculation || 'N/A'}
- Service: ${serviceName}
- Employé: ${staffNames}
- Prix: ${service.totalPrice || service.price || 0} DT
- Date: ${date}

Merci de votre confiance! 🙏
*Jouini Services - Lavage*`;

  const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
