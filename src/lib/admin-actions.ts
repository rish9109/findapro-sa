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
    // Update the database and RETURN the updated record
    const { data: updatedProvider, error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'pause',
        pause_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()  // ← This returns the updated data
      .single()

    if (updateError) throw updateError

    // Send email with the UPDATED provider data (non-blocking)
    if (updatedProvider) {
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'status_update',
          provider: updatedProvider,  // ← Send the full updated provider
          adminEmail,
          action: 'pause',
          reason
        }),
      }).catch(error => {
        console.error('Email notification failed (pause action):', error)
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error pausing provider:', error)
    return { success: false, error: error.message }
  }
}
export async function deleteProvider(providerId: string, reason?: string, adminEmail?: string) {
  try {
    console.log('🗑️ HARD DELETING provider:', providerId)
    
    // Get provider first (for email and verification)
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching provider:', fetchError)
      throw new Error(`Provider lookup failed: ${fetchError.message}`)
    }

    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`)
    }

    console.log('📧 Sending deletion email to:', provider.contact_email)

    // Send email to provider BEFORE deletion
    const emailResponse = await fetch('/api/email', {
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

    const emailResult = await emailResponse.json()
    console.log('📧 Delete email response:', emailResult)

    // Verify email was sent (or at least attempted)
    if (!emailResponse.ok) {
      console.warn('⚠️ Email API returned error:', emailResult)
      // Decide if you want to continue with deletion or stop here
      // For now, we'll continue but log the warning
    }

    // PERMANENTLY DELETE FROM DATABASE
    console.log('🗑️ Performing HARD DELETE from database...')
    const { error: deleteError } = await supabase
      .from('providers')
      .delete()  // This PERMANENTLY removes the record
      .eq('id', providerId)

    if (deleteError) {
      console.error('❌ Database deletion error:', deleteError)
      throw new Error(`Database deletion failed: ${deleteError.message}`)
    }

    console.log('✅ Provider PERMANENTLY deleted from database:', providerId)
    console.log('📊 Deleted provider details:', {
      id: provider.id,
      business: provider.business_name,
      email: provider.contact_email,
      timestamp: new Date().toISOString()
    })

    return { 
      success: true,
      message: 'Provider permanently deleted from database',
      providerId,
      businessName: provider.business_name,
      deletedAt: new Date().toISOString(),
      emailSent: emailResult.success || false
    }
  } catch (error: any) {
    console.error('❌ CRITICAL: Error in deleteProvider:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown error during deletion',
      providerId,
      timestamp: new Date().toISOString()
    }
  }
}

export async function reactivateProvider(providerId: string, adminEmail?: string) {
  try {
    console.log('🔄 Reactivating provider:', providerId)
    
    // Update provider status
    const { data: updatedProvider, error: updateError } = await supabase
      .from('providers')
      .update({ 
        status: 'approved',
        // Add reactivation timestamp if you have this column
        // reactivated_at: new Date().toISOString()
      })
      .eq('id', providerId)
      .select()
      .single()

    if (updateError) throw updateError

    if (!updatedProvider) {
      throw new Error('Provider not found or not updated')
    }

    console.log('✅ Provider updated successfully, sending reactivation email...')

    // Send email to provider
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'status_update',
        providerId,
        adminEmail,
        action: 'reactivate'
      }),
    })

    const emailResult = await emailResponse.json()
    console.log('📧 Reactivation email sent:', emailResult)

    return { 
      success: true,
      message: 'Provider reactivated successfully',
      provider: updatedProvider,
      emailSent: emailResult.success
    }
  } catch (error: any) {
    console.error('❌ Error reactivating provider:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown error'
    }
  }
}