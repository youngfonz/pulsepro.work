interface ParsedTask {
  title: string
  description?: string
  priority?: string
  dueDate?: string
}

interface ParsedProject {
  name: string
  description?: string
  priority?: string
  dueDate?: string
  budget?: number
}

interface ParsedClient {
  name: string
  email?: string
  company?: string
  phone?: string
}

/**
 * Parse priority keywords from text
 */
export function parsePriority(text: string): string | undefined {
  const lowerText = text.toLowerCase()

  if (
    lowerText.includes('high priority') ||
    lowerText.includes('urgent') ||
    lowerText.includes('critical')
  ) {
    return 'high'
  }

  if (lowerText.includes('low priority')) {
    return 'low'
  }

  if (lowerText.includes('medium priority') || lowerText.includes('normal priority')) {
    return 'medium'
  }

  return undefined
}

/**
 * Parse common date phrases into Date objects
 */
export function parseDate(dateStr: string): Date | undefined {
  const lowerDateStr = dateStr.toLowerCase().trim()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Today
  if (lowerDateStr === 'today') {
    return today
  }

  // Tomorrow
  if (lowerDateStr === 'tomorrow') {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  // "in X days/weeks/months"
  const inPattern = /in (\d+) (day|week|month)s?/i
  const inMatch = lowerDateStr.match(inPattern)
  if (inMatch) {
    const amount = parseInt(inMatch[1])
    const unit = inMatch[2]
    const future = new Date(today)

    if (unit === 'day') {
      future.setDate(future.getDate() + amount)
    } else if (unit === 'week') {
      future.setDate(future.getDate() + amount * 7)
    } else if (unit === 'month') {
      future.setMonth(future.getMonth() + amount)
    }

    return future
  }

  // "next Monday", "next Tuesday", etc.
  const nextDayPattern = /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  const nextDayMatch = lowerDateStr.match(nextDayPattern)
  if (nextDayMatch) {
    const dayName = nextDayMatch[1].toLowerCase()
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = daysOfWeek.indexOf(dayName)
    const currentDay = today.getDay()

    let daysUntil = targetDay - currentDay
    if (daysUntil <= 0) {
      daysUntil += 7
    }

    const nextDate = new Date(today)
    nextDate.setDate(nextDate.getDate() + daysUntil)
    return nextDate
  }

  // "January 15", "February 3", etc.
  const monthDayPattern = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?/i
  const monthDayMatch = lowerDateStr.match(monthDayPattern)
  if (monthDayMatch) {
    const monthName = monthDayMatch[1].toLowerCase()
    const day = parseInt(monthDayMatch[2])
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    const month = months.indexOf(monthName)

    const year = today.getFullYear()
    const date = new Date(year, month, day)

    // If the date is in the past, assume next year
    if (date < today) {
      date.setFullYear(year + 1)
    }

    return date
  }

  return undefined
}

/**
 * Extract date phrase from text and return both the date and cleaned text
 */
function extractDate(text: string): { date?: Date; cleanedText: string } {
  const lowerText = text.toLowerCase()

  // Common date patterns to look for
  const datePatterns = [
    /due\s+(today|tomorrow)/i,
    /due\s+in\s+\d+\s+(day|week|month)s?/i,
    /due\s+next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /due\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?/i,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const dateStr = match[0].replace(/^due\s+/i, '')
      const date = parseDate(dateStr)
      const cleanedText = text.replace(pattern, '').trim()
      return { date, cleanedText }
    }
  }

  return { date: undefined, cleanedText: text }
}

/**
 * Parse task details from voice transcript
 */
export function parseTaskFromVoice(transcript: string): ParsedTask {
  let text = transcript.trim()

  // Extract priority
  const priority = parsePriority(text)
  if (priority) {
    text = text.replace(/(high|medium|low|urgent|critical)\s*priority/gi, '').trim()
  }

  // Extract date
  const { date: dueDate, cleanedText } = extractDate(text)
  text = cleanedText

  // Remove common prefixes like "create task", "add task", "new task"
  text = text.replace(/^(create|add|new)\s+(task|todo)?\s*/i, '').trim()

  // Extract description (text after "with description" or "description")
  let description: string | undefined
  const descPattern = /(\s+with\s+description\s+|\s+description\s+)(.+)/i
  const descMatch = text.match(descPattern)
  if (descMatch) {
    description = descMatch[2].trim()
    text = text.replace(descPattern, '').trim()
  }

  // The remaining text is the title
  const title = text || 'Untitled Task'

  return {
    title,
    description,
    priority,
    dueDate: dueDate?.toISOString().split('T')[0],
  }
}

/**
 * Parse project details from voice transcript
 */
export function parseProjectFromVoice(transcript: string): ParsedProject {
  let text = transcript.trim()

  // Extract priority
  const priority = parsePriority(text)
  if (priority) {
    text = text.replace(/(high|medium|low|urgent|critical)\s*priority/gi, '').trim()
  }

  // Extract date
  const { date: dueDate, cleanedText } = extractDate(text)
  text = cleanedText

  // Extract budget (e.g., "budget $5000" or "budget 5000")
  let budget: number | undefined
  const budgetPattern = /budget\s+\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/i
  const budgetMatch = text.match(budgetPattern)
  if (budgetMatch) {
    budget = parseFloat(budgetMatch[1].replace(/,/g, ''))
    text = text.replace(budgetPattern, '').trim()
  }

  // Remove common prefixes like "create project", "add project", "new project"
  text = text.replace(/^(create|add|new)\s+(project|client\s+project)?\s*/i, '').trim()

  // Extract description (text after "with description" or "description")
  let description: string | undefined
  const descPattern = /(\s+with\s+description\s+|\s+description\s+)(.+)/i
  const descMatch = text.match(descPattern)
  if (descMatch) {
    description = descMatch[2].trim()
    text = text.replace(descPattern, '').trim()
  }

  // The remaining text is the project name
  const name = text || 'Untitled Project'

  return {
    name,
    description,
    priority,
    dueDate: dueDate?.toISOString().split('T')[0],
    budget,
  }
}

/**
 * Parse client details from voice transcript
 */
export function parseClientFromVoice(transcript: string): ParsedClient {
  let text = transcript.trim()

  // Remove common prefixes
  text = text.replace(/^(create|add|new)\s+(client)?\s*/i, '').trim()

  // Extract email (e.g., "email john@example.com")
  let email: string | undefined
  const emailPattern = /\b(?:email|e-mail)\s+(\S+@\S+\.\S+)/i
  const emailMatch = text.match(emailPattern)
  if (emailMatch) {
    email = emailMatch[1]
    text = text.replace(emailPattern, '').trim()
  }

  // Extract phone (e.g., "phone 555-123-4567" or "phone +1 555 123 4567")
  let phone: string | undefined
  const phonePattern = /\b(?:phone|call|number)\s+([\d\s\-+().]{7,})/i
  const phoneMatch = text.match(phonePattern)
  if (phoneMatch) {
    phone = phoneMatch[1].trim()
    text = text.replace(phonePattern, '').trim()
  }

  // Extract company (e.g., "company Acme Inc")
  let company: string | undefined
  const companyPattern = /\b(?:company|org|organization)\s+(.+?)(?=\s+(?:email|phone|call|number)|$)/i
  const companyMatch = text.match(companyPattern)
  if (companyMatch) {
    company = companyMatch[1].trim()
    text = text.replace(companyPattern, '').trim()
  }

  // The remaining text is the client name
  const name = text || 'Untitled Client'

  return {
    name,
    email,
    company,
    phone,
  }
}
