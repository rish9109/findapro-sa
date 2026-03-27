// File: src/lib/admin-actions.ts - FIXED (removed reviewed_by)
import { supabase } from './supabase'

export async function approveProvider(providerId: string, adminEmail?: string) {
  try {
    // FIRST: Get the provider data before updating
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (fetchError) throw fetchError
    if (!provider) throw new Error('Provider not found')

    // THEN: Update the provider status (removed reviewed_by)
    const { error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
        // reviewed_by removed - column doesn't exist
      })
      .eq('id', providerId)

    if (updateError) throw updateError

    // FINALLY: Send email with the FULL provider data
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        provider: provider,
        adminEmail,
        action: 'approve'
      }),
    })

    const emailResult = await emailResponse.json()
    if (!emailResponse.ok) {
      console.warn('⚠️ Email notification failed:', emailResult)
    }

    return { success: true, emailSent: emailResult.success }
  } catch (error: any) {
    console.error('Error approving provider:', error)
    return { success: false, error: error.message }
  }
}

export async function rejectProvider(providerId: string, reason: string, adminEmail?: string) {
  try {
    // FIRST: Get the provider data before updating
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (fetchError) throw fetchError
    if (!provider) throw new Error('Provider not found')

    // THEN: Update the provider status (removed reviewed_by)
    const { error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
        // reviewed_by removed - column doesn't exist
      })
      .eq('id', providerId)

    if (updateError) throw updateError

    // FINALLY: Send email with the FULL provider data
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        provider: provider,
        adminEmail,
        action: 'reject',
        reason
      }),
    })

    const emailResult = await emailResponse.json()
    if (!emailResponse.ok) {
      console.warn('⚠️ Email notification failed:', emailResult)
    }

    return { success: true, emailSent: emailResult.success }
  } catch (error: any) {
    console.error('Error rejecting provider:', error)
    return { success: false, error: error.message }
  }
}

export async function pauseProvider(providerId: string, reason?: string, adminEmail?: string) {
  try {
    // FIRST: Get the provider data before updating
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (fetchError) throw fetchError
    if (!provider) throw new Error('Provider not found')

    // THEN: Update the database and RETURN the updated record (removed reviewed_by)
    const { data: updatedProvider, error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'pause',
        pause_reason: reason,
        reviewed_at: new Date().toISOString()
        // reviewed_by removed - column doesn't exist
      })
      .eq('id', providerId)
      .select()
      .single()

    if (updateError) throw updateError

    // FINALLY: Send email with the UPDATED provider data
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        provider: updatedProvider,
        adminEmail,
        action: 'pause',
        reason
      }),
    })

    const emailResult = await emailResponse.json()
    if (!emailResponse.ok) {
      console.warn('⚠️ Email notification failed:', emailResult)
    }

    return { success: true, emailSent: emailResult.success }
  } catch (error: any) {
    console.error('Error pausing provider:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteProvider(providerId: string, reason?: string, adminEmail?: string) {
  try {
    console.log('🗑️ DELETING provider:', providerId)
    
    // Get provider first (for email)
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (fetchError) throw fetchError
    if (!provider) throw new Error('Provider not found')

    // Send email to provider BEFORE deletion
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        provider: provider,
        adminEmail,
        action: 'delete',
        reason: reason || 'Account removed by admin'
      }),
    })

    const emailResult = await emailResponse.json()
    if (!emailResponse.ok) {
      console.warn('⚠️ Email notification failed:', emailResult)
    }

    // PERMANENTLY DELETE FROM DATABASE
    const { error: deleteError } = await supabase
      .from('providers')
      .delete()
      .eq('id', providerId)

    if (deleteError) throw deleteError

    return { 
      success: true,
      message: 'Provider permanently deleted',
      emailSent: emailResult.success || false
    }
  } catch (error: any) {
    console.error('Error in deleteProvider:', error)
    return { success: false, error: error.message }
  }
}

export async function reactivateProvider(providerId: string, adminEmail?: string) {
  try {
    // FIRST: Get the provider data before updating
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (fetchError) throw fetchError
    if (!provider) throw new Error('Provider not found')
    
    // THEN: Update provider status (removed reviewed_by)
    const { data: updatedProvider, error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
        // reviewed_by removed - column doesn't exist
      })
      .eq('id', providerId)
      .select()
      .single()

    if (updateError) throw updateError

    // FINALLY: Send email to provider
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        provider: updatedProvider,
        adminEmail,
        action: 'reactivate'
      }),
    })

    const emailResult = await emailResponse.json()
    if (!emailResponse.ok) {
      console.warn('⚠️ Email notification failed:', emailResult)
    }

    return { 
      success: true,
      emailSent: emailResult.success
    }
  } catch (error: any) {
    console.error('Error reactivating provider:', error)
    return { success: false, error: error.message }
  }
}

export async function resubmitProvider(providerId: string, businessName: string, contactEmail: string, adminEmail?: string) {
  try {
    console.log('🔄 Resubmitting provider:', providerId)
    
    // Send confirmation email for resubmission
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'resubmit_confirmation',
        providerId,
        businessName,
        recipientEmail: contactEmail,
        adminEmail
      }),
    })

    const emailResult = await emailResponse.json()
    if (!emailResponse.ok) {
      console.warn('⚠️ Resubmit email notification failed:', emailResult)
    }

    return { 
      success: true,
      emailSent: emailResult.success
    }
  } catch (error: any) {
    console.error('Error in resubmitProvider:', error)
    return { success: false, error: error.message }
  }
}