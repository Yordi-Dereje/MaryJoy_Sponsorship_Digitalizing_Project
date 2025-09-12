const { Sequelize } = require('sequelize');

class CompositeKeyHandler {
  // Build where clause for composite key queries
  static buildSponsorWhere(clusterId, specificId) {
    return {
      sponsor_cluster_id: clusterId,
      sponsor_specific_id: specificId
    };
  }

  // Build include conditions for composite key relationships
  static buildSponsorInclude() {
    return {
      model: Sponsorship,
      as: 'sponsorships',
      where: {
        sponsor_cluster_id: Sequelize.col('Sponsor.cluster_id')
      },
      required: false
    };
  }

  // Validate composite key
  static isValidSponsorId(clusterId, specificId) {
    return clusterId && specificId && 
           typeof clusterId === 'string' && 
           typeof specificId === 'string' &&
           clusterId.trim() !== '' && 
           specificId.trim() !== '';
  }

  // Format sponsor ID for display
  static formatSponsorId(clusterId, specificId) {
    return `${clusterId}-${specificId}`;
  }

  // Parse sponsor ID from formatted string
  static parseSponsorId(formattedId) {
    const parts = formattedId.split('-');
    if (parts.length === 2) {
      return { clusterId: parts[0], specificId: parts[1] };
    }
    return null;
  }
}

module.exports = CompositeKeyHandler;
