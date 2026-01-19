import { supabase } from './supabase'

export async function approveProvider(providerId: string, adminEmail: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update({
        status: 'approved',
        reviewed_by: adminEmail,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Approve error:', error)
    return { success: false, error }
  }
}

export async function rejectProvider(providerId: string, adminEmail: string, reason: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminEmail,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Reject error:', error)
    return { success: false, error }
  }
}

export async function pauseProvider(providerId: string, adminEmail: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update({
        status: 'paused',
        reviewed_by: adminEmail,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Pause error:', error)
    return { success: false, error }
  }
}

export async function deleteProvider(providerId: string, adminEmail: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update({
        status: 'deleted',
        reviewed_by: adminEmail,
        reviewed_at: new Date().toISOString(),
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error }
  }
}

export async function reactivateProvider(providerId: string, adminEmail: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update({
        status: 'approved',
        reviewed_by: adminEmail,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Reactivate error:', error)
    return { success: false, error }
  }
}