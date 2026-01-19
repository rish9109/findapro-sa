// File: src/lib/email-templates.ts
import { supabase } from './supabase'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

export async function getEmailTemplate(templateName: string): Promise<EmailTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .single()

    if (error) {
      console.error(`Error fetching template "${templateName}":`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Error getting template "${templateName}":`, error)
    return null
  }
}

export function renderTemplate(
  template: EmailTemplate, 
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject
  let body = template.body

  // Replace all variables in both subject and body
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    subject = subject.replace(new RegExp(placeholder, 'g'), value || '')
    body = body.replace(new RegExp(placeholder, 'g'), value || '')
  })

  return { subject, body }
}

export async function getRenderedTemplate(
  templateName: string, 
  variables: Record<string, string>
): Promise<{ subject: string; body: string } | null> {
  const template = await getEmailTemplate(templateName)
  if (!template) return null
  
  return renderTemplate(template, variables)
}