/**
 * Alert Translation Utility
 *
 * Translates alert titles and messages based on keywords
 */

import { translations, Language } from './translations'

/**
 * Translates alert title or message based on content keywords
 */
export function translateAlertText(text: string, language: Language): string {
  if (!text || language === 'en') {
    return text
  }

  const t = translations[language]
  const lowerText = text.toLowerCase()

  // Map common alert patterns to translations
  const translationsMap: Record<string, string> = {
    // Supervision
    'supervision visit required': t.supervisionVisitRequired,
    'supervision required': t.supervisionVisitRequired,
    'visit required': t.supervisionVisitRequired,

    // Stock
    'low stock': t.lowStockLevel,
    'stock shortage': t.lowStockLevel,
    'out of stock': t.lowStockLevel,
    'merchandise': t.lowStockLevel,

    // Payments
    'payment overdue': t.paymentOverdue,
    'overdue payment': t.paymentOverdue,

    // Cash
    'cash difference': t.cashDifferenceAlert,
    'cash shortage': t.cashDifferenceAlert,
    'difference detected': t.cashDifferenceAlert,
    'closing difference': t.cashDifferenceAlert,
    'shortage': t.cashDifferenceAlert,

    // Food Cost
    'high food cost': t.highFoodCost,
    'food cost elevated': t.highFoodCost,

    // Maintenance
    'maintenance required': t.maintenanceRequired,
    'repair needed': t.maintenanceRequired,

    // Staff
    'staff shortage': t.staffShortage,
    'understaffed': t.staffShortage,

    // Equipment
    'equipment issue': t.equipmentIssue,
    'equipment failure': t.equipmentIssue,
  }

  // Try to find a matching translation
  for (const [key, translation] of Object.entries(translationsMap)) {
    if (lowerText.includes(key)) {
      return translation
    }
  }

  // If no match found, return original text
  return text
}
