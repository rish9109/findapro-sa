// File: src/lib/admin-actions.ts - WORKING VERSION
import { supabase } from './supabase'

export async function approveProvider(providerId: string, adminEmail?: string) {
  try {
    const { error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', providerId)

    if (updateError) throw updateError

    // Send email to provider
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        adminEmail,
        action: 'approve'
      }),
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error approving provider:', error)
    return { success: false, error: error.message }
  }
}

export async function rejectProvider(providerId: string, reason: string, adminEmail?: string) {
  try {
    const { error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', providerId)

    if (updateError) throw updateError

    // Send email to provider
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        adminEmail,
        action: 'reject',
        reason
      }),
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error rejecting provider:', error)
    return { success: false, error: error.message }
  }
}

export async function pauseProvider(providerId: string, reason?: string, adminEmail?: string) {
  try {
    const { error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'paused',
        pause_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', providerId)

    if (updateError) throw updateError

    // Send email to provider
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        adminEmail,
        action: 'pause',
        reason
      }),
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error pausing provider:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteProvider(providerId: string, reason?: string, adminEmail?: string) {
  try {
    // Get provider first
    const { data: provider } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (!provider) throw new Error('Provider not found')

    // Send email to provider
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        adminEmail,
        action: 'delete',
        reason: reason || 'Account removed by admin'
      }),
    })

    // Update provider status
    const { error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deletion_reason: reason
      })
      .eq('id', providerId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting provider:', error)
    return { success: false, error: error.message }
  }
}

export async function reactivateProvider(providerId: string, adminEmail?: string) {
  try {
    const { error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'approved',
        reactivated_at: new Date().toISOString(),
        deleted_at: null,
        deletion_reason: null
      })
      .eq('id', providerId)

    if (updateError) throw updateError

    // Send email to provider
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        adminEmail,
        action: 'reactivate'
      }),
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error reactivating provider:', error)
    return { success: false, error: error.message }
  }
}