export interface ProviderBillingFormValues {
  billing_type: 'monthly_quota' | 'pay_as_you_go' | 'free_tier'
  monthly_quota_usd?: number
  quota_reset_day?: number
  quota_last_reset_at?: string
  quota_expires_at?: string
}

export function toDatetimeLocalValue(rfc3339?: string | null): string {
  if (!rfc3339) return ''
  const date = new Date(rfc3339)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function toRfc3339FromDatetimeLocal(value?: string | null): string | undefined {
  const text = value?.trim()
  if (!text) return undefined
  return new Date(text).toISOString()
}

export function buildQuotaPayloadForBillingType(form: ProviderBillingFormValues): Partial<ProviderBillingFormValues> {
  if (form.billing_type !== 'monthly_quota') {
    return {}
  }

  return {
    monthly_quota_usd: form.monthly_quota_usd,
    quota_reset_day: form.quota_reset_day,
    quota_last_reset_at: toRfc3339FromDatetimeLocal(form.quota_last_reset_at),
    quota_expires_at: toRfc3339FromDatetimeLocal(form.quota_expires_at),
  }
}
